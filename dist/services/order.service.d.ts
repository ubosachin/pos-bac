import { OrderStatus, PaymentMethod, PaymentStatus, Prisma } from '@prisma/client';
interface OrderItemInput {
    menuItemId: string;
    variantId?: string;
    quantity: number;
    notes?: string;
}
interface CreateOrderInput {
    cashierId?: string;
    customerName?: string;
    customerPhone?: string;
    items: OrderItemInput[];
    paymentMethod: PaymentMethod;
    discountType?: string;
    discountValue?: number;
    couponCode?: string;
    notes?: string;
    isPriority?: boolean;
    counterNumber?: number;
}
export declare class OrderService {
    private static generateOrderNumber;
    private static generateTokenNumber;
    static createOrder(input: CreateOrderInput): Promise<any>;
    static getOrders(params: {
        status?: OrderStatus;
        cashierId?: string;
        paymentStatus?: PaymentStatus;
        dateFrom?: Date;
        dateTo?: Date;
        page?: number;
        limit?: number;
        search?: string;
    }): Promise<{
        orders: ({
            cashier: {
                id: string;
                firstName: string;
                lastName: string;
            } | null;
            items: ({
                menuItem: {
                    name: string;
                    id: string;
                };
                variant: {
                    name: string;
                    id: string;
                } | null;
            } & {
                id: string;
                createdAt: Date;
                notes: string | null;
                menuItemId: string;
                orderId: string;
                variantId: string | null;
                quantity: number;
                unitPrice: Prisma.Decimal;
                totalPrice: Prisma.Decimal;
            })[];
            payments: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                status: import(".prisma/client").$Enums.PaymentStatus;
                amount: Prisma.Decimal;
                orderId: string;
                gateway: import(".prisma/client").$Enums.PaymentGateway;
                gatewayOrderId: string | null;
                paymentSessionId: string | null;
                paymentLink: string | null;
                method: import(".prisma/client").$Enums.PaymentMethod;
                currency: string;
                transactionId: string | null;
                bankReference: string | null;
                paymentMethodDetail: string | null;
                idempotencyKey: string | null;
                webhookVerified: boolean;
                amountVerified: boolean;
                refundId: string | null;
                refundAmount: Prisma.Decimal | null;
                refundStatus: string | null;
                refundedAt: Date | null;
                gatewayResponse: Prisma.JsonValue | null;
                webhookPayload: Prisma.JsonValue | null;
                failureReason: string | null;
                errorCode: string | null;
                metadata: Prisma.JsonValue | null;
            }[];
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
            subtotal: Prisma.Decimal;
            taxAmount: Prisma.Decimal;
            discountAmount: Prisma.Decimal;
            totalAmount: Prisma.Decimal;
            discountType: string | null;
            discountValue: Prisma.Decimal | null;
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
        pagination: {
            page: number;
            limit: number;
            total: number;
            pages: number;
        };
    }>;
    static getOrderById(id: string): Promise<{
        cashier: {
            id: string;
            firstName: string;
            lastName: string;
        } | null;
        items: ({
            menuItem: {
                name: string;
                id: string;
                basePrice: Prisma.Decimal;
                image: string | null;
            };
            variant: {
                name: string;
                id: string;
                priceAddon: Prisma.Decimal;
            } | null;
        } & {
            id: string;
            createdAt: Date;
            notes: string | null;
            menuItemId: string;
            orderId: string;
            variantId: string | null;
            quantity: number;
            unitPrice: Prisma.Decimal;
            totalPrice: Prisma.Decimal;
        })[];
        payments: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            status: import(".prisma/client").$Enums.PaymentStatus;
            amount: Prisma.Decimal;
            orderId: string;
            gateway: import(".prisma/client").$Enums.PaymentGateway;
            gatewayOrderId: string | null;
            paymentSessionId: string | null;
            paymentLink: string | null;
            method: import(".prisma/client").$Enums.PaymentMethod;
            currency: string;
            transactionId: string | null;
            bankReference: string | null;
            paymentMethodDetail: string | null;
            idempotencyKey: string | null;
            webhookVerified: boolean;
            amountVerified: boolean;
            refundId: string | null;
            refundAmount: Prisma.Decimal | null;
            refundStatus: string | null;
            refundedAt: Date | null;
            gatewayResponse: Prisma.JsonValue | null;
            webhookPayload: Prisma.JsonValue | null;
            failureReason: string | null;
            errorCode: string | null;
            metadata: Prisma.JsonValue | null;
        }[];
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
        subtotal: Prisma.Decimal;
        taxAmount: Prisma.Decimal;
        discountAmount: Prisma.Decimal;
        totalAmount: Prisma.Decimal;
        discountType: string | null;
        discountValue: Prisma.Decimal | null;
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
    }>;
    static updateStatus(id: string, status: OrderStatus, cancelReason?: string): Promise<{
        items: ({
            menuItem: {
                name: string;
                id: string;
            };
            variant: {
                name: string;
                id: string;
            } | null;
        } & {
            id: string;
            createdAt: Date;
            notes: string | null;
            menuItemId: string;
            orderId: string;
            variantId: string | null;
            quantity: number;
            unitPrice: Prisma.Decimal;
            totalPrice: Prisma.Decimal;
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
        subtotal: Prisma.Decimal;
        taxAmount: Prisma.Decimal;
        discountAmount: Prisma.Decimal;
        totalAmount: Prisma.Decimal;
        discountType: string | null;
        discountValue: Prisma.Decimal | null;
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
    }>;
    static holdOrder(id: string): Promise<{
        items: ({
            menuItem: {
                name: string;
                id: string;
            };
            variant: {
                name: string;
                id: string;
            } | null;
        } & {
            id: string;
            createdAt: Date;
            notes: string | null;
            menuItemId: string;
            orderId: string;
            variantId: string | null;
            quantity: number;
            unitPrice: Prisma.Decimal;
            totalPrice: Prisma.Decimal;
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
        subtotal: Prisma.Decimal;
        taxAmount: Prisma.Decimal;
        discountAmount: Prisma.Decimal;
        totalAmount: Prisma.Decimal;
        discountType: string | null;
        discountValue: Prisma.Decimal | null;
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
    }>;
    static resumeOrder(id: string): Promise<{
        items: ({
            menuItem: {
                name: string;
                id: string;
            };
            variant: {
                name: string;
                id: string;
            } | null;
        } & {
            id: string;
            createdAt: Date;
            notes: string | null;
            menuItemId: string;
            orderId: string;
            variantId: string | null;
            quantity: number;
            unitPrice: Prisma.Decimal;
            totalPrice: Prisma.Decimal;
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
        subtotal: Prisma.Decimal;
        taxAmount: Prisma.Decimal;
        discountAmount: Prisma.Decimal;
        totalAmount: Prisma.Decimal;
        discountType: string | null;
        discountValue: Prisma.Decimal | null;
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
    }>;
    static getKitchenQueue(): Promise<({
        items: ({
            menuItem: {
                name: string;
                id: string;
                image: string | null;
                prepTime: number;
            };
            variant: {
                name: string;
                id: string;
            } | null;
        } & {
            id: string;
            createdAt: Date;
            notes: string | null;
            menuItemId: string;
            orderId: string;
            variantId: string | null;
            quantity: number;
            unitPrice: Prisma.Decimal;
            totalPrice: Prisma.Decimal;
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
        subtotal: Prisma.Decimal;
        taxAmount: Prisma.Decimal;
        discountAmount: Prisma.Decimal;
        totalAmount: Prisma.Decimal;
        discountType: string | null;
        discountValue: Prisma.Decimal | null;
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
    })[]>;
    static getDailySummary(date?: Date): Promise<{
        date: string;
        totalOrders: number;
        totalRevenue: number | Prisma.Decimal;
        totalTax: number | Prisma.Decimal;
        totalDiscount: number | Prisma.Decimal;
        paymentBreakdown: (Prisma.PickEnumerable<Prisma.OrderGroupByOutputType, "paymentMethod"[]> & {
            _count: number;
            _sum: {
                totalAmount: Prisma.Decimal | null;
            };
        })[];
        statusBreakdown: (Prisma.PickEnumerable<Prisma.OrderGroupByOutputType, "status"[]> & {
            _count: number;
        })[];
    }>;
}
export {};
//# sourceMappingURL=order.service.d.ts.map