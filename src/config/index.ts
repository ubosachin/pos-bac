import dotenv from 'dotenv';
dotenv.config();

export const config = {
    env: process.env.NODE_ENV || 'development',
    port: parseInt(process.env.PORT || '5000', 10),

    database: {
        url: process.env.DATABASE_URL!,
    },

    jwt: {
        secret: process.env.JWT_SECRET!,
        expiresIn: process.env.JWT_EXPIRES_IN || '24h',
        refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
    },

    cors: {
        origin: (process.env.CORS_ORIGIN || 'http://localhost:3000').split(',').map(s => s.trim()),
    },

    rateLimit: {
        windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10),
        maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10),
    },

    app: {
        name: process.env.APP_NAME || 'POS-SATHI',
        collegeName: process.env.COLLEGE_NAME || 'College Canteen',
        gstNumber: process.env.GST_NUMBER || '',
        defaultTaxRate: parseFloat(process.env.DEFAULT_TAX_RATE || '5'),
    },

    cashfree: {
        appId: process.env.CASHFREE_APP_ID || '',
        secretKey: process.env.CASHFREE_SECRET_KEY || '',
        environment: (process.env.CASHFREE_ENVIRONMENT || 'sandbox') as 'sandbox' | 'production',
        webhookSecret: process.env.CASHFREE_WEBHOOK_SECRET || '',
        returnUrl: process.env.CASHFREE_RETURN_URL || 'http://localhost:3001/payment/status',
    },

    razorpay: {
        keyId: process.env.RAZORPAY_KEY_ID || '',
        keySecret: process.env.RAZORPAY_KEY_SECRET || '',
        webhookSecret: process.env.RAZORPAY_WEBHOOK_SECRET || '',
    },
} as const;
