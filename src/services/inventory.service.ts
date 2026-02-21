import prisma from '../database/client';
import { AppError } from '../middleware/errorHandler';
import { Prisma } from '@prisma/client';

export class InventoryService {
    // ─── Inventory Items ────────────────────────────────────
    static async getAll(params: {
        search?: string;
        lowStock?: boolean;
        page?: number;
        limit?: number;
    }) {
        const { search, lowStock, page = 1, limit = 20 } = params;
        const skip = (page - 1) * limit;

        const where: any = {
            deletedAt: null,
            isActive: true,
            ...(search && {
                name: { contains: search, mode: 'insensitive' },
            }),
        };

        // For low stock, filter items where currentStock <= minStock
        if (lowStock) {
            where.currentStock = { lte: prisma.inventoryItem.fields.minStock };
        }

        const [items, total] = await Promise.all([
            prisma.inventoryItem.findMany({
                where,
                skip,
                take: limit,
                orderBy: { name: 'asc' },
                include: {
                    _count: { select: { menuIngredients: true } },
                },
            }),
            prisma.inventoryItem.count({ where }),
        ]);

        return {
            items,
            pagination: { page, limit, total, pages: Math.ceil(total / limit) },
        };
    }

    static async getById(id: string) {
        const item = await prisma.inventoryItem.findUnique({
            where: { id },
            include: {
                menuIngredients: {
                    include: {
                        menuItem: { select: { id: true, name: true } },
                    },
                },
                stockMovements: {
                    orderBy: { createdAt: 'desc' },
                    take: 20,
                },
            },
        });

        if (!item) throw new AppError(404, 'Inventory item not found');
        return item;
    }

    static async create(data: {
        name: string;
        unit: string;
        currentStock: number;
        minStock?: number;
        maxStock?: number;
        costPerUnit: number;
    }) {
        return prisma.inventoryItem.create({ data });
    }

    static async update(id: string, data: {
        name?: string;
        unit?: string;
        minStock?: number;
        maxStock?: number;
        costPerUnit?: number;
    }) {
        return prisma.inventoryItem.update({ where: { id }, data });
    }

    static async adjustStock(id: string, quantity: number, reason: string) {
        return prisma.$transaction(async (tx: any) => {
            const item = await tx.inventoryItem.update({
                where: { id },
                data: {
                    currentStock: { increment: quantity },
                },
            });

            await tx.stockMovement.create({
                data: {
                    inventoryItemId: id,
                    type: quantity > 0 ? 'IN' : 'ADJUSTMENT',
                    quantity: Math.abs(quantity),
                    reason,
                },
            });

            return item;
        });
    }

    static async delete(id: string) {
        return prisma.inventoryItem.update({
            where: { id },
            data: { deletedAt: new Date(), isActive: false },
        });
    }

    // ─── Low Stock Alerts ───────────────────────────────────
    static async getLowStockAlerts() {
        return prisma.$queryRaw`
      SELECT id, name, unit, current_stock, min_stock, cost_per_unit
      FROM inventory_items
      WHERE deleted_at IS NULL
        AND is_active = true
        AND current_stock <= min_stock
      ORDER BY (current_stock / NULLIF(min_stock, 0)) ASC
    `;
    }

    // ─── Ingredient Mapping ─────────────────────────────────
    static async mapIngredient(menuItemId: string, inventoryItemId: string, quantityNeeded: number) {
        return prisma.menuIngredient.upsert({
            where: {
                menuItemId_inventoryItemId: { menuItemId, inventoryItemId },
            },
            update: { quantityNeeded },
            create: { menuItemId, inventoryItemId, quantityNeeded },
        });
    }

    static async removeIngredientMapping(menuItemId: string, inventoryItemId: string) {
        return prisma.menuIngredient.delete({
            where: {
                menuItemId_inventoryItemId: { menuItemId, inventoryItemId },
            },
        });
    }

