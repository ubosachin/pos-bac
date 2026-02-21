"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const menu_service_1 = require("../services/menu.service");
const auth_1 = require("../middleware/auth");
const errorHandler_1 = require("../middleware/errorHandler");
const schemas_1 = require("../validators/schemas");
const client_1 = require("@prisma/client");
const router = (0, express_1.Router)();
// ─── Public/Auth-Optional Routes ─────────────────────────
// GET /api/menu/categories
router.get('/categories', (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const categories = await menu_service_1.MenuService.getAllCategories(req.query.includeInactive === 'true');
    res.json({ success: true, data: categories });
}));
// GET /api/menu/items
router.get('/items', (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const result = await menu_service_1.MenuService.getAllMenuItems({
        categoryId: req.query.categoryId,
        search: req.query.search,
        isAvailable: req.query.isAvailable ? req.query.isAvailable === 'true' : undefined,
        isVeg: req.query.isVeg ? req.query.isVeg === 'true' : undefined,
        page: parseInt(req.query.page) || 1,
        limit: parseInt(req.query.limit) || 50,
    });
    res.json({ success: true, data: result });
}));
// GET /api/menu/items/:id
router.get('/items/:id', (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const item = await menu_service_1.MenuService.getMenuItemById(req.params.id);
    res.json({ success: true, data: item });
}));
// GET /api/menu/search - Quick search for POS
router.get('/search', (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const items = await menu_service_1.MenuService.quickSearch(req.query.q || '');
    res.json({ success: true, data: items });
}));
// ─── Admin-Only Routes ────────────────────────────────────
// POST /api/menu/categories
router.post('/categories', auth_1.authenticate, (0, auth_1.authorize)(client_1.Role.ADMIN), (0, errorHandler_1.validate)(schemas_1.createCategorySchema), (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const category = await menu_service_1.MenuService.createCategory(req.body);
    res.status(201).json({ success: true, data: category });
}));
// PUT /api/menu/categories/:id
router.put('/categories/:id', auth_1.authenticate, (0, auth_1.authorize)(client_1.Role.ADMIN), (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const category = await menu_service_1.MenuService.updateCategory(req.params.id, req.body);
    res.json({ success: true, data: category });
}));
// DELETE /api/menu/categories/:id
router.delete('/categories/:id', auth_1.authenticate, (0, auth_1.authorize)(client_1.Role.ADMIN), (0, errorHandler_1.asyncHandler)(async (req, res) => {
    await menu_service_1.MenuService.deleteCategory(req.params.id);
    res.json({ success: true, message: 'Category deleted' });
}));
// POST /api/menu/items
router.post('/items', auth_1.authenticate, (0, auth_1.authorize)(client_1.Role.ADMIN), (0, errorHandler_1.validate)(schemas_1.createMenuItemSchema), (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const item = await menu_service_1.MenuService.createMenuItem(req.body);
    res.status(201).json({ success: true, data: item });
}));
// PUT /api/menu/items/:id
router.put('/items/:id', auth_1.authenticate, (0, auth_1.authorize)(client_1.Role.ADMIN), (0, errorHandler_1.validate)(schemas_1.updateMenuItemSchema), (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const item = await menu_service_1.MenuService.updateMenuItem(req.params.id, req.body);
    res.json({ success: true, data: item });
}));
// DELETE /api/menu/items/:id
router.delete('/items/:id', auth_1.authenticate, (0, auth_1.authorize)(client_1.Role.ADMIN), (0, errorHandler_1.asyncHandler)(async (req, res) => {
    await menu_service_1.MenuService.deleteMenuItem(req.params.id);
    res.json({ success: true, message: 'Menu item deleted' });
}));
// PATCH /api/menu/items/:id/toggle-availability
router.patch('/items/:id/toggle-availability', auth_1.authenticate, (0, auth_1.authorize)(client_1.Role.ADMIN, client_1.Role.CASHIER), (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const item = await menu_service_1.MenuService.toggleAvailability(req.params.id);
    res.json({ success: true, data: item });
}));
// ─── Variants ─────────────────────────────────────────────
// POST /api/menu/items/:id/variants
router.post('/items/:id/variants', auth_1.authenticate, (0, auth_1.authorize)(client_1.Role.ADMIN), (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const variant = await menu_service_1.MenuService.addVariant(req.params.id, req.body);
    res.status(201).json({ success: true, data: variant });
}));
// PUT /api/menu/variants/:id
router.put('/variants/:id', auth_1.authenticate, (0, auth_1.authorize)(client_1.Role.ADMIN), (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const variant = await menu_service_1.MenuService.updateVariant(req.params.id, req.body);
    res.json({ success: true, data: variant });
}));
// DELETE /api/menu/variants/:id
router.delete('/variants/:id', auth_1.authenticate, (0, auth_1.authorize)(client_1.Role.ADMIN), (0, errorHandler_1.asyncHandler)(async (req, res) => {
    await menu_service_1.MenuService.deleteVariant(req.params.id);
    res.json({ success: true, message: 'Variant deleted' });
}));
exports.default = router;
//# sourceMappingURL=menu.routes.js.map