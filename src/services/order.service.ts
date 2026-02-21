import prisma from '../database/client';
import { OrderStatus, PaymentMethod, PaymentStatus, Prisma } from '@prisma/client';
import { AppError } from '../middleware/errorHandler';

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

export class OrderService {
    // ─── Generate Order Number ──────────────────────────────
    private static async generateOrderNumber(): Promise<string> {
        const today = new Date();
        const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '');

        const lastOrder = await prisma.order.findFirst({
            where: {
                orderNumber: { startsWith: `ORD-${dateStr}` },
            },
            orderBy: { orderNumber: 'desc' },
        });

        let seq = 1;
        if (lastOrder) {
            const lastSeq = parseInt(lastOrder.orderNumber.split('-')[2]);
            seq = lastSeq + 1;
        }

        return `ORD-${dateStr}-${seq.toString().padStart(4, '0')}`;
    }

    // ─── Generate Token Number (resets daily) ───────────────
    private static async generateTokenNumber(): Promise<number> {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const lastOrder = await prisma.order.findFirst({
            where: {
                createdAt: { gte: today },
            },
            orderBy: { tokenNumber: 'desc' },
        });

        return (lastOrder?.tokenNumber || 0) + 1;
    }

    // ─── Create Order ──────────────────────────────────────
    static async createOrder(input: CreateOrderInput) {
        const { items, ...orderData } = input;

        // Fetch all menu items & variants in one query
        const menuItemIds = items.map((i) => i.menuItemId);
        const variantIds = items.filter((i) => i.variantId).map((i) => i.variantId!);

        const [menuItems, variants] = await Promise.all([
            prisma.menuItem.findMany({
                where: { id: { in: menuItemIds }, deletedAt: null, isAvailable: true },
            }),
            variantIds.length > 0
                ? prisma.menuVariant.findMany({
                    where: { id: { in: variantIds }, isAvailable: true },
                })
                : Promise.resolve([]),
        ]);

        // Validate all items exist
        const menuItemMap = new Map(menuItems.map((mi: any) => [mi.id, mi]));
        const variantMap = new Map(variants.map((v: any) => [v.id, v]));

        for (const item of items) {
            if (!menuItemMap.has(item.menuItemId)) {
                throw new AppError(400, `Menu item ${item.menuItemId} not found or unavailable`);
            }
            if (item.variantId && !variantMap.has(item.variantId)) {
                throw new AppError(400, `Variant ${item.variantId} not found or unavailable`);
            }
        }

        // Calculate prices
        let subtotal = new Prisma.Decimal(0);
        let totalTax = new Prisma.Decimal(0);

        const orderItems = items.map((item) => {
            const menuItem = menuItemMap.get(item.menuItemId)!;
            const variant = item.variantId ? variantMap.get(item.variantId) : null;

            const unitPrice = (menuItem as any).basePrice.add((variant as any)?.priceAddon || new Prisma.Decimal(0));
            const totalPrice = unitPrice.mul(item.quantity);
            const taxAmount = totalPrice.mul((menuItem as any).taxRate).div(100);

            subtotal = subtotal.add(totalPrice);
            totalTax = totalTax.add(taxAmount);

            return {
                menuItemId: item.menuItemId,
                variantId: item.variantId || null,
                quantity: item.quantity,
                unitPrice,
                totalPrice,
                notes: item.notes,
            };
        });

        // Calculate discount
        let discountAmount = new Prisma.Decimal(0);
        if (orderData.discountType && orderData.discountValue) {
            if (orderData.discountType === 'FLAT') {
                discountAmount = new Prisma.Decimal(orderData.discountValue);
            } else if (orderData.discountType === 'PERCENTAGE') {
                discountAmount = subtotal.mul(orderData.discountValue).div(100);
            }
        }

        // Handle coupon
        if (orderData.couponCode) {
            const coupon = await prisma.coupon.findUnique({
                where: { code: orderData.couponCode },
            });

            if (!coupon || !coupon.isActive) {
                throw new AppError(400, 'Invalid or expired coupon');
            }

            const now = new Date();
            if (now < coupon.validFrom || now > coupon.validTo) {
                throw new AppError(400, 'Coupon is not valid at this time');
            }

            if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
                throw new AppError(400, 'Coupon usage limit reached');
            }

            if (coupon.minOrder && subtotal.lt(coupon.minOrder)) {
                throw new AppError(400, `Minimum order amount for this coupon is ₹${coupon.minOrder}`);
            }

            if (coupon.discountType === 'FLAT') {
                discountAmount = coupon.discountValue;
            } else {
                discountAmount = subtotal.mul(coupon.discountValue).div(100);
                if (coupon.maxDiscount && discountAmount.gt(coupon.maxDiscount)) {
                    discountAmount = coupon.maxDiscount;
                }
            }

            // Increment coupon usage
            await prisma.coupon.update({
                where: { id: coupon.id },
                data: { usedCount: { increment: 1 } },
            });
        }

        const totalAmount = subtotal.add(totalTax).sub(discountAmount);

        const [orderNumber, tokenNumber] = await Promise.all([
            this.generateOrderNumber(),
            this.generateTokenNumber(),
        ]);

        // Create order with items in a transaction
        const order = await prisma.$transaction(async (tx: any) => {
            const createdOrder = await tx.order.create({
                data: {
                    orderNumber,
                    tokenNumber,
                    cashierId: orderData.cashierId,
                    customerName: orderData.customerName,
                    customerPhone: orderData.customerPhone,
                    status: orderData.paymentMethod === PaymentMethod.CASH
                        ? OrderStatus.CONFIRMED
                        : OrderStatus.PENDING,
                    subtotal,
                    taxAmount: totalTax,
                    discountAmount,
                    totalAmount,
                    discountType: orderData.discountType,
                    discountValue: orderData.discountValue ? new Prisma.Decimal(orderData.discountValue) : null,
                    couponCode: orderData.couponCode,
                    paymentMethod: orderData.paymentMethod,
                    paymentStatus: orderData.paymentMethod === PaymentMethod.CASH
                        ? PaymentStatus.COMPLETED
                        : PaymentStatus.PENDING,
                    notes: orderData.notes,
                    isPriority: orderData.isPriority || false,
                    counterNumber: orderData.counterNumber,
                    items: {
                        create: orderItems,
                    },
                    payments: {
                        create: {
                            method: orderData.paymentMethod,
                            amount: totalAmount,
                            status: orderData.paymentMethod === PaymentMethod.CASH
                                ? PaymentStatus.COMPLETED
                                : PaymentStatus.PENDING,
                        },
                    },
                },
                include: {
                    items: {
                        include: {
                            menuItem: { select: { id: true, name: true, image: true } },
                            variant: { select: { id: true, name: true } },
                        },
                    },
                    payments: true,
                    cashier: {
                        select: { id: true, firstName: true, lastName: true },
                    },
                },
            });

            // Auto-deduct inventory
            for (const item of items) {
                const ingredients = await tx.menuIngredient.findMany({
                    where: { menuItemId: item.menuItemId },
                });

                for (const ingredient of ingredients) {
                    const deductQty = ingredient.quantityNeeded.mul(item.quantity);

                    await tx.inventoryItem.update({
                        where: { id: ingredient.inventoryItemId },
                        data: {
                            currentStock: { decrement: deductQty },
                        },
                    });

                    await tx.stockMovement.create({
                        data: {
                            inventoryItemId: ingredient.inventoryItemId,
                            type: 'OUT',
                            quantity: deductQty,
                            reason: `Order ${orderNumber}`,
                            referenceId: createdOrder.id,
                        },
                    });
                }
            }

            return createdOrder;
        });

        return order;
    }

    // ─── Get Orders ─────────────────────────────────────────
    static async getOrders(params: {
        status?: OrderStatus;
        cashierId?: string;
        paymentStatus?: PaymentStatus;
        dateFrom?: Date;
        dateTo?: Date;
        page?: number;
        limit?: number;
        search?: string;
    }) {
        const { status, cashierId, paymentStatus, dateFrom, dateTo, page = 1, limit = 20, search } = params;
        const skip = (page - 1) * limit;

        const where: any = {
            ...(status && { status }),
            ...(cashierId && { cashierId }),
            ...(paymentStatus && { paymentStatus }),
            ...(search && {
                OR: [
                    { orderNumber: { contains: search, mode: 'insensitive' } },
                    { customerName: { contains: search, mode: 'insensitive' } },
                ],
            }),
            ...(dateFrom || dateTo
                ? {
                    orderedAt: {
                        ...(dateFrom && { gte: dateFrom }),
                        ...(dateTo && { lte: dateTo }),
                    },
                }
                : {}),
        };

        const [orders, total] = await Promise.all([
            prisma.order.findMany({
                where,
                skip,
                take: limit,
                orderBy: { orderedAt: 'desc' },
                include: {
                    items: {
                        include: {
                            menuItem: { select: { id: true, name: true } },
                            variant: { select: { id: true, name: true } },
                        },
                    },
                    cashier: { select: { id: true, firstName: true, lastName: true } },
                    payments: true,
                },
            }),
            prisma.order.count({ where }),
        ]);

        return {
            orders,
            pagination: { page, limit, total, pages: Math.ceil(total / limit) },
        };
    }

    // ─── Get Single Order ──────────────────────────────────
    static async getOrderById(id: string) {
        const order = await prisma.order.findUnique({
            where: { id },
            include: {
                items: {
                    include: {
                        menuItem: { select: { id: true, name: true, image: true, basePrice: true } },
                        variant: { select: { id: true, name: true, priceAddon: true } },
                    },
                },
                cashier: { select: { id: true, firstName: true, lastName: true } },
                payments: true,
            },
        });

        if (!order) throw new AppError(404, 'Order not found');
        return order;
    }

    // ─── Update Order Status ───────────────────────────────
    static async updateStatus(id: string, status: OrderStatus, cancelReason?: string) {
        const order = await prisma.order.findUnique({ where: { id } });
        if (!order) throw new AppError(404, 'Order not found');

        const now = new Date();
        const updateData: any = { status };

        switch (status) {
            case OrderStatus.PREPARING:
                updateData.prepStartedAt = now;
                break;
            case OrderStatus.READY:
                updateData.readyAt = now;
                break;
            case OrderStatus.SERVED:
                updateData.servedAt = now;
                break;
            case OrderStatus.CANCELLED:
                updateData.cancelledAt = now;
                updateData.cancelReason = cancelReason || 'No reason provided';
                break;
        }

        return prisma.order.update({
            where: { id },
            data: updateData,
            include: {
                items: {
                    include: {
                        menuItem: { select: { id: true, name: true } },
                        variant: { select: { id: true, name: true } },
                    },
                },
            },
        });
    }

    // ─── Hold / Resume Order ────────────────────────────────
    static async holdOrder(id: string) {
        return this.updateStatus(id, OrderStatus.ON_HOLD);
    }

    static async resumeOrder(id: string) {
        return this.updateStatus(id, OrderStatus.CONFIRMED);
    }

    // ─── Kitchen Queue ─────────────────────────────────────
    static async getKitchenQueue() {
        return prisma.order.findMany({
            where: {
                status: {
                    in: [OrderStatus.CONFIRMED, OrderStatus.PREPARING, OrderStatus.READY],
                },
            },
            orderBy: [
                { isPriority: 'desc' },
                { orderedAt: 'asc' },
            ],
            include: {
                items: {
                    include: {
                        menuItem: { select: { id: true, name: true, prepTime: true, image: true } },
                        variant: { select: { id: true, name: true } },
                    },
                },
            },
        });
    }

    // ─── Daily Summary ─────────────────────────────────────
    static async getDailySummary(date?: Date) {
        const targetDate = date || new Date();
        const startOfDay = new Date(targetDate);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(targetDate);
        endOfDay.setHours(23, 59, 59, 999);

        const where = {
            orderedAt: { gte: startOfDay, lte: endOfDay },
            status: { not: OrderStatus.CANCELLED },
        };

        const [totalOrders, totalRevenue, paymentBreakdown, statusBreakdown] = await Promise.all([
            prisma.order.count({ where }),
            prisma.order.aggregate({
                where,
                _sum: { totalAmount: true, taxAmount: true, discountAmount: true },
            }),
            prisma.order.groupBy({
                by: ['paymentMethod'],
                where,
                _count: true,
                _sum: { totalAmount: true },
            }),
            prisma.order.groupBy({
                by: ['status'],
                where: { orderedAt: { gte: startOfDay, lte: endOfDay } },
                _count: true,
            }),
        ]);

        return {
            date: targetDate.toISOString().slice(0, 10),
            totalOrders,
            totalRevenue: totalRevenue._sum.totalAmount || 0,
            totalTax: totalRevenue._sum.taxAmount || 0,
            totalDiscount: totalRevenue._sum.discountAmount || 0,
            paymentBreakdown,
            statusBreakdown,
        };
    }
}
