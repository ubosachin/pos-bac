import { Router } from 'express';
import { MenuService } from '../services/menu.service';
import { authenticate, authorize, optionalAuth, AuthRequest } from '../middleware/auth';
import { validate, asyncHandler } from '../middleware/errorHandler';
import { createCategorySchema, createMenuItemSchema, updateMenuItemSchema } from '../validators/schemas';
import { Role } from '@prisma/client';

const router = Router();

// ─── Public/Auth-Optional Routes ─────────────────────────

// GET /api/menu/categories
router.get(
    '/categories',
    asyncHandler(async (req, res) => {
        const categories = await MenuService.getAllCategories(req.query.includeInactive === 'true');
        res.json({ success: true, data: categories });
    }),
);

// GET /api/menu/items
router.get(
    '/items',
    asyncHandler(async (req, res) => {
        const result = await MenuService.getAllMenuItems({
            categoryId: req.query.categoryId as string | undefined,
            search: req.query.search as string | undefined,
            isAvailable: req.query.isAvailable ? req.query.isAvailable === 'true' : undefined,
            isVeg: req.query.isVeg ? req.query.isVeg === 'true' : undefined,
            page: parseInt(req.query.page as string) || 1,
            limit: parseInt(req.query.limit as string) || 50,
        });
        res.json({ success: true, data: result });
    }),
);

// GET /api/menu/items/:id
router.get(
    '/items/:id',
    asyncHandler(async (req, res) => {
        const item = await MenuService.getMenuItemById((req.params.id as string));
        res.json({ success: true, data: item });
    }),
);

// GET /api/menu/search - Quick search for POS
router.get(
    '/search',
    asyncHandler(async (req, res) => {
        const items = await MenuService.quickSearch(req.query.q as string || '');
        res.json({ success: true, data: items });
    }),
);

// ─── Admin-Only Routes ────────────────────────────────────

// POST /api/menu/categories
router.post(
    '/categories',
    authenticate,
    authorize(Role.ADMIN),
    validate(createCategorySchema),
    asyncHandler(async (req, res) => {
        const category = await MenuService.createCategory(req.body);
        res.status(201).json({ success: true, data: category });
    }),
);

// PUT /api/menu/categories/:id
router.put(
    '/categories/:id',
    authenticate,
    authorize(Role.ADMIN),
    asyncHandler(async (req, res) => {
        const category = await MenuService.updateCategory((req.params.id as string), req.body);
        res.json({ success: true, data: category });
    }),
);

// DELETE /api/menu/categories/:id
router.delete(
    '/categories/:id',
    authenticate,
    authorize(Role.ADMIN),
    asyncHandler(async (req, res) => {
        await MenuService.deleteCategory((req.params.id as string));
        res.json({ success: true, message: 'Category deleted' });
    }),
);

// POST /api/menu/items
router.post(
    '/items',
    authenticate,
    authorize(Role.ADMIN),
    validate(createMenuItemSchema),
    asyncHandler(async (req, res) => {
        const item = await MenuService.createMenuItem(req.body);
        res.status(201).json({ success: true, data: item });
    }),
);

// PUT /api/menu/items/:id
router.put(
    '/items/:id',
    authenticate,
    authorize(Role.ADMIN),
    validate(updateMenuItemSchema),
    asyncHandler(async (req, res) => {
        const item = await MenuService.updateMenuItem((req.params.id as string), req.body);
        res.json({ success: true, data: item });
    }),
);

// DELETE /api/menu/items/:id
router.delete(
    '/items/:id',
    authenticate,
    authorize(Role.ADMIN),
    asyncHandler(async (req, res) => {
        await MenuService.deleteMenuItem((req.params.id as string));
        res.json({ success: true, message: 'Menu item deleted' });
    }),
);

// PATCH /api/menu/items/:id/toggle-availability
router.patch(
    '/items/:id/toggle-availability',
    authenticate,
    authorize(Role.ADMIN, Role.CASHIER),
    asyncHandler(async (req, res) => {
        const item = await MenuService.toggleAvailability((req.params.id as string));
        res.json({ success: true, data: item });
    }),
);

// ─── Variants ─────────────────────────────────────────────

// POST /api/menu/items/:id/variants
router.post(
    '/items/:id/variants',
    authenticate,
    authorize(Role.ADMIN),
    asyncHandler(async (req, res) => {
        const variant = await MenuService.addVariant((req.params.id as string), req.body);
        res.status(201).json({ success: true, data: variant });
    }),
);

// PUT /api/menu/variants/:id
router.put(
    '/variants/:id',
    authenticate,
    authorize(Role.ADMIN),
    asyncHandler(async (req, res) => {
        const variant = await MenuService.updateVariant((req.params.id as string), req.body);
        res.json({ success: true, data: variant });
    }),
);

// DELETE /api/menu/variants/:id
router.delete(
    '/variants/:id',
    authenticate,
    authorize(Role.ADMIN),
    asyncHandler(async (req, res) => {
        await MenuService.deleteVariant((req.params.id as string));
        res.json({ success: true, message: 'Variant deleted' });
    }),
);

export default router;
