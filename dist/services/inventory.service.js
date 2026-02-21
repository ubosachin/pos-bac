"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.InventoryService = void 0;
const client_1 = __importDefault(require("../database/client"));
const errorHandler_1 = require("../middleware/errorHandler");
class InventoryService {
    // ─── Inventory Items ────────────────────────────────────
    static async getAll(params) {
        const { search, lowStock, page = 1, limit = 20 } = params;
        const skip = (page - 1) * limit;
        const where = {
            deletedAt: null,
            isActive: true,
            ...(search && {
                name: { contains: search, mode: 'insensitive' },
            }),
        };
        // For low stock, filter items where currentStock <= minStock
        if (lowStock) {
            where.currentStock = { lte: client_1.default.inventoryItem.fields.minStock };
        }
        const [items, total] = await Promise.all([
            client_1.default.inventoryItem.findMany({
                where,
                skip,
                take: limit,
                orderBy: { name: 'asc' },
                include: {
                    _count: { select: { menuIngredients: true } },
                },
            }),
            client_1.default.inventoryItem.count({ where }),
        ]);
        return {
            items,
            pagination: { page, limit, total, pages: Math.ceil(total / limit) },
        };
    }
    static async getById(id) {
        const item = await client_1.default.inventoryItem.findUnique({
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
        if (!item)
            throw new errorHandler_1.AppError(404, 'Inventory item not found');
        return item;
    }
    static async create(data) {
        return client_1.default.inventoryItem.create({ data });
    }
    static async update(id, data) {
        return client_1.default.inventoryItem.update({ where: { id }, data });
    }
    static async adjustStock(id, quantity, reason) {
        return client_1.default.$transaction(async (tx) => {
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
    static async delete(id) {
        return client_1.default.inventoryItem.update({
            where: { id },
            data: { deletedAt: new Date(), isActive: false },
        });
    }
    // ─── Low Stock Alerts ───────────────────────────────────
    static async getLowStockAlerts() {
        return client_1.default.$queryRaw `
      SELECT id, name, unit, current_stock, min_stock, cost_per_unit
      FROM inventory_items
      WHERE deleted_at IS NULL
        AND is_active = true
        AND current_stock <= min_stock
      ORDER BY (current_stock / NULLIF(min_stock, 0)) ASC
    `;
    }
    // ─── Ingredient Mapping ─────────────────────────────────
    static async mapIngredient(menuItemId, inventoryItemId, quantityNeeded) {
        return client_1.default.menuIngredient.upsert({
            where: {
                menuItemId_inventoryItemId: { menuItemId, inventoryItemId },
            },
            update: { quantityNeeded },
            create: { menuItemId, inventoryItemId, quantityNeeded },
        });
    }
    static async removeIngredientMapping(menuItemId, inventoryItemId) {
        return client_1.default.menuIngredient.delete({
            where: {
                menuItemId_inventoryItemId: { menuItemId, inventoryItemId },
            },
        });
    }
    // ─── Wastage ────────────────────────────────────────────
    static async recordWastage(data) {
        return client_1.default.$transaction(async (tx) => {
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
    static async getWastageRecords(params) {
        const { dateFrom, dateTo, page = 1, limit = 20 } = params;
        const skip = (page - 1) * limit;
        const where = {};
        if (dateFrom || dateTo) {
            where.createdAt = {
                ...(dateFrom && { gte: dateFrom }),
                ...(dateTo && { lte: dateTo }),
            };
        }
        const [records, total] = await Promise.all([
            client_1.default.wastageRecord.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                include: {
                    inventoryItem: { select: { id: true, name: true, unit: true } },
                },
            }),
            client_1.default.wastageRecord.count({ where }),
        ]);
        return {
            records,
            pagination: { page, limit, total, pages: Math.ceil(total / limit) },
        };
    }
    // ─── Vendors ────────────────────────────────────────────
    static async getAllVendors(params) {
        const { search, page = 1, limit = 20 } = params;
        const skip = (page - 1) * limit;
        const where = {
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
            client_1.default.vendor.findMany({
                where,
                skip,
                take: limit,
                orderBy: { name: 'asc' },
            }),
            client_1.default.vendor.count({ where }),
        ]);
        return { vendors, pagination: { page, limit, total, pages: Math.ceil(total / limit) } };
    }
    static async createVendor(data) {
        return client_1.default.vendor.create({ data });
    }
    static async updateVendor(id, data) {
        return client_1.default.vendor.update({ where: { id }, data });
    }
    // ─── Purchases ──────────────────────────────────────────
    static async createPurchase(data) {
        const totalAmount = data.items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
        return client_1.default.$transaction(async (tx) => {
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
exports.InventoryService = InventoryService;
//# sourceMappingURL=inventory.service.js.map