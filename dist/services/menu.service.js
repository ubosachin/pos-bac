"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MenuService = void 0;
const client_1 = __importDefault(require("../database/client"));
const errorHandler_1 = require("../middleware/errorHandler");
class MenuService {
    // ─── Categories ─────────────────────────────────────────
    static async getAllCategories(includeInactive = false) {
        return client_1.default.category.findMany({
            where: {
                deletedAt: null,
                ...(includeInactive ? {} : { isActive: true }),
            },
            orderBy: { sortOrder: 'asc' },
            include: {
                _count: { select: { menuItems: true } },
            },
        });
    }
    static async createCategory(data) {
        return client_1.default.category.create({ data });
    }
    static async updateCategory(id, data) {
        return client_1.default.category.update({ where: { id }, data });
    }
    static async deleteCategory(id) {
        const itemCount = await client_1.default.menuItem.count({
            where: { categoryId: id, deletedAt: null },
        });
        if (itemCount > 0) {
            throw new errorHandler_1.AppError(400, 'Cannot delete category with active menu items');
        }
        return client_1.default.category.update({
            where: { id },
            data: { deletedAt: new Date(), isActive: false },
        });
    }
    // ─── Menu Items ─────────────────────────────────────────
    static async getAllMenuItems(params) {
        const { categoryId, search, isAvailable, isVeg, page = 1, limit = 50 } = params;
        const skip = (page - 1) * limit;
        const where = {
            deletedAt: null,
            ...(categoryId && { categoryId }),
            ...(isAvailable !== undefined && { isAvailable }),
            ...(isVeg !== undefined && { isVeg }),
            ...(search && {
                OR: [
                    { name: { contains: search, mode: 'insensitive' } },
                    { description: { contains: search, mode: 'insensitive' } },
                ],
            }),
        };
        const [items, total] = await Promise.all([
            client_1.default.menuItem.findMany({
                where,
                skip,
                take: limit,
                orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
                include: {
                    category: { select: { id: true, name: true, slug: true } },
                    variants: {
                        where: { isAvailable: true },
                        orderBy: { priceAddon: 'asc' },
                    },
                },
            }),
            client_1.default.menuItem.count({ where }),
        ]);
        return {
            items,
            pagination: { page, limit, total, pages: Math.ceil(total / limit) },
        };
    }
    static async getMenuItemById(id) {
        const item = await client_1.default.menuItem.findUnique({
            where: { id },
            include: {
                category: true,
                variants: { orderBy: { priceAddon: 'asc' } },
                ingredients: {
                    include: { inventoryItem: { select: { id: true, name: true, unit: true } } },
                },
            },
        });
        if (!item)
            throw new errorHandler_1.AppError(404, 'Menu item not found');
        return item;
    }
    static async createMenuItem(data) {
        const { variants, ...itemData } = data;
        return client_1.default.menuItem.create({
            data: {
                ...itemData,
                ...(variants && {
                    variants: {
                        create: variants,
                    },
                }),
            },
            include: {
                category: { select: { id: true, name: true } },
                variants: true,
            },
        });
    }
    static async updateMenuItem(id, data) {
        return client_1.default.menuItem.update({
            where: { id },
            data,
            include: {
                category: { select: { id: true, name: true } },
                variants: true,
            },
        });
    }
    static async deleteMenuItem(id) {
        return client_1.default.menuItem.update({
            where: { id },
            data: { deletedAt: new Date(), isAvailable: false },
        });
    }
    static async toggleAvailability(id) {
        const item = await client_1.default.menuItem.findUnique({ where: { id } });
        if (!item)
            throw new errorHandler_1.AppError(404, 'Menu item not found');
        return client_1.default.menuItem.update({
            where: { id },
            data: { isAvailable: !item.isAvailable },
        });
    }
    // ─── Variants ───────────────────────────────────────────
    static async addVariant(menuItemId, data) {
        return client_1.default.menuVariant.create({
            data: { ...data, menuItemId },
        });
    }
    static async updateVariant(id, data) {
        return client_1.default.menuVariant.update({ where: { id }, data });
    }
    static async deleteVariant(id) {
        return client_1.default.menuVariant.delete({ where: { id } });
    }
    // ─── Search (optimized for POS) ─────────────────────────
    static async quickSearch(query) {
        return client_1.default.menuItem.findMany({
            where: {
                deletedAt: null,
                isAvailable: true,
                OR: [
                    { name: { contains: query, mode: 'insensitive' } },
                    { category: { name: { contains: query, mode: 'insensitive' } } },
                ],
            },
            take: 10,
            include: {
                category: { select: { id: true, name: true } },
                variants: { where: { isAvailable: true } },
            },
            orderBy: { name: 'asc' },
        });
    }
}
exports.MenuService = MenuService;
//# sourceMappingURL=menu.service.js.map