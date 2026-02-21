"use strict";
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
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const paymentController = __importStar(require("../controller/payment.controller"));
const cashfree_webhook_1 = require("../webhook/cashfree.webhook");
const auth_1 = require("../../../middleware/auth");
const router = (0, express_1.Router)();
// ─── Webhook endpoint (NO authentication) ──────────────────────
// Cashfree calls this directly. Signature verification happens inside.
// IMPORTANT: Must be registered BEFORE the body parser middleware
// in the main app, or use raw body capture.
router.post('/cashfree/webhook', cashfree_webhook_1.handleCashfreeWebhook);
// ─── Authenticated routes ──────────────────────────────────────
// Create payment session
router.post('/create', auth_1.authenticate, paymentController.createPaymentSession);
// Get payment status for a specific order
router.get('/:orderId/status', auth_1.authenticate, paymentController.getPaymentStatus);
// Admin: List all payments
router.get('/', auth_1.authenticate, (0, auth_1.authorize)('ADMIN'), paymentController.listPayments);
// Admin: View webhook logs
router.get('/webhook-logs', auth_1.authenticate, (0, auth_1.authorize)('ADMIN'), paymentController.getWebhookLogs);
exports.default = router;
//# sourceMappingURL=payment.routes.js.map