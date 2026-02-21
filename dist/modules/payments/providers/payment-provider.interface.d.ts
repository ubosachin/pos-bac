/**
 * Payment Provider Interface
 * Abstract contract that ALL payment gateways must implement.
 * This enables future-proofing: Cashfree, Razorpay, Stripe can all be
 * swapped in via this single interface.
 */
export interface CreateSessionInput {
    orderId: string;
    orderAmount: number;
    orderCurrency: string;
    customerName: string;
    customerEmail: string;
    customerPhone: string;
    returnUrl: string;
    notifyUrl?: string;
    orderNote?: string;
    metadata?: Record<string, any>;
}
export interface CreateSessionOutput {
    success: boolean;
    gatewayOrderId: string;
    paymentSessionId: string;
    paymentLink?: string;
    orderStatus: string;
    expiresAt?: string;
}
export interface VerifyPaymentInput {
    gatewayOrderId: string;
}
export interface VerifyPaymentOutput {
    success: boolean;
    orderId: string;
    orderStatus: string;
    orderAmount: number;
    paymentMethod?: string;
    transactionId?: string;
    bankReference?: string;
    paymentTime?: string;
}
export interface WebhookVerifyInput {
    rawBody: string | Buffer;
    timestamp: string;
    signature: string;
}
export interface RefundInput {
    gatewayOrderId: string;
    refundAmount: number;
    refundId: string;
    reason?: string;
}
export interface RefundOutput {
    success: boolean;
    refundId: string;
    refundStatus: string;
    refundAmount: number;
}
export interface PaymentProviderInterface {
    readonly providerName: string;
    /**
     * Create a payment session with the gateway.
     * Returns session ID that the frontend uses to initiate checkout.
     */
    createPaymentSession(input: CreateSessionInput): Promise<CreateSessionOutput>;
    /**
     * Server-side verification of payment status.
     * Used as a fallback when webhook is delayed.
     */
    verifyPayment(input: VerifyPaymentInput): Promise<VerifyPaymentOutput>;
    /**
     * Verify webhook signature to ensure it's genuinely from the gateway.
     * CRITICAL: Prevents spoofed webhook attacks.
     */
    verifyWebhookSignature(input: WebhookVerifyInput): boolean;
    /**
     * Initiate a refund via the gateway.
     */
    initiateRefund(input: RefundInput): Promise<RefundOutput>;
}
//# sourceMappingURL=payment-provider.interface.d.ts.map