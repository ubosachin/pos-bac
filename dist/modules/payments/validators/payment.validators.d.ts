/**
 * Payment Validators
 * Zod schemas for all payment-related request validation.
 */
import { z } from 'zod';
export declare const createPaymentSessionSchema: z.ZodObject<{
    body: z.ZodObject<{
        orderId: z.ZodString;
        gateway: z.ZodDefault<z.ZodEnum<["CASHFREE", "RAZORPAY", "STRIPE"]>>;
        customerName: z.ZodString;
        customerEmail: z.ZodString;
        customerPhone: z.ZodString;
        paymentSource: z.ZodDefault<z.ZodEnum<["POS", "STUDENT_APP", "QR"]>>;
    }, "strip", z.ZodTypeAny, {
        customerName: string;
        customerPhone: string;
        customerEmail: string;
        orderId: string;
        gateway: "CASHFREE" | "RAZORPAY" | "STRIPE";
        paymentSource: "POS" | "STUDENT_APP" | "QR";
    }, {
        customerName: string;
        customerPhone: string;
        customerEmail: string;
        orderId: string;
        gateway?: "CASHFREE" | "RAZORPAY" | "STRIPE" | undefined;
        paymentSource?: "POS" | "STUDENT_APP" | "QR" | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    body: {
        customerName: string;
        customerPhone: string;
        customerEmail: string;
        orderId: string;
        gateway: "CASHFREE" | "RAZORPAY" | "STRIPE";
        paymentSource: "POS" | "STUDENT_APP" | "QR";
    };
}, {
    body: {
        customerName: string;
        customerPhone: string;
        customerEmail: string;
        orderId: string;
        gateway?: "CASHFREE" | "RAZORPAY" | "STRIPE" | undefined;
        paymentSource?: "POS" | "STUDENT_APP" | "QR" | undefined;
    };
}>;
export declare const paymentStatusSchema: z.ZodObject<{
    params: z.ZodObject<{
        orderId: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        orderId: string;
    }, {
        orderId: string;
    }>;
}, "strip", z.ZodTypeAny, {
    params: {
        orderId: string;
    };
}, {
    params: {
        orderId: string;
    };
}>;
export declare const listPaymentsSchema: z.ZodObject<{
    query: z.ZodObject<{
        page: z.ZodEffects<z.ZodOptional<z.ZodString>, number, string | undefined>;
        limit: z.ZodEffects<z.ZodOptional<z.ZodString>, number, string | undefined>;
        status: z.ZodOptional<z.ZodEnum<["PENDING", "INITIATED", "COMPLETED", "FAILED", "REFUNDED"]>>;
        gateway: z.ZodOptional<z.ZodEnum<["CASHFREE", "RAZORPAY", "STRIPE", "NONE"]>>;
        fromDate: z.ZodOptional<z.ZodString>;
        toDate: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        page: number;
        limit: number;
        status?: "PENDING" | "INITIATED" | "COMPLETED" | "FAILED" | "REFUNDED" | undefined;
        gateway?: "NONE" | "CASHFREE" | "RAZORPAY" | "STRIPE" | undefined;
        fromDate?: string | undefined;
        toDate?: string | undefined;
    }, {
        status?: "PENDING" | "INITIATED" | "COMPLETED" | "FAILED" | "REFUNDED" | undefined;
        gateway?: "NONE" | "CASHFREE" | "RAZORPAY" | "STRIPE" | undefined;
        page?: string | undefined;
        limit?: string | undefined;
        fromDate?: string | undefined;
        toDate?: string | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    query: {
        page: number;
        limit: number;
        status?: "PENDING" | "INITIATED" | "COMPLETED" | "FAILED" | "REFUNDED" | undefined;
        gateway?: "NONE" | "CASHFREE" | "RAZORPAY" | "STRIPE" | undefined;
        fromDate?: string | undefined;
        toDate?: string | undefined;
    };
}, {
    query: {
        status?: "PENDING" | "INITIATED" | "COMPLETED" | "FAILED" | "REFUNDED" | undefined;
        gateway?: "NONE" | "CASHFREE" | "RAZORPAY" | "STRIPE" | undefined;
        page?: string | undefined;
        limit?: string | undefined;
        fromDate?: string | undefined;
        toDate?: string | undefined;
    };
}>;
export declare const webhookLogsSchema: z.ZodObject<{
    query: z.ZodObject<{
        gateway: z.ZodOptional<z.ZodString>;
        limit: z.ZodEffects<z.ZodOptional<z.ZodString>, number, string | undefined>;
    }, "strip", z.ZodTypeAny, {
        limit: number;
        gateway?: string | undefined;
    }, {
        gateway?: string | undefined;
        limit?: string | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    query: {
        limit: number;
        gateway?: string | undefined;
    };
}, {
    query: {
        gateway?: string | undefined;
        limit?: string | undefined;
    };
}>;
//# sourceMappingURL=payment.validators.d.ts.map