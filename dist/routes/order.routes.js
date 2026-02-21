"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const order_service_1 = require("../services/order.service");
const auth_1 = require("../middleware/auth");
const errorHandler_1 = require("../middleware/errorHandler");
const schemas_1 = require("../validators/schemas");
const audit_1 = require("../middleware/audit");
const client_1 = require("@prisma/client");
const router = (0, express_1.Router)();
// All order routes require authentication
router.use(auth_1.authenticate);
// POST /api/orders - Create order (Cashier/Admin)
router.post('/', (0, auth_1.authorize)(client_1.Role.ADMIN, client_1.Role.CASHIER), (0, errorHandler_1.validate)(schemas_1.createOrderSchema), (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const authReq = req;
    const order = await order_service_1.OrderService.createOrder({
        ...req.body,
        cashierId: authReq.user.userId,
    });
    // Emit to kitchen via Socket.io (handled in index.ts)
    const io = req.app.get('io');
    if (io) {
        io.to('kitchen').emit('new-order', order);
        io.to('dashboard').emit('order-update', order);
    }
    await (0, audit_1.createAuditLog)(authReq.user.userId, 'CREATE_ORDER', 'Order', order.id, undefined, { orderNumber: order.orderNumber }, req);
    res.status(201).json({ success: true, data: order });
}));
// GET /api/orders
router.get('/', (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const authReq = req;
    const params = {
        page: parseInt(req.query.page) || 1,
        limit: parseInt(req.query.limit) || 20,
        status: req.query.status,
        search: req.query.search,
    };
    // Cashiers can only see their own orders
    if (authReq.user.role === client_1.Role.CASHIER) {
        params.cashierId = authReq.user.userId;
    }
    if (req.query.dateFrom)
        params.dateFrom = new Date(req.query.dateFrom);
    if (req.query.dateTo)
        params.dateTo = new Date(req.query.dateTo);
    const result = await order_service_1.OrderService.getOrders(params);
    res.json({ success: true, data: result });
}));
// GET /api/orders/kitchen - Kitchen queue
router.get('/kitchen', (0, auth_1.authorize)(client_1.Role.ADMIN, client_1.Role.KITCHEN, client_1.Role.CASHIER), (0, errorHandler_1.asyncHandler)(async (_req, res) => {
    const orders = await order_service_1.OrderService.getKitchenQueue();
    res.json({ success: true, data: orders });
}));
// GET /api/orders/daily-summary
router.get('/daily-summary', (0, auth_1.authorize)(client_1.Role.ADMIN, client_1.Role.CASHIER), (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const date = req.query.date ? new Date(req.query.date) : undefined;
    const summary = await order_service_1.OrderService.getDailySummary(date);
    res.json({ success: true, data: summary });
}));
// GET /api/orders/:id
router.get('/:id', (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const order = await order_service_1.OrderService.getOrderById(req.params.id);
    res.json({ success: true, data: order });
}));
// PATCH /api/orders/:id/status
router.patch('/:id/status', (0, auth_1.authorize)(client_1.Role.ADMIN, client_1.Role.CASHIER, client_1.Role.KITCHEN), (0, errorHandler_1.validate)(schemas_1.updateOrderStatusSchema), (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const authReq = req;
    const { status, cancelReason } = req.body;
    const order = await order_service_1.OrderService.updateStatus(req.params.id, status, cancelReason);
    // Emit status update
    const io = req.app.get('io');
    if (io) {
        io.to('kitchen').emit('order-status-update', order);
        io.to('pos').emit('order-status-update', order);
        io.to('dashboard').emit('order-update', order);
        if (status === client_1.OrderStatus.READY) {
            io.emit('order-ready', { orderNumber: order.orderNumber, tokenNumber: order.tokenNumber });
        }
    }
    await (0, audit_1.createAuditLog)(authReq.user.userId, `ORDER_${status}`, 'Order', order.id, undefined, { status, cancelReason }, req);
    res.json({ success: true, data: order });
}));
// PATCH /api/orders/:id/hold
router.patch('/:id/hold', (0, auth_1.authorize)(client_1.Role.ADMIN, client_1.Role.CASHIER), (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const order = await order_service_1.OrderService.holdOrder(req.params.id);
    res.json({ success: true, data: order });
}));
// PATCH /api/orders/:id/resume
router.patch('/:id/resume', (0, auth_1.authorize)(client_1.Role.ADMIN, client_1.Role.CASHIER), (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const order = await order_service_1.OrderService.resumeOrder(req.params.id);
    res.json({ success: true, data: order });
}));
exports.default = router;
//# sourceMappingURL=order.routes.js.map