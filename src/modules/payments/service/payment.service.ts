/**
 * Payment Service
 * 
 * Central business logic for all payment operations.
 * NEVER trust frontend. Only webhook or server-side verification
 * can mark a payment as COMPLETED.
 * 
 * Architecture:
 * Controller → Service → Provider (Cashfree)
 *                 ↓
 *            Prisma DB
 */

import { PrismaClient, Prisma } from '@prisma/client';
import { logger } from '../../../utils/logger';
import { PaymentProviderInterface } from '../providers/payment-provider.interface';
import { CashfreeProvider } from '../providers/cashfree/cashfree.provider';
import { RazorpayProvider } from '../providers/razorpay/razorpay.provider';
import { config } from '../../../config';

const prisma = new PrismaClient();

// ─── Provider Registry ──────────────────────────────────────────
// Future gateways (Razorpay, Stripe) are added here.
const providers: Record<string, PaymentProviderInterface> = {
    CASHFREE: new CashfreeProvider(),
    RAZORPAY: new RazorpayProvider(),
};

function getProvider(gateway: string): PaymentProviderInterface {
    const provider = providers[gateway];
    if (!provider) {
        throw new Error(`Payment provider "${gateway}" is not registered`);
    }
    return provider;
}

// ─── Types ──────────────────────────────────────────────────────

export interface CreatePaymentSessionInput {
    orderId: string;
    gateway?: string;
    customerName: string;
    customerEmail: string;
    customerPhone: string;
    paymentSource: string;          // POS, STUDENT_APP, QR
}

export interface PaymentWebhookData {
    eventType: string;
    gatewayOrderId: string;
    orderId: string;
    orderAmount: number;
    paymentStatus: string;
    transactionId?: string;
    paymentMethod?: string;
    bankReference?: string;
    paymentTime?: string;
    rawPayload: any;
}

// ─── Service Functions ──────────────────────────────────────────

/**
 * Create a payment session with the gateway.
 * 
 * Flow:
 * 1. Fetch order from DB, validate it exists and is unpaid
 * 2. Create payment record in PENDING state
 * 3. Call gateway to create a session
 * 4. Update payment record with gateway details (INITIATED)
 * 5. Return session info to frontend
 */
export async function createPaymentSession(input: CreatePaymentSessionInput) {
    const gateway = input.gateway || 'RAZORPAY';
    const provider = getProvider(gateway);

    // 1. Fetch and validate the order
    const order = await prisma.order.findUnique({
        where: { id: input.orderId },
        include: { payments: true },
    });

    if (!order) {
        throw new Error('Order not found');
    }

    // Prevent double payment
    const existingSuccess = order.payments.find(
        (p: any) => p.status === 'COMPLETED' && p.webhookVerified,
    );
    if (existingSuccess) {
        throw new Error('Order already has a successful payment');
    }

    const totalAmount = Number(order.totalAmount);
    if (totalAmount <= 0) {
        throw new Error('Invalid order amount');
    }

    // Generate unique idempotency key
    const idempotencyKey = `${order.id}_${gateway}_${Date.now()}`;

    // 2. Create payment record in PENDING state
    const payment = await prisma.payment.create({
        data: {
            orderId: order.id,
            gateway: gateway as any,
            method: 'ONLINE',
            amount: totalAmount,
            currency: 'INR',
            status: 'PENDING',
            idempotencyKey,
            metadata: {
                paymentSource: input.paymentSource,
                customerName: input.customerName,
                customerEmail: input.customerEmail,
                customerPhone: input.customerPhone,
            },
        },
    });

    // 3. Call provider to create session
    try {
        const session = await provider.createPaymentSession({
            orderId: order.orderNumber,             // Use order number as reference
            orderAmount: totalAmount,
            orderCurrency: 'INR',
            customerName: input.customerName,
            customerEmail: input.customerEmail,
            customerPhone: input.customerPhone,
            returnUrl: config.cashfree.returnUrl,
            orderNote: `POS-SATHI | Order #${order.orderNumber}`,
            metadata: { internalOrderId: order.id, paymentId: payment.id },
        });

        // 4. Update payment with gateway details → INITIATED
        await prisma.payment.update({
            where: { id: payment.id },
            data: {
                gatewayOrderId: session.gatewayOrderId,
                paymentSessionId: session.paymentSessionId,
                paymentLink: session.paymentLink,
                status: 'INITIATED',
                gatewayResponse: session as any,
            },
        });

        // Update order status to PENDING_PAYMENT
        await prisma.order.update({
            where: { id: order.id },
            data: {
                paymentStatus: 'INITIATED',
                status: 'PENDING_PAYMENT',
                orderSource: input.paymentSource,
            },
        });

        logger.info(`Payment session created: payment=${payment.id}, cf_order=${session.gatewayOrderId}`);

        return {
            paymentId: payment.id,
            orderId: order.id,
            orderNumber: order.orderNumber,
            amount: totalAmount,
            currency: 'INR',
            gateway,
            paymentSessionId: session.paymentSessionId,
            gatewayOrderId: session.gatewayOrderId,
            paymentLink: session.paymentLink,
            status: 'INITIATED',
        };
    } catch (error: any) {
        // Mark payment as failed if session creation fails
        await prisma.payment.update({
            where: { id: payment.id },
            data: {
                status: 'FAILED',
                failureReason: error.message,
                errorCode: 'SESSION_CREATION_FAILED',
            },
        });

        logger.error(`Payment session creation failed: ${error.message}`);
        throw error;
    }
}

