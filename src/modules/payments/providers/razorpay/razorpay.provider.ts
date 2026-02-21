/**
 * Razorpay Payment Provider
 * 
 * Implements PaymentProviderInterface for Razorpay Payment Gateway.
 * Uses Razorpay Node SDK (automatically available via peer dependency).
 */

import Razorpay from 'razorpay';
import crypto from 'crypto';
import { config } from '../../../../config';
import { logger } from '../../../../utils/logger';
import {
    PaymentProviderInterface,
    CreateSessionInput,
    CreateSessionOutput,
    VerifyPaymentInput,
    VerifyPaymentOutput,
    WebhookVerifyInput,
    RefundInput,
    RefundOutput,
} from '../payment-provider.interface';

export class RazorpayProvider implements PaymentProviderInterface {
    readonly providerName = 'RAZORPAY';
    private razorpay: Razorpay;

    constructor() {
        this.razorpay = new Razorpay({
            key_id: config.razorpay.keyId,
            key_secret: config.razorpay.keySecret,
        });

        if (!config.razorpay.keyId || !config.razorpay.keySecret) {
            logger.warn('Razorpay credentials not configured. Payment gateway will not work.');
        }
    }

    /**
     * Create an order with Razorpay.
     * The returned gatewayOrderId is used by the frontend to open the checkout.
     */
    async createPaymentSession(input: CreateSessionInput): Promise<CreateSessionOutput> {
        logger.info(`[Razorpay] Creating order for internal order: ${input.orderId}`);

        try {
            const options = {
                amount: Math.round(input.orderAmount * 100), // Razorpay expected amount in paise
                currency: input.orderCurrency || 'INR',
                receipt: input.orderId,
                notes: {
                    internalOrderId: input.metadata?.internalOrderId,
                    paymentId: input.metadata?.paymentId,
                    customerName: input.customerName,
                    customerEmail: input.customerEmail,
                    customerPhone: input.customerPhone,
                },
            };

            const order = await this.razorpay.orders.create(options);

            logger.info(`[Razorpay] Order created: ${order.id}`);

            return {
                success: true,
                gatewayOrderId: order.id,
                paymentSessionId: order.id, // Razorpay uses order_id for checkout
                paymentLink: undefined,
                orderStatus: order.status,
                expiresAt: undefined,
            };
        } catch (error: any) {
            logger.error(`[Razorpay] Order creation failed:`, error);
            throw new Error(`Razorpay order creation failed: ${error.error?.description || error.message}`);
        }
    }

    /**
     * Verify payment status directly from Razorpay.
     */
    async verifyPayment(input: VerifyPaymentInput): Promise<VerifyPaymentOutput> {
        logger.info(`[Razorpay] Verifying payment for order: ${input.gatewayOrderId}`);

        try {
            const order = await this.razorpay.orders.fetch(input.gatewayOrderId);
            const payments = await this.razorpay.orders.fetchPayments(input.gatewayOrderId);

            let latestPayment = null;
            if (payments.items && payments.items.length > 0) {
                // Find latest successful or authorized payment
                latestPayment = payments.items.find((p: any) => p.status === 'captured') || payments.items[0];
            }

            return {
                success: order.status === 'paid',
                orderId: order.receipt as string,
                orderStatus: order.status.toUpperCase(),
                orderAmount: Number(order.amount) / 100,
                paymentMethod: latestPayment?.method?.toUpperCase(),
                transactionId: latestPayment?.id,
                bankReference: latestPayment?.acquirer_data?.bank_transaction_id,
                paymentTime: latestPayment?.created_at ? new Date(latestPayment.created_at * 1000).toISOString() : undefined,
            };
        } catch (error: any) {
            logger.error(`[Razorpay] Payment verification failed:`, error);
            throw new Error(`Razorpay payment verification failed: ${error.message}`);
        }
    }

    /**
     * Verify webhook signature.
     */
    verifyWebhookSignature(input: WebhookVerifyInput): boolean {
        try {
            const secret = config.razorpay.webhookSecret;
            const body = typeof input.rawBody === 'string' ? input.rawBody : input.rawBody.toString('utf8');

            const expectedSignature = crypto
                .createHmac('sha256', secret)
                .update(body)
                .digest('hex');

            const isValid = crypto.timingSafeEqual(
                Buffer.from(expectedSignature),
                Buffer.from(input.signature)
            );

            if (!isValid) {
                logger.warn('[Razorpay] Webhook signature verification FAILED');
            }

            return isValid;
        } catch (error: any) {
            logger.error(`[Razorpay] Signature verification error: ${error.message}`);
            return false;
        }
    }

    /**
     * Initiate a refund via Razorpay.
     */
    async initiateRefund(input: RefundInput): Promise<RefundOutput> {
        logger.info(`[Razorpay] Initiating refund for order: ${input.gatewayOrderId}`);

        try {
            // Razorpay needs payment_id for refund, but our interface uses gatewayOrderId (order_id)
            // We have to fetch payments for this order first
            const payments = await this.razorpay.orders.fetchPayments(input.gatewayOrderId);
            const capturedPayment = payments.items.find((p: any) => p.status === 'captured');

            if (!capturedPayment) {
                throw new Error('No captured payment found for this order to refund');
            }

            const refund = await this.razorpay.payments.refund(capturedPayment.id, {
                amount: Math.round(input.refundAmount * 100),
                notes: {
                    refundId: input.refundId,
                    reason: input.reason || 'Requested by customer',
                },
            });

            return {
                success: true,
                refundId: refund.id,
                refundStatus: refund.status,
                refundAmount: Number(refund.amount) / 100,
            };
        } catch (error: any) {
            logger.error(`[Razorpay] Refund failed:`, error);
            throw new Error(`Razorpay refund failed: ${error.message}`);
        }
    }
}
