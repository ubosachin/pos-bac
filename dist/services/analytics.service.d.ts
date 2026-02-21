export declare class AnalyticsService {
    static getDashboardStats(dateFrom?: Date, dateTo?: Date): Promise<{
        summary: {
            totalOrders: number;
            totalRevenue: number | import("@prisma/client/runtime/library").Decimal;
            totalTax: number | import("@prisma/client/runtime/library").Decimal;
            totalDiscount: number | import("@prisma/client/runtime/library").Decimal;
            subtotal: number | import("@prisma/client/runtime/library").Decimal;
            averageOrderValue: number | import("@prisma/client/runtime/library").Decimal;
            cancelledOrders: number;
        };
        paymentBreakdown: (import(".prisma/client").Prisma.PickEnumerable<import(".prisma/client").Prisma.OrderGroupByOutputType, "paymentMethod"[]> & {
            _count: number;
            _sum: {
                totalAmount: import("@prisma/client/runtime/library").Decimal | null;
            };
        })[];
        hourlyData: {
            count: number;
            revenue: number;
            hour: number;
            label: string;
        }[];
    }>;
    private static getHourlyBreakdown;
    static getTopSellingItems(limit?: number, dateFrom?: Date, dateTo?: Date): Promise<{
        menuItem: any;
        totalQuantity: any;
        totalRevenue: any;
        orderCount: any;
    }[]>;
    static getRevenueTrend(days?: number): Promise<{
        orders: number;
        revenue: number;
        date: string;
    }[]>;
    static getCategoryPerformance(dateFrom?: Date, dateTo?: Date): Promise<unknown>;
    static getPeakHours(days?: number): Promise<{
        hour: number;
        label: string;
        averageOrders: number;
        totalOrders: number;
    }[]>;
    static getCancelledOrdersReport(dateFrom?: Date, dateTo?: Date): Promise<{
        total: number;
        totalLostRevenue: number;
        orders: ({
            cashier: {
                firstName: string;
                lastName: string;
            } | null;
            items: ({
                menuItem: {
                    name: string;
                };
            } & {
                id: string;
                createdAt: Date;
                notes: string | null;
                menuItemId: string;
                orderId: string;
                variantId: string | null;
                quantity: number;
                unitPrice: import("@prisma/client/runtime/library").Decimal;
                totalPrice: import("@prisma/client/runtime/library").Decimal;
            })[];
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            orderNumber: string;
            tokenNumber: number;
            cashierId: string | null;
            customerName: string | null;
            customerPhone: string | null;
            customerEmail: string | null;
            status: import(".prisma/client").$Enums.OrderStatus;
            subtotal: import("@prisma/client/runtime/library").Decimal;
            taxAmount: import("@prisma/client/runtime/library").Decimal;
            discountAmount: import("@prisma/client/runtime/library").Decimal;
            totalAmount: import("@prisma/client/runtime/library").Decimal;
            discountType: string | null;
            discountValue: import("@prisma/client/runtime/library").Decimal | null;
            couponCode: string | null;
            paymentMethod: import(".prisma/client").$Enums.PaymentMethod;
            paymentStatus: import(".prisma/client").$Enums.PaymentStatus;
            notes: string | null;
            cancelReason: string | null;
            isPriority: boolean;
            counterNumber: number | null;
            orderSource: string;
            orderedAt: Date;
            prepStartedAt: Date | null;
            readyAt: Date | null;
            servedAt: Date | null;
            cancelledAt: Date | null;
        })[];
    }>;
    static getInventoryAnalytics(): Promise<{
        totalItems: number;
        lowStockCount: number;
        recentMovements: ({
            inventoryItem: {
                name: string;
                unit: string;
            };
        } & {
            id: string;
            createdAt: Date;
            type: string;
            referenceId: string | null;
            quantity: import("@prisma/client/runtime/library").Decimal;
            inventoryItemId: string;
            reason: string | null;
        })[];
        topConsumed: (import(".prisma/client").Prisma.PickEnumerable<import(".prisma/client").Prisma.StockMovementGroupByOutputType, "inventoryItemId"[]> & {
            _sum: {
                quantity: import("@prisma/client/runtime/library").Decimal | null;
            };
        })[];
    }>;
}
//# sourceMappingURL=analytics.service.d.ts.map