/**
 * Process a webhook event from the payment gateway.
 * 
 * CRITICAL SECURITY:
 * 1. Signature already verified in the webhook handler before reaching here
 * 2. Amount verified against our DB to prevent manipulation
 * 3. Idempotent: duplicate webhooks for same event are safely ignored
 * 4. Only this function marks payments as COMPLETED
 */
export async function processWebhookEvent(data: PaymentWebhookData) {
    const gatewayOrderId = data.gatewayOrderId;

    // 1. Find the payment by gateway order ID
    const payment = await prisma.payment.findFirst({
        where: { gatewayOrderId },
        include: { order: true },
    });

    if (!payment) {
        logger.warn(`[Webhook] Payment not found for gateway order: ${gatewayOrderId}`);
        return { processed: false, reason: 'Payment record not found' };
    }

    // 2. Idempotency check: skip if already processed to this status
    if (payment.status === 'COMPLETED' && data.paymentStatus === 'SUCCESS') {
        logger.info(`[Webhook] Duplicate SUCCESS webhook for payment: ${payment.id}`);
        return { processed: false, reason: 'Already processed' };
    }

    if (payment.status === 'FAILED' && data.paymentStatus === 'FAILED') {
        logger.info(`[Webhook] Duplicate FAILED webhook for payment: ${payment.id}`);
        return { processed: false, reason: 'Already processed' };
    }

    // 3. Handle based on payment status from webhook
    if (data.paymentStatus === 'SUCCESS' || data.paymentStatus === 'PAID') {
        return await handlePaymentSuccess(payment, data);
    } else if (data.paymentStatus === 'FAILED' || data.paymentStatus === 'CANCELLED') {
        return await handlePaymentFailure(payment, data);
    } else if (data.paymentStatus === 'USER_DROPPED') {
        return await handlePaymentDropped(payment, data);
    }

    logger.info(`[Webhook] Unhandled payment status: ${data.paymentStatus}`);
    return { processed: false, reason: `Unhandled status: ${data.paymentStatus}` };
}

/**
 * Handle successful payment from webhook.
 * 
 * AMOUNT VERIFICATION: We compare the webhook amount against our
 * DB amount to detect any tampering. Only exact match passes.
 */
