import { Router } from 'express';
import { InventoryService } from '../services/inventory.service';
import { authenticate, authorize, AuthRequest } from '../middleware/auth';
import { validate, asyncHandler } from '../middleware/errorHandler';
import {
    createInventoryItemSchema,
    adjustStockSchema,
    createPurchaseSchema,
    recordWastageSchema,
    createVendorSchema,
} from '../validators/schemas';
import { Role } from '@prisma/client';

const router = Router();

router.use(authenticate, authorize(Role.ADMIN, Role.INVENTORY_MANAGER));

// ─── Inventory Items ──────────────────────────────────────

router.get(
    '/',
    asyncHandler(async (req, res) => {
        const result = await InventoryService.getAll({
            search: req.query.search as string | undefined,
            lowStock: req.query.lowStock === 'true',
            page: parseInt(req.query.page as string) || 1,
            limit: parseInt(req.query.limit as string) || 20,
        });
        res.json({ success: true, data: result });
    }),
);

router.get(
    '/low-stock',
    asyncHandler(async (_req, res) => {
        const alerts = await InventoryService.getLowStockAlerts();
        res.json({ success: true, data: alerts });
    }),
);

router.get(
    '/:id',
    asyncHandler(async (req, res) => {
        const item = await InventoryService.getById((req.params.id as string));
        res.json({ success: true, data: item });
    }),
);

router.post(
    '/',
    validate(createInventoryItemSchema),
    asyncHandler(async (req, res) => {
        const item = await InventoryService.create(req.body);
        res.status(201).json({ success: true, data: item });
    }),
);

router.put(
    '/:id',
    asyncHandler(async (req, res) => {
        const item = await InventoryService.update((req.params.id as string), req.body);
        res.json({ success: true, data: item });
    }),
);

router.patch(
    '/:id/adjust-stock',
    validate(adjustStockSchema),
    asyncHandler(async (req, res) => {
        const item = await InventoryService.adjustStock(
            (req.params.id as string),
            req.body.quantity,
            req.body.reason,
        );
        res.json({ success: true, data: item });
    }),
);

router.delete(
    '/:id',
    asyncHandler(async (req, res) => {
        await InventoryService.delete((req.params.id as string));
        res.json({ success: true, message: 'Item deleted' });
    }),
);

// ─── Ingredient Mapping ───────────────────────────────────

router.post(
    '/ingredients/map',
    asyncHandler(async (req, res) => {
        const mapping = await InventoryService.mapIngredient(
            req.body.menuItemId,
            req.body.inventoryItemId,
            req.body.quantityNeeded,
        );
        res.json({ success: true, data: mapping });
    }),
);

router.delete(
    '/ingredients/map',
    asyncHandler(async (req, res) => {
        await InventoryService.removeIngredientMapping(
            req.body.menuItemId,
            req.body.inventoryItemId,
        );
        res.json({ success: true, message: 'Mapping removed' });
    }),
);

// ─── Wastage ──────────────────────────────────────────────

router.post(
    '/wastage',
    validate(recordWastageSchema),
    asyncHandler(async (req, res) => {
        const authReq = req as AuthRequest;
        const record = await InventoryService.recordWastage({
            ...req.body,
            recordedBy: authReq.user!.userId,
        });
        res.status(201).json({ success: true, data: record });
    }),
);

router.get(
    '/wastage/records',
    asyncHandler(async (req, res) => {
        const result = await InventoryService.getWastageRecords({
            dateFrom: req.query.dateFrom ? new Date(req.query.dateFrom as string) : undefined,
            dateTo: req.query.dateTo ? new Date(req.query.dateTo as string) : undefined,
            page: parseInt(req.query.page as string) || 1,
            limit: parseInt(req.query.limit as string) || 20,
        });
        res.json({ success: true, data: result });
    }),
);

// ─── Vendors ──────────────────────────────────────────────

router.get(
    '/vendors',
    asyncHandler(async (req, res) => {
        const result = await InventoryService.getAllVendors({
            search: req.query.search as string | undefined,
            page: parseInt(req.query.page as string) || 1,
            limit: parseInt(req.query.limit as string) || 20,
        });
        res.json({ success: true, data: result });
    }),
);

router.post(
    '/vendors',
    validate(createVendorSchema),
    asyncHandler(async (req, res) => {
        const vendor = await InventoryService.createVendor(req.body);
        res.status(201).json({ success: true, data: vendor });
    }),
);

router.put(
    '/vendors/:id',
    asyncHandler(async (req, res) => {
        const vendor = await InventoryService.updateVendor((req.params.id as string), req.body);
        res.json({ success: true, data: vendor });
    }),
);

// ─── Purchases ────────────────────────────────────────────

router.post(
    '/purchases',
    validate(createPurchaseSchema),
    asyncHandler(async (req, res) => {
        const purchase = await InventoryService.createPurchase(req.body);
        res.status(201).json({ success: true, data: purchase });
    }),
);

export default router;
