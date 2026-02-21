import { Router } from 'express';
import { OrderService } from '../services/order.service';
import { authenticate, authorize, AuthRequest } from '../middleware/auth';
import { validate, asyncHandler } from '../middleware/errorHandler';
import { createOrderSchema, updateOrderStatusSchema } from '../validators/schemas';
import { createAuditLog } from '../middleware/audit';
import { Role, OrderStatus } from '@prisma/client';

const router = Router();

// All order routes require authentication
router.use(authenticate);

// POST /api/orders - Create order (Cashier/Admin)
router.post(
    '/',
    authorize(Role.ADMIN, Role.CASHIER),
    validate(createOrderSchema),
    asyncHandler(async (req, res) => {
        const authReq = req as AuthRequest;
        const order = await OrderService.createOrder({
            ...req.body,
            cashierId: authReq.user!.userId,
        });

        // Emit to kitchen via Socket.io (handled in index.ts)
        const io = req.app.get('io');
        if (io) {
            io.to('kitchen').emit('new-order', order);
            io.to('dashboard').emit('order-update', order);
        }

        await createAuditLog(authReq.user!.userId, 'CREATE_ORDER', 'Order', order.id, undefined, { orderNumber: order.orderNumber }, req);

        res.status(201).json({ success: true, data: order });
    }),
);

// GET /api/orders
router.get(
    '/',
    asyncHandler(async (req, res) => {
        const authReq = req as AuthRequest;
        const params: any = {
            page: parseInt(req.query.page as string) || 1,
            limit: parseInt(req.query.limit as string) || 20,
            status: req.query.status as OrderStatus | undefined,
            search: req.query.search as string | undefined,
        };

        // Cashiers can only see their own orders
        if (authReq.user!.role === Role.CASHIER) {
            params.cashierId = authReq.user!.userId;
        }

        if (req.query.dateFrom) params.dateFrom = new Date(req.query.dateFrom as string);
        if (req.query.dateTo) params.dateTo = new Date(req.query.dateTo as string);

        const result = await OrderService.getOrders(params);
        res.json({ success: true, data: result });
    }),
);

// GET /api/orders/kitchen - Kitchen queue
router.get(
    '/kitchen',
    authorize(Role.ADMIN, Role.KITCHEN, Role.CASHIER),
    asyncHandler(async (_req, res) => {
        const orders = await OrderService.getKitchenQueue();
        res.json({ success: true, data: orders });
    }),
);

// GET /api/orders/daily-summary
router.get(
    '/daily-summary',
    authorize(Role.ADMIN, Role.CASHIER),
    asyncHandler(async (req, res) => {
        const date = req.query.date ? new Date(req.query.date as string) : undefined;
        const summary = await OrderService.getDailySummary(date);
        res.json({ success: true, data: summary });
    }),
);

// GET /api/orders/:id
router.get(
    '/:id',
    asyncHandler(async (req, res) => {
        const order = await OrderService.getOrderById((req.params.id as string));
        res.json({ success: true, data: order });
    }),
);

// PATCH /api/orders/:id/status
router.patch(
    '/:id/status',
    authorize(Role.ADMIN, Role.CASHIER, Role.KITCHEN),
    validate(updateOrderStatusSchema),
    asyncHandler(async (req, res) => {
        const authReq = req as AuthRequest;
        const { status, cancelReason } = req.body;

        const order = await OrderService.updateStatus((req.params.id as string), status, cancelReason);

        // Emit status update
        const io = req.app.get('io');
        if (io) {
            io.to('kitchen').emit('order-status-update', order);
            io.to('pos').emit('order-status-update', order);
            io.to('dashboard').emit('order-update', order);

            if (status === OrderStatus.READY) {
                io.emit('order-ready', { orderNumber: order.orderNumber, tokenNumber: order.tokenNumber });
            }
        }

        await createAuditLog(authReq.user!.userId, `ORDER_${status}`, 'Order', order.id, undefined, { status, cancelReason }, req);

        res.json({ success: true, data: order });
    }),
);

// PATCH /api/orders/:id/hold
router.patch(
    '/:id/hold',
    authorize(Role.ADMIN, Role.CASHIER),
    asyncHandler(async (req, res) => {
        const order = await OrderService.holdOrder((req.params.id as string));
        res.json({ success: true, data: order });
    }),
);

// PATCH /api/orders/:id/resume
router.patch(
    '/:id/resume',
    authorize(Role.ADMIN, Role.CASHIER),
    asyncHandler(async (req, res) => {
        const order = await OrderService.resumeOrder((req.params.id as string));
        res.json({ success: true, data: order });
    }),
);

export default router;