async function handlePaymentSuccess(payment: any, data: PaymentWebhookData) {
    // CRITICAL: Verify amount matches
    const expectedAmount = Number(payment.amount);
    const receivedAmount = Number(data.orderAmount);
    const amountVerified = Math.abs(expectedAmount - receivedAmount) < 0.01;

    if (!amountVerified) {
        logger.error(
            `[Webhook] AMOUNT MISMATCH! Expected: ${expectedAmount}, Received: ${receivedAmount}, Payment: ${payment.id}`,
        );
        await prisma.payment.update({
            where: { id: payment.id },
            data: {
                status: 'FAILED',
                failureReason: `Amount mismatch: expected ${expectedAmount}, received ${receivedAmount}`,
                errorCode: 'AMOUNT_MISMATCH',
                webhookPayload: data.rawPayload,
                webhookVerified: true,
                amountVerified: false,
            },
        });
        return { processed: true, reason: 'Amount mismatch - flagged' };
    }

    // Map payment method from Cashfree
    const methodMap: Record<string, string> = {
        UPI: 'UPI',
        CARD: 'CARD',
        NET_BANKING: 'NET_BANKING',
        WALLET: 'WALLET',
    };
    const paymentMethod = methodMap[data.paymentMethod || ''] || 'ONLINE';

    // Update payment record atomically
    await prisma.$transaction(async (tx: any) => {
        // Update payment
        await tx.payment.update({
            where: { id: payment.id },
            data: {
                status: 'COMPLETED',
                transactionId: data.transactionId,
                bankReference: data.bankReference,
                paymentMethodDetail: data.paymentMethod,
                method: paymentMethod as any,
                webhookVerified: true,
                amountVerified: true,
                webhookPayload: data.rawPayload,
            },
        });

        // Update order
        await tx.order.update({
            where: { id: payment.orderId },
            data: {
                paymentStatus: 'COMPLETED',
                paymentMethod: paymentMethod as any,
                status: 'CONFIRMED',
            },
        });
    });

    logger.info(
        `[Webhook] PAYMENT_SUCCESS: order=${payment.orderId}, txn=${data.transactionId}, amount=${receivedAmount}`,
    );

    return {
        processed: true,
        reason: 'Payment marked as completed',
        orderId: payment.orderId,
        event: 'PAYMENT_SUCCESS',
    };
}

async function handlePaymentFailure(payment: any, data: PaymentWebhookData) {
    await prisma.$transaction(async (tx: any) => {
        await tx.payment.update({
            where: { id: payment.id },
            data: {
                status: 'FAILED',
                failureReason: data.paymentStatus,
                webhookVerified: true,
                webhookPayload: data.rawPayload,
            },
        });

        await tx.order.update({
            where: { id: payment.orderId },
            data: {
                paymentStatus: 'FAILED',
                status: 'CANCELLED',
                cancelReason: `Payment failed: ${data.paymentStatus}`,
                cancelledAt: new Date(),
            },
        });
    });

    logger.info(`[Webhook] PAYMENT_FAILED: order=${payment.orderId}, reason=${data.paymentStatus}`);

    return {
        processed: true,
        reason: 'Payment marked as failed',
        orderId: payment.orderId,
        event: 'PAYMENT_FAILED',
    };
}

async function handlePaymentDropped(payment: any, data: PaymentWebhookData) {
    await prisma.payment.update({
        where: { id: payment.id },
        data: {
            status: 'FAILED',
            failureReason: 'User dropped the payment',
            webhookVerified: true,
            webhookPayload: data.rawPayload,
        },
    });

    logger.info(`[Webhook] PAYMENT_DROPPED: order=${payment.orderId}`);

    return {
        processed: true,
        reason: 'Payment dropped by user',
        orderId: payment.orderId,
        event: 'PAYMENT_DROPPED',
    };
}

/**
 * Get payment status from our DB.
 * If the payment is still PENDING/INITIATED, also poll the gateway
 * as a fallback for delayed webhooks.
 */
