/**
 * Payment Routes
 * 
 * Route structure:
 * POST   /api/payments/create              → Create payment session (auth required)
 * GET    /api/payments/:orderId/status      → Get payment status (auth required)
 * GET    /api/payments                      → List all payments (admin only)
 * GET    /api/payments/webhook-logs         → View webhook logs (admin only)
 * POST   /api/payments/cashfree/webhook     → Cashfree webhook (NO AUTH - signature verified)
 */

import { Router, Request, Response, NextFunction } from 'express';
import * as paymentController from '../controller/payment.controller';
import { handleCashfreeWebhook } from '../webhook/cashfree.webhook';
import { handleRazorpayWebhook } from '../webhook/razorpay.webhook';
import { authenticate, authorize } from '../../../middleware/auth';

const router = Router();

// ─── Webhook endpoint (NO authentication) ──────────────────────
// Gateway calls this directly. Signature verification happens inside.
router.post('/cashfree/webhook', handleCashfreeWebhook);
router.post('/razorpay/webhook', handleRazorpayWebhook);

// ─── Authenticated routes ──────────────────────────────────────

// Create payment session
router.post(
    '/create',
    authenticate,
    paymentController.createPaymentSession,
);

// Get payment status for a specific order
router.get(
    '/:orderId/status',
    authenticate,
    paymentController.getPaymentStatus,
);

// Admin: List all payments
router.get(
    '/',
    authenticate,
    authorize('ADMIN'),
    paymentController.listPayments,
);

// Admin: View webhook logs
router.get(
    '/webhook-logs',
    authenticate,
    authorize('ADMIN'),
    paymentController.getWebhookLogs,
);

export default router;
