/**
 * Cashfree Payment Provider
 * 
 * Implements PaymentProviderInterface for Cashfree Payment Gateway.
 * Uses Cashfree PG Node SDK for order creation and verification.
 * Webhook signature verification uses HMAC-SHA256 as per Cashfree docs.
 */

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

// Cashfree API base URLs
const CF_BASE_URL = {
    sandbox: 'https://sandbox.cashfree.com/pg',
    production: 'https://api.cashfree.com/pg',
};

export class CashfreeProvider implements PaymentProviderInterface {
    readonly providerName = 'CASHFREE';
    private readonly baseUrl: string;
    private readonly appId: string;
    private readonly secretKey: string;
    private readonly webhookSecret: string;

    constructor() {
        this.appId = config.cashfree.appId;
        this.secretKey = config.cashfree.secretKey;
        this.webhookSecret = config.cashfree.webhookSecret;
        this.baseUrl = CF_BASE_URL[config.cashfree.environment] || CF_BASE_URL.sandbox;

        if (!this.appId || !this.secretKey) {
            logger.warn('Cashfree credentials not configured. Payment gateway will not work.');
        }
    }

    /**
     * Create a payment session (order) with Cashfree.
     * The returned paymentSessionId is used by the frontend to open the checkout.
     */
    async createPaymentSession(input: CreateSessionInput): Promise<CreateSessionOutput> {
        const requestBody = {
            order_id: input.orderId,
            order_amount: input.orderAmount,
            order_currency: input.orderCurrency || 'INR',
            customer_details: {
                customer_id: input.customerPhone || `CUST_${Date.now()}`,
                customer_name: input.customerName,
                customer_email: input.customerEmail,
                customer_phone: input.customerPhone,
            },
            order_meta: {
                return_url: `${input.returnUrl}?order_id={order_id}`,
                notify_url: input.notifyUrl || undefined,
            },
            order_note: input.orderNote || `POS-SATHI Order ${input.orderId}`,
        };

        logger.info(`[Cashfree] Creating payment session for order: ${input.orderId}`);

        const response = await fetch(`${this.baseUrl}/orders`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-version': '2023-08-01',
                'x-client-id': this.appId,
                'x-client-secret': this.secretKey,
            },
            body: JSON.stringify(requestBody),
        });

        const data: any = await response.json();

        if (!response.ok) {
            logger.error(`[Cashfree] Order creation failed:`, { status: response.status, error: data });
            throw new Error(`Cashfree order creation failed: ${data.message || JSON.stringify(data)}`);
        }

        logger.info(`[Cashfree] Payment session created: ${data.cf_order_id}`);

        return {
            success: true,
            gatewayOrderId: data.cf_order_id,
            paymentSessionId: data.payment_session_id,
            paymentLink: data.payment_link || undefined,
            orderStatus: data.order_status,
            expiresAt: data.order_expiry_time,
        };
    }

    /**
     * Verify payment status directly from Cashfree.
     * This is the server-side fallback when webhooks are delayed.
     */
    async verifyPayment(input: VerifyPaymentInput): Promise<VerifyPaymentOutput> {
        logger.info(`[Cashfree] Verifying payment for cf_order: ${input.gatewayOrderId}`);

        const response = await fetch(`${this.baseUrl}/orders/${input.gatewayOrderId}`, {
            method: 'GET',
            headers: {
                'x-api-version': '2023-08-01',
                'x-client-id': this.appId,
                'x-client-secret': this.secretKey,
            },
        });

        const data: any = await response.json();

        if (!response.ok) {
            logger.error(`[Cashfree] Payment verification failed:`, { error: data });
            throw new Error(`Payment verification failed: ${data.message || 'Unknown error'}`);
        }

        // Get payment details (latest payment attempt)
        let paymentMethod: string | undefined;
        let transactionId: string | undefined;
        let bankReference: string | undefined;
        let paymentTime: string | undefined;

        try {
            const paymentsRes = await fetch(
                `${this.baseUrl}/orders/${input.gatewayOrderId}/payments`,
                {
                    method: 'GET',
                    headers: {
                        'x-api-version': '2023-08-01',
                        'x-client-id': this.appId,
                        'x-client-secret': this.secretKey,
                    },
                },
            );
            const paymentsData: any = await paymentsRes.json();

            if (Array.isArray(paymentsData) && paymentsData.length > 0) {
                const latestPayment = paymentsData[paymentsData.length - 1];
                transactionId = latestPayment.cf_payment_id?.toString();
                bankReference = latestPayment.bank_reference;
                paymentTime = latestPayment.payment_time;

                if (latestPayment.payment_method) {
                    const pm = latestPayment.payment_method;
                    if (pm.upi) paymentMethod = 'UPI';
                    else if (pm.card) paymentMethod = 'CARD';
                    else if (pm.netbanking) paymentMethod = 'NET_BANKING';
                    else if (pm.wallet) paymentMethod = 'WALLET';
                    else paymentMethod = 'ONLINE';
                }
            }
        } catch (err: any) {
            logger.warn(`[Cashfree] Could not fetch payment details: ${err.message}`);
        }

        return {
            success: data.order_status === 'PAID',
            orderId: data.order_id,
            orderStatus: data.order_status,
            orderAmount: data.order_amount,
            paymentMethod,
            transactionId,
            bankReference,
            paymentTime,
        };
    }

    /**
     * Verify webhook signature using HMAC-SHA256.
     * Cashfree sends timestamp + signature in headers.
     * We compute HMAC on the raw body and compare.
     */
    verifyWebhookSignature(input: WebhookVerifyInput): boolean {
        try {
            const rawBody = typeof input.rawBody === 'string'
                ? input.rawBody
                : input.rawBody.toString('utf8');

            const computedSignature = crypto
                .createHmac('sha256', this.webhookSecret)
                .update(input.timestamp + rawBody)
                .digest('base64');

            const isValid = crypto.timingSafeEqual(
                Buffer.from(computedSignature),
                Buffer.from(input.signature),
            );

            if (!isValid) {
                logger.warn('[Cashfree] Webhook signature verification FAILED');
            }

            return isValid;
        } catch (error: any) {
            logger.error(`[Cashfree] Signature verification error: ${error.message}`);
            return false;
        }
    }

    /**
     * Initiate a refund via Cashfree.
     */
    async initiateRefund(input: RefundInput): Promise<RefundOutput> {
        logger.info(`[Cashfree] Initiating refund for cf_order: ${input.gatewayOrderId}`);

        const response = await fetch(
            `${this.baseUrl}/orders/${input.gatewayOrderId}/refunds`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-version': '2023-08-01',
                    'x-client-id': this.appId,
                    'x-client-secret': this.secretKey,
                },
                body: JSON.stringify({
                    refund_amount: input.refundAmount,
                    refund_id: input.refundId,
                    refund_note: input.reason || 'Refund initiated',
                }),
            },
        );

        const data: any = await response.json();

        if (!response.ok) {
            logger.error(`[Cashfree] Refund failed:`, { error: data });
            throw new Error(`Refund failed: ${data.message || 'Unknown error'}`);
        }

        return {
            success: true,
            refundId: data.refund_id,
            refundStatus: data.refund_status,
            refundAmount: data.refund_amount,
        };
    }
}
