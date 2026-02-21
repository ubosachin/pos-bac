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
declare const router: import("express-serve-static-core").Router;
export default router;
//# sourceMappingURL=payment.routes.d.ts.map