/**
 * Payment Controller
 *
 * Thin controller layer — NO business logic here.
 * All logic lives in payment.service.ts.
 */
import { Request, Response, NextFunction } from 'express';
/**
 * POST /payments/create
 * Create a payment session with the chosen gateway.
 */
export declare function createPaymentSession(req: Request, res: Response, next: NextFunction): Promise<Response<any, Record<string, any>>>;
/**
 * GET /payments/:orderId/status
 * Get payment status. If pending, polls gateway as fallback.
 */
export declare function getPaymentStatus(req: Request, res: Response, next: NextFunction): Promise<Response<any, Record<string, any>>>;
/**
 * GET /payments
 * Admin: List all payments with filtering.
 */
export declare function listPayments(req: Request, res: Response, next: NextFunction): Promise<Response<any, Record<string, any>>>;
/**
 * GET /payments/webhook-logs
 * Admin: View webhook event logs for debugging.
 */
export declare function getWebhookLogs(req: Request, res: Response, next: NextFunction): Promise<Response<any, Record<string, any>>>;
//# sourceMappingURL=payment.controller.d.ts.map