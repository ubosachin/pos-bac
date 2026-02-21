/**
 * Payment Controller
 * 
 * Thin controller layer — NO business logic here.
 * All logic lives in payment.service.ts.
 */

import { Request, Response, NextFunction } from 'express';
import * as paymentService from '../service/payment.service';
import { logger } from '../../../utils/logger';

/**
 * POST /payments/create
 * Create a payment session with the chosen gateway.
 */
export async function createPaymentSession(
    req: Request,
    res: Response,
    next: NextFunction,
) {
    try {
        const { orderId, gateway, customerName, customerEmail, customerPhone, paymentSource } =
            req.body;

        const result = await paymentService.createPaymentSession({
            orderId,
            gateway,
            customerName,
            customerEmail,
            customerPhone,
            paymentSource,
        });

        logger.info(`[PaymentCtrl] Session created for order: ${orderId}`);

        return res.status(201).json({
            success: true,
            data: result,
        });
    } catch (error: any) {
        logger.error(`[PaymentCtrl] Create session error: ${error.message}`);
        return res.status(400).json({
            success: false,
            error: error.message,
        });
    }
}

/**
 * GET /payments/:orderId/status
 * Get payment status. If pending, polls gateway as fallback.
 */
export async function getPaymentStatus(
    req: Request,
    res: Response,
    next: NextFunction,
) {
    try {
        const { orderId } = req.params;

        const result = await paymentService.getPaymentStatus(orderId as string);

        return res.json({
            success: true,
            data: result,
        });
    } catch (error: any) {
        logger.error(`[PaymentCtrl] Get status error: ${error.message}`);
        return res.status(404).json({
            success: false,
            error: error.message,
        });
    }
}

/**
 * GET /payments
 * Admin: List all payments with filtering.
 */
export async function listPayments(
    req: Request,
    res: Response,
    next: NextFunction,
) {
    try {
        const result = await paymentService.listPayments({
            page: Number(req.query.page) || 1,
            limit: Number(req.query.limit) || 20,
            status: req.query.status as string,
            gateway: req.query.gateway as string,
            fromDate: req.query.fromDate as string,
            toDate: req.query.toDate as string,
        });

        return res.json({
            success: true,
            data: result,
        });
    } catch (error: any) {
        logger.error(`[PaymentCtrl] List payments error: ${error.message}`);
        return res.status(500).json({
            success: false,
            error: 'Failed to fetch payments',
        });
    }
}

/**
 * GET /payments/webhook-logs
 * Admin: View webhook event logs for debugging.
 */
export async function getWebhookLogs(
    req: Request,
    res: Response,
    next: NextFunction,
) {
    try {
        const logs = await paymentService.getWebhookLogs({
            gateway: req.query.gateway as string,
            limit: Number(req.query.limit) || 50,
        });

        return res.json({
            success: true,
            data: logs,
        });
    } catch (error: any) {
        return res.status(500).json({
            success: false,
            error: 'Failed to fetch webhook logs',
        });
    }
}
