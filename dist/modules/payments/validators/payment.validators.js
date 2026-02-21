"use strict";
/**
 * Payment Validators
 * Zod schemas for all payment-related request validation.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.webhookLogsSchema = exports.listPaymentsSchema = exports.paymentStatusSchema = exports.createPaymentSessionSchema = void 0;
const zod_1 = require("zod");
exports.createPaymentSessionSchema = zod_1.z.object({
    body: zod_1.z.object({
        orderId: zod_1.z.string().uuid('Invalid order ID'),
        gateway: zod_1.z.enum(['CASHFREE', 'RAZORPAY', 'STRIPE']).default('CASHFREE'),
        customerName: zod_1.z.string().min(1, 'Customer name is required').max(100),
        customerEmail: zod_1.z.string().email('Invalid email'),
        customerPhone: zod_1.z.string().regex(/^[6-9]\d{9}$/, 'Invalid Indian phone number'),
        paymentSource: zod_1.z.enum(['POS', 'STUDENT_APP', 'QR']).default('POS'),
    }),
});
exports.paymentStatusSchema = zod_1.z.object({
    params: zod_1.z.object({
        orderId: zod_1.z.string().uuid('Invalid order ID'),
    }),
});
exports.listPaymentsSchema = zod_1.z.object({
    query: zod_1.z.object({
        page: zod_1.z.string().optional().transform(v => v ? parseInt(v) : 1),
        limit: zod_1.z.string().optional().transform(v => v ? parseInt(v) : 20),
        status: zod_1.z.enum(['PENDING', 'INITIATED', 'COMPLETED', 'FAILED', 'REFUNDED']).optional(),
        gateway: zod_1.z.enum(['CASHFREE', 'RAZORPAY', 'STRIPE', 'NONE']).optional(),
        fromDate: zod_1.z.string().optional(),
        toDate: zod_1.z.string().optional(),
    }),
});
exports.webhookLogsSchema = zod_1.z.object({
    query: zod_1.z.object({
        gateway: zod_1.z.string().optional(),
        limit: zod_1.z.string().optional().transform(v => v ? parseInt(v) : 50),
    }),
});
//# sourceMappingURL=payment.validators.js.map