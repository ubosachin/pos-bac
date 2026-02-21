/**
 * Razorpay Webhook Handler
 */

import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { RazorpayProvider } from '../providers/razorpay/razorpay.provider';
import { processWebhookEvent } from '../service/payment.service';
import { logger } from '../../../utils/logger';

const prisma = new PrismaClient();
const razorpayProvider = new RazorpayProvider();

export async function handleRazorpayWebhook(req: Request, res: Response) {
    const startTime = Date.now();

    let signatureValid = false;
    let eventType = 'UNKNOWN';
    let gatewayOrderId: string | undefined;
    let logId: string | undefined;

    try {
        // ─── 1. Extract signature headers ──────────────────────
        const signature = req.headers['x-razorpay-signature'] as string;

        if (!signature) {
            logger.warn('[Webhook] Missing Razorpay signature header');
            return res.status(400).json({ error: 'Missing signature header' });
        }

        // ─── 2. Verify signature (MANDATORY) ──────────────────
        // Razorpay uses the entire body as a string
        const rawBody = (req as any).rawBody || JSON.stringify(req.body);

        signatureValid = razorpayProvider.verifyWebhookSignature({
            rawBody,
            timestamp: '', // Razorpay signature verification doesn't need timestamp separate from body
            signature,
        });

        // ─── 3. Parse payload ──────────────────────────────────
        const payload = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
        eventType = payload.event || 'UNKNOWN';

        const orderData = payload.payload?.order?.entity || {};
        const paymentData = payload.payload?.payment?.entity || {};

        gatewayOrderId = orderData.id || paymentData.order_id;

        // ─── 4. Log the webhook event ─────────────────────────
        const webhookLog = await prisma.paymentWebhookLog.create({
            data: {
                gateway: 'RAZORPAY',
                eventType,
                orderId: orderData.receipt || undefined,
                gatewayOrderId: gatewayOrderId || undefined,
                payload: payload,
                signatureValid,
                processed: false,
            },
        });
        logId = webhookLog.id;

        // ─── 5. Reject invalid signatures ──────────────────────
        if (!signatureValid) {
            logger.error(`[Webhook] INVALID SIGNATURE for event: ${eventType}`);
            await prisma.paymentWebhookLog.update({
                where: { id: logId },
                data: { error: 'Invalid signature', processed: true, processedAt: new Date() },
            });
            return res.status(200).json({ received: true, verified: false });
        }

        // ─── 6. Process based on event type ────────────────────
        let result: any = { processed: false };

        // Razorpay events: order.paid, payment.captured, payment.failed
        if (eventType === 'order.paid' || eventType === 'payment.captured') {
            result = await processWebhookEvent({
                eventType,
                gatewayOrderId: gatewayOrderId!,
                orderId: orderData.receipt,
                orderAmount: Number(paymentData.amount || orderData.amount) / 100,
                paymentStatus: 'SUCCESS',
                transactionId: paymentData.id,
                paymentMethod: paymentData.method?.toUpperCase(),
                bankReference: paymentData.acquirer_data?.bank_transaction_id,
                paymentTime: paymentData.created_at ? new Date(paymentData.created_at * 1000).toISOString() : undefined,
                rawPayload: payload,
            });
        } else if (eventType === 'payment.failed') {
            result = await processWebhookEvent({
                eventType,
                gatewayOrderId: gatewayOrderId!,
                orderId: orderData.receipt,
                orderAmount: Number(paymentData.amount) / 100,
                paymentStatus: 'FAILED',
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

        // ─── 8. Emit Socket.IO events ────────────────────────
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
            }
        }

        logger.info(
            `[Webhook] Processed Razorpay in ${Date.now() - startTime}ms: event=${eventType}, result=${result.reason}`,
        );

        return res.status(200).json({ received: true, processed: result.processed });
    } catch (error: any) {
        logger.error(`[Webhook] Razorpay Processing error: ${error.message}`);
        if (logId) {
            await prisma.paymentWebhookLog.update({
                where: { id: logId },
                data: { error: error.message, processed: false },
            }).catch(() => { });
        }
        return res.status(200).json({ received: true, error: 'Processing failed' });
    }
}
