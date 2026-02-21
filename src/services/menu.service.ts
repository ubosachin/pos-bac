import prisma from '../database/client';
import { AppError } from '../middleware/errorHandler';

export class MenuService {
    // ─── Categories ─────────────────────────────────────────
    static async getAllCategories(includeInactive = false) {
        return prisma.category.findMany({
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

    static async createCategory(data: {
        name: string;
        slug: string;
        description?: string;
        icon?: string;
        sortOrder?: number;
    }) {
        return prisma.category.create({ data });
    }

    static async updateCategory(id: string, data: {
        name?: string;
        slug?: string;
        description?: string;
        icon?: string;
        sortOrder?: number;
        isActive?: boolean;
    }) {
        return prisma.category.update({ where: { id }, data });
    }

    static async deleteCategory(id: string) {
        const itemCount = await prisma.menuItem.count({
            where: { categoryId: id, deletedAt: null },
        });
        if (itemCount > 0) {
            throw new AppError(400, 'Cannot delete category with active menu items');
        }
        return prisma.category.update({
            where: { id },
            data: { deletedAt: new Date(), isActive: false },
        });
    }

    // ─── Menu Items ─────────────────────────────────────────
    static async getAllMenuItems(params: {
        categoryId?: string;
        search?: string;
        isAvailable?: boolean;
        isVeg?: boolean;
        page?: number;
        limit?: number;
    }) {
        const { categoryId, search, isAvailable, isVeg, page = 1, limit = 50 } = params;
        const skip = (page - 1) * limit;

        const where: any = {
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
            prisma.menuItem.findMany({
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
            prisma.menuItem.count({ where }),
        ]);

        return {
            items,
            pagination: { page, limit, total, pages: Math.ceil(total / limit) },
        };
    }

    static async getMenuItemById(id: string) {
        const item = await prisma.menuItem.findUnique({
            where: { id },
            include: {
                category: true,
                variants: { orderBy: { priceAddon: 'asc' } },
                ingredients: {
                    include: { inventoryItem: { select: { id: true, name: true, unit: true } } },
                },
            },
        });

        if (!item) throw new AppError(404, 'Menu item not found');
        return item;
    }

    static async createMenuItem(data: {
        name: string;
        slug: string;
        description?: string;
        categoryId: string;
        basePrice: number;
        taxRate?: number;
        image?: string;
        isVeg?: boolean;
        prepTime?: number;
        availableFrom?: string;
        availableTo?: string;
        availableDays?: string;
        variants?: { name: string; priceAddon: number }[];
    }) {
        const { variants, ...itemData } = data;

        return prisma.menuItem.create({
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

    static async updateMenuItem(id: string, data: {
        name?: string;
        slug?: string;
        description?: string;
        categoryId?: string;
        basePrice?: number;
        taxRate?: number;
        image?: string;
        isVeg?: boolean;
        isAvailable?: boolean;
        prepTime?: number;
        sortOrder?: number;
        availableFrom?: string;
        availableTo?: string;
        availableDays?: string;
    }) {
        return prisma.menuItem.update({
            where: { id },
            data,
            include: {
                category: { select: { id: true, name: true } },
                variants: true,
            },
        });
    }

    static async deleteMenuItem(id: string) {
        return prisma.menuItem.update({
            where: { id },
            data: { deletedAt: new Date(), isAvailable: false },
        });
    }

    static async toggleAvailability(id: string) {
        const item = await prisma.menuItem.findUnique({ where: { id } });
        if (!item) throw new AppError(404, 'Menu item not found');

        return prisma.menuItem.update({
            where: { id },
            data: { isAvailable: !item.isAvailable },
        });
    }

    // ─── Variants ───────────────────────────────────────────
    static async addVariant(menuItemId: string, data: { name: string; priceAddon: number }) {
        return prisma.menuVariant.create({
            data: { ...data, menuItemId },
        });
    }

    static async updateVariant(id: string, data: { name?: string; priceAddon?: number; isAvailable?: boolean }) {
        return prisma.menuVariant.update({ where: { id }, data });
    }

    static async deleteVariant(id: string) {
        return prisma.menuVariant.delete({ where: { id } });
    }

    // ─── Search (optimized for POS) ─────────────────────────
    static async quickSearch(query: string) {
        return prisma.menuItem.findMany({
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
