/**
 * Cashfree Payment Provider
 *
 * Implements PaymentProviderInterface for Cashfree Payment Gateway.
 * Uses Cashfree PG Node SDK for order creation and verification.
 * Webhook signature verification uses HMAC-SHA256 as per Cashfree docs.
 */
import { PaymentProviderInterface, CreateSessionInput, CreateSessionOutput, VerifyPaymentInput, VerifyPaymentOutput, WebhookVerifyInput, RefundInput, RefundOutput } from '../payment-provider.interface';
export declare class CashfreeProvider implements PaymentProviderInterface {
    readonly providerName = "CASHFREE";
    private readonly baseUrl;
    private readonly appId;
    private readonly secretKey;
    private readonly webhookSecret;
    constructor();
    /**
     * Create a payment session (order) with Cashfree.
     * The returned paymentSessionId is used by the frontend to open the checkout.
     */
    createPaymentSession(input: CreateSessionInput): Promise<CreateSessionOutput>;
    /**
     * Verify payment status directly from Cashfree.
     * This is the server-side fallback when webhooks are delayed.
     */
    verifyPayment(input: VerifyPaymentInput): Promise<VerifyPaymentOutput>;
    /**
     * Verify webhook signature using HMAC-SHA256.
     * Cashfree sends timestamp + signature in headers.
     * We compute HMAC on the raw body and compare.
     */
    verifyWebhookSignature(input: WebhookVerifyInput): boolean;
    /**
     * Initiate a refund via Cashfree.
     */
    initiateRefund(input: RefundInput): Promise<RefundOutput>;
}
//# sourceMappingURL=cashfree.provider.d.ts.map