export async function getPaymentStatus(orderId: string) {
    const order = await prisma.order.findUnique({
        where: { id: orderId },
        include: {
            payments: {
                orderBy: { createdAt: 'desc' },
                take: 5,
            },
        },
    });

    if (!order) {
        throw new Error('Order not found');
    }

    const latestPayment = order.payments[0];

    // If payment is still pending, try server-side verification
    if (
        latestPayment &&
        latestPayment.gatewayOrderId &&
        (latestPayment.status === 'PENDING' || latestPayment.status === 'INITIATED')
    ) {
        try {
            const gateway = latestPayment.gateway as string;
            const provider = getProvider(gateway);
            const verification = await provider.verifyPayment({
                gatewayOrderId: latestPayment.gatewayOrderId,
            });

            // If gateway says PAID, process it
            if (verification.success) {
                logger.info(`[Verify] Payment confirmed server-side for order: ${orderId}`);

                await handlePaymentSuccess(
                    { ...latestPayment, order },
                    {
                        eventType: 'SERVER_VERIFICATION',
                        gatewayOrderId: latestPayment.gatewayOrderId,
                        orderId: order.id,
                        orderAmount: verification.orderAmount,
                        paymentStatus: 'SUCCESS',
                        transactionId: verification.transactionId,
                        paymentMethod: verification.paymentMethod,
                        bankReference: verification.bankReference,
                        rawPayload: { source: 'server_verification', data: verification },
                    },
                );

                // Re-fetch after update
                const updated = await prisma.order.findUnique({
                    where: { id: orderId },
                    include: { payments: { orderBy: { createdAt: 'desc' }, take: 5 } },
                });
                return formatPaymentStatus(updated!);
            }
        } catch (error: any) {
            logger.warn(`[Verify] Server-side verification failed: ${error.message}`);
        }
    }

    return formatPaymentStatus(order);
}

function formatPaymentStatus(order: any) {
    const payment = order.payments?.[0];
    return {
        orderId: order.id,
        orderNumber: order.orderNumber,
        orderStatus: order.status,
        paymentStatus: order.paymentStatus,
        totalAmount: Number(order.totalAmount),
        payment: payment
            ? {
                id: payment.id,
                gateway: payment.gateway,
                gatewayOrderId: payment.gatewayOrderId,
                method: payment.method,
                status: payment.status,
                transactionId: payment.transactionId,
                bankReference: payment.bankReference,
                paymentMethodDetail: payment.paymentMethodDetail,
                amount: Number(payment.amount),
                webhookVerified: payment.webhookVerified,
                amountVerified: payment.amountVerified,
                failureReason: payment.failureReason,
                createdAt: payment.createdAt,
                updatedAt: payment.updatedAt,
            }
            : null,
        allPayments: order.payments?.map((p: any) => ({
            id: p.id,
            status: p.status,
            method: p.method,
            amount: Number(p.amount),
            createdAt: p.createdAt,
        })),
    };
}

/**
 * Admin: List all payments with filters.
 */
export async function listPayments(filters: {
    page?: number;
    limit?: number;
    status?: string;
    gateway?: string;
    fromDate?: string;
    toDate?: string;
}) {
    const page = filters.page || 1;
    const limit = filters.limit || 20;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (filters.status) where.status = filters.status;
    if (filters.gateway) where.gateway = filters.gateway;
    if (filters.fromDate || filters.toDate) {
        where.createdAt = {};
        if (filters.fromDate) where.createdAt.gte = new Date(filters.fromDate);
        if (filters.toDate) where.createdAt.lte = new Date(filters.toDate);
    }

    const [payments, total] = await Promise.all([
        prisma.payment.findMany({
            where,
            include: {
                order: {
                    select: {
                        id: true,
                        orderNumber: true,
                        customerName: true,
                        totalAmount: true,
                        status: true,
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
            skip,
            take: limit,
        }),
        prisma.payment.count({ where }),
    ]);

    return {
        payments: payments.map((p: any) => ({
            ...p,
            amount: Number(p.amount),
            refundAmount: p.refundAmount ? Number(p.refundAmount) : null,
        })),
        pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit),
        },
    };
}

/**
 * Get webhook logs for debugging.
 */
export async function getWebhookLogs(filters: { gateway?: string; limit?: number }) {
    return prisma.paymentWebhookLog.findMany({
        where: filters.gateway ? { gateway: filters.gateway } : {},
        orderBy: { createdAt: 'desc' },
        take: filters.limit || 50,
    });
}
