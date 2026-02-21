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
import { Prisma } from '@prisma/client';
export interface CreatePaymentSessionInput {
    orderId: string;
    gateway?: string;
    customerName: string;
    customerEmail: string;
    customerPhone: string;
    paymentSource: string;
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
export declare function createPaymentSession(input: CreatePaymentSessionInput): Promise<{
    paymentId: string;
    orderId: string;
    orderNumber: string;
    amount: number;
    currency: string;
    gateway: string;
    paymentSessionId: string;
    gatewayOrderId: string;
    paymentLink: string | undefined;
    status: string;
}>;
/**
 * Process a webhook event from the payment gateway.
 *
 * CRITICAL SECURITY:
 * 1. Signature already verified in the webhook handler before reaching here
 * 2. Amount verified against our DB to prevent manipulation
 * 3. Idempotent: duplicate webhooks for same event are safely ignored
 * 4. Only this function marks payments as COMPLETED
 */
export declare function processWebhookEvent(data: PaymentWebhookData): Promise<{
    processed: boolean;
    reason: string;
    orderId: any;
    event: string;
} | {
    processed: boolean;
    reason: string;
}>;
/**
 * Get payment status from our DB.
 * If the payment is still PENDING/INITIATED, also poll the gateway
 * as a fallback for delayed webhooks.
 */
export declare function getPaymentStatus(orderId: string): Promise<{
    orderId: any;
    orderNumber: any;
    orderStatus: any;
    paymentStatus: any;
    totalAmount: number;
    payment: {
        id: any;
        gateway: any;
        gatewayOrderId: any;
        method: any;
        status: any;
        transactionId: any;
        bankReference: any;
        paymentMethodDetail: any;
        amount: number;
        webhookVerified: any;
        amountVerified: any;
        failureReason: any;
        createdAt: any;
        updatedAt: any;
    } | null;
    allPayments: any;
}>;
/**
 * Admin: List all payments with filters.
 */
export declare function listPayments(filters: {
    page?: number;
    limit?: number;
    status?: string;
    gateway?: string;
    fromDate?: string;
    toDate?: string;
}): Promise<{
    payments: any[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        pages: number;
    };
}>;
/**
 * Get webhook logs for debugging.
 */
export declare function getWebhookLogs(filters: {
    gateway?: string;
    limit?: number;
}): Promise<{
    error: string | null;
    id: string;
    createdAt: Date;
    orderId: string | null;
    gateway: string;
    gatewayOrderId: string | null;
    eventType: string;
    payload: Prisma.JsonValue;
    signatureValid: boolean;
    processed: boolean;
    processedAt: Date | null;
}[]>;
//# sourceMappingURL=payment.service.d.ts.map