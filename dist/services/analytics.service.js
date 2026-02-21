"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnalyticsService = void 0;
const client_1 = __importDefault(require("../database/client"));
const client_2 = require("@prisma/client");
class AnalyticsService {
    // ─── Dashboard Overview ─────────────────────────────────
    static async getDashboardStats(dateFrom, dateTo) {
        const now = new Date();
        const startOfDay = new Date(now);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(now);
        endOfDay.setHours(23, 59, 59, 999);
        const from = dateFrom || startOfDay;
        const to = dateTo || endOfDay;
        const where = {
            orderedAt: { gte: from, lte: to },
            status: { not: client_2.OrderStatus.CANCELLED },
        };
        const [totalOrders, revenue, cancelledOrders, avgOrderValue, paymentBreakdown, hourlyData,] = await Promise.all([
            client_1.default.order.count({ where }),
            client_1.default.order.aggregate({
                where,
                _sum: {
                    totalAmount: true,
                    taxAmount: true,
                    discountAmount: true,
                    subtotal: true,
                },
            }),
            client_1.default.order.count({
                where: {
                    orderedAt: { gte: from, lte: to },
                    status: client_2.OrderStatus.CANCELLED,
                },
            }),
            client_1.default.order.aggregate({
                where,
                _avg: { totalAmount: true },
            }),
            client_1.default.order.groupBy({
                by: ['paymentMethod'],
                where,
                _count: true,
                _sum: { totalAmount: true },
            }),
            this.getHourlyBreakdown(from, to),
        ]);
        return {
            summary: {
                totalOrders,
                totalRevenue: revenue._sum.totalAmount || 0,
                totalTax: revenue._sum.taxAmount || 0,
                totalDiscount: revenue._sum.discountAmount || 0,
                subtotal: revenue._sum.subtotal || 0,
                averageOrderValue: avgOrderValue._avg.totalAmount || 0,
                cancelledOrders,
            },
            paymentBreakdown,
            hourlyData,
        };
    }
    // ─── Hourly Breakdown ──────────────────────────────────
    static async getHourlyBreakdown(from, to) {
        const orders = await client_1.default.order.findMany({
            where: {
                orderedAt: { gte: from, lte: to },
                status: { not: client_2.OrderStatus.CANCELLED },
            },
            select: {
                orderedAt: true,
                totalAmount: true,
            },
        });
        const hourlyMap = {};
        for (let h = 0; h < 24; h++) {
            hourlyMap[h] = { count: 0, revenue: 0 };
        }
        for (const order of orders) {
            const hour = order.orderedAt.getHours();
            hourlyMap[hour].count++;
            hourlyMap[hour].revenue += Number(order.totalAmount);
        }
        return Object.entries(hourlyMap).map(([hour, data]) => ({
            hour: parseInt(hour),
            label: `${hour.padStart(2, '0')}:00`,
            ...data,
        }));
    }
    // ─── Top Selling Items ─────────────────────────────────
    static async getTopSellingItems(limit = 10, dateFrom, dateTo) {
        const now = new Date();
        const from = dateFrom || new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        const to = dateTo || now;
        const topItems = await client_1.default.orderItem.groupBy({
            by: ['menuItemId'],
            where: {
                order: {
                    orderedAt: { gte: from, lte: to },
                    status: { not: client_2.OrderStatus.CANCELLED },
                },
            },
            _sum: { quantity: true, totalPrice: true },
            _count: true,
            orderBy: { _sum: { quantity: 'desc' } },
            take: limit,
        });
        // Fetch item details
        const itemIds = topItems.map((i) => i.menuItemId);
        const menuItems = await client_1.default.menuItem.findMany({
            where: { id: { in: itemIds } },
            select: { id: true, name: true, basePrice: true, category: { select: { name: true } } },
        });
        const itemMap = new Map(menuItems.map((m) => [m.id, m]));
        return topItems.map((item) => ({
            menuItem: itemMap.get(item.menuItemId),
            totalQuantity: item._sum.quantity,
            totalRevenue: item._sum.totalPrice,
            orderCount: item._count,
        }));
    }
    // ─── Revenue Trend ─────────────────────────────────────
    static async getRevenueTrend(days = 30) {
        const from = new Date();
        from.setDate(from.getDate() - days);
        from.setHours(0, 0, 0, 0);
        const orders = await client_1.default.order.findMany({
            where: {
                orderedAt: { gte: from },
                status: { not: client_2.OrderStatus.CANCELLED },
            },
            select: {
                orderedAt: true,
                totalAmount: true,
            },
            orderBy: { orderedAt: 'asc' },
        });
        // Group by date
        const dailyMap = {};
        for (let d = 0; d < days; d++) {
            const date = new Date(from);
            date.setDate(date.getDate() + d);
            const key = date.toISOString().slice(0, 10);
            dailyMap[key] = { orders: 0, revenue: 0 };
        }
        for (const order of orders) {
            const key = order.orderedAt.toISOString().slice(0, 10);
            if (dailyMap[key]) {
                dailyMap[key].orders++;
                dailyMap[key].revenue += Number(order.totalAmount);
            }
        }
        return Object.entries(dailyMap).map(([date, data]) => ({
            date,
            ...data,
        }));
    }
    // ─── Category Performance ──────────────────────────────
    static async getCategoryPerformance(dateFrom, dateTo) {
        const now = new Date();
        const from = dateFrom || new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        const to = dateTo || now;
        const result = await client_1.default.$queryRaw `
      SELECT 
        c.name as category_name,
        COUNT(DISTINCT o.id) as order_count,
        SUM(oi.quantity) as total_quantity,
        SUM(oi.total_price) as total_revenue
      FROM order_items oi
      JOIN menu_items mi ON oi.menu_item_id = mi.id
      JOIN categories c ON mi.category_id = c.id
      JOIN orders o ON oi.order_id = o.id
      WHERE o.ordered_at >= ${from}
        AND o.ordered_at <= ${to}
        AND o.status != 'CANCELLED'
      GROUP BY c.id, c.name
      ORDER BY total_revenue DESC
    `;
        return result;
    }
    // ─── Peak Hours Analysis ───────────────────────────────
    static async getPeakHours(days = 7) {
        const from = new Date();
        from.setDate(from.getDate() - days);
        const orders = await client_1.default.order.findMany({
            where: {
                orderedAt: { gte: from },
                status: { not: client_2.OrderStatus.CANCELLED },
            },
            select: { orderedAt: true },
        });
        const hourCounts = {};
        for (let h = 0; h < 24; h++)
            hourCounts[h] = 0;
        for (const order of orders) {
            hourCounts[order.orderedAt.getHours()]++;
        }
        return Object.entries(hourCounts)
            .map(([hour, count]) => ({
            hour: parseInt(hour),
            label: `${hour.padStart(2, '0')}:00`,
            averageOrders: Math.round((count / days) * 100) / 100,
            totalOrders: count,
        }))
            .sort((a, b) => b.totalOrders - a.totalOrders);
    }
    // ─── Cancelled Orders Report ───────────────────────────
    static async getCancelledOrdersReport(dateFrom, dateTo) {
        const now = new Date();
        const from = dateFrom || new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        const to = dateTo || now;
        const orders = await client_1.default.order.findMany({
            where: {
                status: client_2.OrderStatus.CANCELLED,
                orderedAt: { gte: from, lte: to },
            },
            include: {
                cashier: { select: { firstName: true, lastName: true } },
                items: {
                    include: {
                        menuItem: { select: { name: true } },
                    },
                },
            },
            orderBy: { orderedAt: 'desc' },
        });
        return {
            total: orders.length,
            totalLostRevenue: orders.reduce((sum, o) => sum + Number(o.totalAmount), 0),
            orders,
        };
    }
    // ─── Inventory Analytics ───────────────────────────────
    static async getInventoryAnalytics() {
        const [totalItems, lowStockCount, recentMovements, topConsumed] = await Promise.all([
            client_1.default.inventoryItem.count({ where: { deletedAt: null, isActive: true } }),
            client_1.default.$queryRaw `
        SELECT COUNT(*) as count FROM inventory_items 
        WHERE deleted_at IS NULL AND is_active = true 
        AND current_stock <= min_stock
      `,
            client_1.default.stockMovement.findMany({
                orderBy: { createdAt: 'desc' },
                take: 10,
                include: {
                    inventoryItem: { select: { name: true, unit: true } },
                },
            }),
            client_1.default.stockMovement.groupBy({
                by: ['inventoryItemId'],
                where: { type: 'OUT' },
                _sum: { quantity: true },
                orderBy: { _sum: { quantity: 'desc' } },
                take: 10,
            }),
        ]);
        return {
            totalItems,
            lowStockCount: Number(lowStockCount[0]?.count || 0),
            recentMovements,
            topConsumed,
        };
    }
}
exports.AnalyticsService = AnalyticsService;
//# sourceMappingURL=analytics.service.js.map