    // ─── Wastage ────────────────────────────────────────────
    static async recordWastage(data: {
        inventoryItemId: string;
        quantity: number;
        reason: string;
        recordedBy: string;
    }) {
        return prisma.$transaction(async (tx: any) => {
            await tx.inventoryItem.update({
                where: { id: data.inventoryItemId },
                data: {
                    currentStock: { decrement: data.quantity },
                },
            });

            await tx.stockMovement.create({
                data: {
                    inventoryItemId: data.inventoryItemId,
                    type: 'WASTAGE',
                    quantity: data.quantity,
                    reason: data.reason,
                },
            });

            return tx.wastageRecord.create({ data });
        });
    }

    static async getWastageRecords(params: {
        dateFrom?: Date;
        dateTo?: Date;
        page?: number;
        limit?: number;
    }) {
        const { dateFrom, dateTo, page = 1, limit = 20 } = params;
        const skip = (page - 1) * limit;

        const where: any = {};
        if (dateFrom || dateTo) {
            where.createdAt = {
                ...(dateFrom && { gte: dateFrom }),
                ...(dateTo && { lte: dateTo }),
            };
        }

        const [records, total] = await Promise.all([
            prisma.wastageRecord.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                include: {
                    inventoryItem: { select: { id: true, name: true, unit: true } },
                },
            }),
            prisma.wastageRecord.count({ where }),
        ]);

        return {
            records,
            pagination: { page, limit, total, pages: Math.ceil(total / limit) },
        };
    }

    // ─── Vendors ────────────────────────────────────────────
    static async getAllVendors(params: { search?: string; page?: number; limit?: number }) {
        const { search, page = 1, limit = 20 } = params;
        const skip = (page - 1) * limit;

        const where: any = {
            deletedAt: null,
            isActive: true,
            ...(search && {
                OR: [
                    { name: { contains: search, mode: 'insensitive' } },
                    { contact: { contains: search, mode: 'insensitive' } },
                ],
            }),
        };

        const [vendors, total] = await Promise.all([
            prisma.vendor.findMany({
                where,
                skip,
                take: limit,
                orderBy: { name: 'asc' },
            }),
            prisma.vendor.count({ where }),
        ]);

        return { vendors, pagination: { page, limit, total, pages: Math.ceil(total / limit) } };
    }

    static async createVendor(data: {
        name: string;
        contact?: string;
        email?: string;
        phone?: string;
        address?: string;
        gstNumber?: string;
    }) {
        return prisma.vendor.create({ data });
    }

    static async updateVendor(id: string, data: any) {
        return prisma.vendor.update({ where: { id }, data });
    }

    // ─── Purchases ──────────────────────────────────────────
    static async createPurchase(data: {
        vendorId: string;
        invoiceNo?: string;
        notes?: string;
        items: { inventoryItemId: string; quantity: number; unitPrice: number }[];
    }) {
        const totalAmount = data.items.reduce(
            (sum, item) => sum + item.quantity * item.unitPrice,
            0,
        );

        return prisma.$transaction(async (tx: any) => {
            const purchase = await tx.purchase.create({
                data: {
                    vendorId: data.vendorId,
                    invoiceNo: data.invoiceNo,
                    totalAmount,
                    notes: data.notes,
                    items: {
                        create: data.items.map((item) => ({
                            inventoryItemId: item.inventoryItemId,
                            quantity: item.quantity,
                            unitPrice: item.unitPrice,
                            totalPrice: item.quantity * item.unitPrice,
                        })),
                    },
                },
                include: {
                    items: {
                        include: {
                            inventoryItem: { select: { id: true, name: true } },
                        },
                    },
                    vendor: { select: { id: true, name: true } },
                },
            });

            // Update stock levels
            for (const item of data.items) {
                await tx.inventoryItem.update({
                    where: { id: item.inventoryItemId },
                    data: {
                        currentStock: { increment: item.quantity },
                        costPerUnit: item.unitPrice,
                    },
                });

                await tx.stockMovement.create({
                    data: {
                        inventoryItemId: item.inventoryItemId,
                        type: 'IN',
                        quantity: item.quantity,
                        reason: `Purchase ${purchase.id}`,
                        referenceId: purchase.id,
                    },
                });
            }

            return purchase;
        });
    }
}
