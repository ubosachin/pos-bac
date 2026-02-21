/**
 * Payment Validators
 * Zod schemas for all payment-related request validation.
 */

import { z } from 'zod';

export const createPaymentSessionSchema = z.object({
    body: z.object({
        orderId: z.string().uuid('Invalid order ID'),
        gateway: z.enum(['CASHFREE', 'RAZORPAY', 'STRIPE']).default('CASHFREE'),
        customerName: z.string().min(1, 'Customer name is required').max(100),
        customerEmail: z.string().email('Invalid email'),
        customerPhone: z.string().regex(/^[6-9]\d{9}$/, 'Invalid Indian phone number'),
        paymentSource: z.enum(['POS', 'STUDENT_APP', 'QR']).default('POS'),
    }),
});

export const paymentStatusSchema = z.object({
    params: z.object({
        orderId: z.string().uuid('Invalid order ID'),
    }),
});

export const listPaymentsSchema = z.object({
    query: z.object({
        page: z.string().optional().transform(v => v ? parseInt(v) : 1),
        limit: z.string().optional().transform(v => v ? parseInt(v) : 20),
        status: z.enum(['PENDING', 'INITIATED', 'COMPLETED', 'FAILED', 'REFUNDED']).optional(),
        gateway: z.enum(['CASHFREE', 'RAZORPAY', 'STRIPE', 'NONE']).optional(),
        fromDate: z.string().optional(),
        toDate: z.string().optional(),
    }),
});

export const webhookLogsSchema = z.object({
    query: z.object({
        gateway: z.string().optional(),
        limit: z.string().optional().transform(v => v ? parseInt(v) : 50),
    }),
});
