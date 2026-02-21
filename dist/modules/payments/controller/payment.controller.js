"use strict";
/**
 * Payment Controller
 *
 * Thin controller layer — NO business logic here.
 * All logic lives in payment.service.ts.
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
exports.createPaymentSession = createPaymentSession;
exports.getPaymentStatus = getPaymentStatus;
exports.listPayments = listPayments;
exports.getWebhookLogs = getWebhookLogs;
const paymentService = __importStar(require("../service/payment.service"));
const logger_1 = require("../../../utils/logger");
/**
 * POST /payments/create
 * Create a payment session with the chosen gateway.
 */
async function createPaymentSession(req, res, next) {
    try {
        const { orderId, gateway, customerName, customerEmail, customerPhone, paymentSource } = req.body;
        const result = await paymentService.createPaymentSession({
            orderId,
            gateway,
            customerName,
            customerEmail,
            customerPhone,
            paymentSource,
        });
        logger_1.logger.info(`[PaymentCtrl] Session created for order: ${orderId}`);
        return res.status(201).json({
            success: true,
            data: result,
        });
    }
    catch (error) {
        logger_1.logger.error(`[PaymentCtrl] Create session error: ${error.message}`);
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
async function getPaymentStatus(req, res, next) {
    try {
        const { orderId } = req.params;
        const result = await paymentService.getPaymentStatus(orderId);
        return res.json({
            success: true,
            data: result,
        });
    }
    catch (error) {
        logger_1.logger.error(`[PaymentCtrl] Get status error: ${error.message}`);
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
async function listPayments(req, res, next) {
    try {
        const result = await paymentService.listPayments({
            page: Number(req.query.page) || 1,
            limit: Number(req.query.limit) || 20,
            status: req.query.status,
            gateway: req.query.gateway,
            fromDate: req.query.fromDate,
            toDate: req.query.toDate,
        });
        return res.json({
            success: true,
            data: result,
        });
    }
    catch (error) {
        logger_1.logger.error(`[PaymentCtrl] List payments error: ${error.message}`);
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
async function getWebhookLogs(req, res, next) {
    try {
        const logs = await paymentService.getWebhookLogs({
            gateway: req.query.gateway,
            limit: Number(req.query.limit) || 50,
        });
        return res.json({
            success: true,
            data: logs,
        });
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            error: 'Failed to fetch webhook logs',
        });
    }
}
//# sourceMappingURL=payment.controller.js.map