/**
 * Cashfree Webhook Handler
 *
 * CRITICAL SECURITY COMPONENT
 *
 * This handler:
 * 1. Receives raw webhook body (parsed separately from express.json)
 * 2. Verifies HMAC-SHA256 signature
 * 3. Logs every webhook event (for audit + debugging)
 * 4. Processes the event idempotently
 * 5. Emits Socket.IO events for real-time UI updates
 *
 * NEVER trust the payload without signature verification.
 */
import { Request, Response } from 'express';
export declare function handleCashfreeWebhook(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
//# sourceMappingURL=cashfree.webhook.d.ts.map