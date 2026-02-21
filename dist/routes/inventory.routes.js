"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const inventory_service_1 = require("../services/inventory.service");
const auth_1 = require("../middleware/auth");
const errorHandler_1 = require("../middleware/errorHandler");
const schemas_1 = require("../validators/schemas");
const client_1 = require("@prisma/client");
const router = (0, express_1.Router)();
router.use(auth_1.authenticate, (0, auth_1.authorize)(client_1.Role.ADMIN, client_1.Role.INVENTORY_MANAGER));
// ─── Inventory Items ──────────────────────────────────────
router.get('/', (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const result = await inventory_service_1.InventoryService.getAll({
        search: req.query.search,
        lowStock: req.query.lowStock === 'true',
        page: parseInt(req.query.page) || 1,
        limit: parseInt(req.query.limit) || 20,
    });
    res.json({ success: true, data: result });
}));
router.get('/low-stock', (0, errorHandler_1.asyncHandler)(async (_req, res) => {
    const alerts = await inventory_service_1.InventoryService.getLowStockAlerts();
    res.json({ success: true, data: alerts });
}));
router.get('/:id', (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const item = await inventory_service_1.InventoryService.getById(req.params.id);
    res.json({ success: true, data: item });
}));
router.post('/', (0, errorHandler_1.validate)(schemas_1.createInventoryItemSchema), (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const item = await inventory_service_1.InventoryService.create(req.body);
    res.status(201).json({ success: true, data: item });
}));
router.put('/:id', (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const item = await inventory_service_1.InventoryService.update(req.params.id, req.body);
    res.json({ success: true, data: item });
}));
router.patch('/:id/adjust-stock', (0, errorHandler_1.validate)(schemas_1.adjustStockSchema), (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const item = await inventory_service_1.InventoryService.adjustStock(req.params.id, req.body.quantity, req.body.reason);
    res.json({ success: true, data: item });
}));
router.delete('/:id', (0, errorHandler_1.asyncHandler)(async (req, res) => {
    await inventory_service_1.InventoryService.delete(req.params.id);
    res.json({ success: true, message: 'Item deleted' });
}));
// ─── Ingredient Mapping ───────────────────────────────────
router.post('/ingredients/map', (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const mapping = await inventory_service_1.InventoryService.mapIngredient(req.body.menuItemId, req.body.inventoryItemId, req.body.quantityNeeded);
    res.json({ success: true, data: mapping });
}));
router.delete('/ingredients/map', (0, errorHandler_1.asyncHandler)(async (req, res) => {
    await inventory_service_1.InventoryService.removeIngredientMapping(req.body.menuItemId, req.body.inventoryItemId);
    res.json({ success: true, message: 'Mapping removed' });
}));
// ─── Wastage ──────────────────────────────────────────────
router.post('/wastage', (0, errorHandler_1.validate)(schemas_1.recordWastageSchema), (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const authReq = req;
    const record = await inventory_service_1.InventoryService.recordWastage({
        ...req.body,
        recordedBy: authReq.user.userId,
    });
    res.status(201).json({ success: true, data: record });
}));
router.get('/wastage/records', (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const result = await inventory_service_1.InventoryService.getWastageRecords({
        dateFrom: req.query.dateFrom ? new Date(req.query.dateFrom) : undefined,
        dateTo: req.query.dateTo ? new Date(req.query.dateTo) : undefined,
        page: parseInt(req.query.page) || 1,
        limit: parseInt(req.query.limit) || 20,
    });
    res.json({ success: true, data: result });
}));
// ─── Vendors ──────────────────────────────────────────────
router.get('/vendors', (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const result = await inventory_service_1.InventoryService.getAllVendors({
        search: req.query.search,
        page: parseInt(req.query.page) || 1,
        limit: parseInt(req.query.limit) || 20,
    });
    res.json({ success: true, data: result });
}));
router.post('/vendors', (0, errorHandler_1.validate)(schemas_1.createVendorSchema), (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const vendor = await inventory_service_1.InventoryService.createVendor(req.body);
    res.status(201).json({ success: true, data: vendor });
}));
router.put('/vendors/:id', (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const vendor = await inventory_service_1.InventoryService.updateVendor(req.params.id, req.body);
    res.json({ success: true, data: vendor });
}));
// ─── Purchases ────────────────────────────────────────────
router.post('/purchases', (0, errorHandler_1.validate)(schemas_1.createPurchaseSchema), (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const purchase = await inventory_service_1.InventoryService.createPurchase(req.body);
    res.status(201).json({ success: true, data: purchase });
}));
exports.default = router;
//# sourceMappingURL=inventory.routes.js.map