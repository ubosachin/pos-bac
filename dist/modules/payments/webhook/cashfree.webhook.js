"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleCashfreeWebhook = handleCashfreeWebhook;
const client_1 = require("@prisma/client");
const cashfree_provider_1 = require("../providers/cashfree/cashfree.provider");
const payment_service_1 = require("../service/payment.service");
const logger_1 = require("../../../utils/logger");
const prisma = new client_1.PrismaClient();
const cashfreeProvider = new cashfree_provider_1.CashfreeProvider();
async function handleCashfreeWebhook(req, res) {
    const startTime = Date.now();
    let signatureValid = false;
    let eventType = 'UNKNOWN';
    let gatewayOrderId;
    let logId;
    try {
        // ─── 1. Extract signature headers ──────────────────────
        const timestamp = req.headers['x-cashfree-timestamp'];
        const signature = req.headers['x-cashfree-signature'];
        if (!timestamp || !signature) {
            logger_1.logger.warn('[Webhook] Missing signature headers');
            return res.status(400).json({ error: 'Missing signature headers' });
        }
        // ─── 2. Verify signature (MANDATORY) ──────────────────
        const rawBody = req.rawBody || JSON.stringify(req.body);
        signatureValid = cashfreeProvider.verifyWebhookSignature({
            rawBody,
            timestamp,
            signature,
        });
        // ─── 3. Parse payload ──────────────────────────────────
        const payload = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
        eventType = payload.type || payload.event || 'UNKNOWN';
        const orderData = payload.data?.order || payload.data || {};
        const paymentData = payload.data?.payment || {};
        gatewayOrderId = orderData.order_id;
        // ─── 4. Log the webhook event (always, even if invalid) 
        const webhookLog = await prisma.paymentWebhookLog.create({
            data: {
                gateway: 'CASHFREE',
                eventType,
                orderId: orderData.order_id,
                gatewayOrderId,
                payload: payload,
                signatureValid,
                processed: false,
            },
        });
        logId = webhookLog.id;
        // ─── 5. Reject invalid signatures ──────────────────────
        if (!signatureValid) {
            logger_1.logger.error(`[Webhook] INVALID SIGNATURE for event: ${eventType}`);
            await prisma.paymentWebhookLog.update({
                where: { id: logId },
                data: { error: 'Invalid signature', processed: true, processedAt: new Date() },
            });
            // Return 200 to prevent Cashfree from retrying with bad signature
            return res.status(200).json({ received: true, verified: false });
        }
        // ─── 6. Process based on event type ────────────────────
        let result = { processed: false };
        // Cashfree events: PAYMENT_SUCCESS_WEBHOOK, PAYMENT_FAILED_WEBHOOK, etc.
        if (eventType.includes('PAYMENT_SUCCESS') ||
            eventType.includes('ORDER_PAID')) {
            result = await (0, payment_service_1.processWebhookEvent)({
                eventType,
                gatewayOrderId: gatewayOrderId,
                orderId: orderData.order_id,
                orderAmount: orderData.order_amount,
                paymentStatus: 'SUCCESS',
                transactionId: paymentData.cf_payment_id?.toString(),
                paymentMethod: extractPaymentMethod(paymentData),
                bankReference: paymentData.bank_reference,
                paymentTime: paymentData.payment_time,
                rawPayload: payload,
            });
        }
        else if (eventType.includes('PAYMENT_FAILED') ||
            eventType.includes('PAYMENT_CANCELLED')) {
            result = await (0, payment_service_1.processWebhookEvent)({
                eventType,
                gatewayOrderId: gatewayOrderId,
                orderId: orderData.order_id,
                orderAmount: orderData.order_amount,
                paymentStatus: 'FAILED',
                rawPayload: payload,
            });
        }
        else if (eventType.includes('PAYMENT_USER_DROPPED')) {
            result = await (0, payment_service_1.processWebhookEvent)({
                eventType,
                gatewayOrderId: gatewayOrderId,
                orderId: orderData.order_id,
                orderAmount: orderData.order_amount,
                paymentStatus: 'USER_DROPPED',
                rawPayload: payload,
            });
        }
        // ─── 7. Update webhook log ─────────────────────────────
        await prisma.paymentWebhookLog.update({
            where: { id: logId },
            data: {
                processed: result.processed,
                processedAt: new Date(),
                error: result.reason && !result.processed ? result.reason : null,
            },
        });
        // ─── 8. Emit Socket.IO events for real-time updates ───
        if (result.event && result.orderId) {
            const io = req.app.get('io');
            if (io) {
                io.to('pos').emit(result.event, {
                    orderId: result.orderId,
                    event: result.event,
                    timestamp: new Date().toISOString(),
                });
                io.to('kitchen').emit(result.event, {
                    orderId: result.orderId,
                    event: result.event,
                });
                logger_1.logger.info(`[Webhook] Emitted ${result.event} to Socket.IO rooms`);
            }
        }
        logger_1.logger.info(`[Webhook] Processed in ${Date.now() - startTime}ms: event=${eventType}, result=${result.reason}`);
        // Always return 200 to acknowledge receipt
        return res.status(200).json({ received: true, processed: result.processed });
    }
    catch (error) {
        logger_1.logger.error(`[Webhook] Processing error: ${error.message}`, { stack: error.stack });
        // Update log with error
        if (logId) {
            await prisma.paymentWebhookLog.update({
                where: { id: logId },
                data: { error: error.message, processed: false },
            }).catch(() => { });
        }
        // Still return 200 to prevent retry storms
        return res.status(200).json({ received: true, error: 'Processing failed' });
    }
}
/**
 * Extract human-readable payment method from Cashfree payment data.
 */
function extractPaymentMethod(paymentData) {
    const method = paymentData.payment_method;
    if (!method)
        return 'ONLINE';
    if (method.upi)
        return 'UPI';
    if (method.card)
        return 'CARD';
    if (method.netbanking)
        return 'NET_BANKING';
    if (method.app)
        return 'WALLET';
    if (method.paylater)
        return 'WALLET';
    return 'ONLINE';
}
//# sourceMappingURL=cashfree.webhook.js.map