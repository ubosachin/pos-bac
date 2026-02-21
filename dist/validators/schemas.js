"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createVendorSchema = exports.recordWastageSchema = exports.createPurchaseSchema = exports.adjustStockSchema = exports.createInventoryItemSchema = exports.updateOrderStatusSchema = exports.createOrderSchema = exports.updateMenuItemSchema = exports.createMenuItemSchema = exports.createCategorySchema = exports.updateUserSchema = exports.createUserSchema = exports.changePasswordSchema = exports.registerSchema = exports.loginSchema = void 0;
const zod_1 = require("zod");
const client_1 = require("@prisma/client");
// ─── Auth Schemas ─────────────────────────────────────────
exports.loginSchema = zod_1.z.object({
    body: zod_1.z.object({
        emailOrUsername: zod_1.z.string().min(1, 'Email or username is required'),
        password: zod_1.z.string().min(6, 'Password must be at least 6 characters'),
    }),
});
exports.registerSchema = zod_1.z.object({
    body: zod_1.z.object({
        email: zod_1.z.string().email('Invalid email'),
        username: zod_1.z.string().min(3).max(30).regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'),
        password: zod_1.z.string().min(8, 'Password must be at least 8 characters'),
        firstName: zod_1.z.string().min(1, 'First name is required'),
        lastName: zod_1.z.string().min(1, 'Last name is required'),
        role: zod_1.z.nativeEnum(client_1.Role).optional(),
        phone: zod_1.z.string().optional(),
    }),
});
exports.changePasswordSchema = zod_1.z.object({
    body: zod_1.z.object({
        currentPassword: zod_1.z.string().min(1),
        newPassword: zod_1.z.string().min(8),
    }),
});
// ─── User Schemas ─────────────────────────────────────────
exports.createUserSchema = zod_1.z.object({
    body: zod_1.z.object({
        email: zod_1.z.string().email(),
        username: zod_1.z.string().min(3).max(30),
        password: zod_1.z.string().min(8),
        firstName: zod_1.z.string().min(1),
        lastName: zod_1.z.string().min(1),
        role: zod_1.z.nativeEnum(client_1.Role),
        phone: zod_1.z.string().optional(),
    }),
});
exports.updateUserSchema = zod_1.z.object({
    body: zod_1.z.object({
        firstName: zod_1.z.string().min(1).optional(),
        lastName: zod_1.z.string().min(1).optional(),
        phone: zod_1.z.string().optional(),
        role: zod_1.z.nativeEnum(client_1.Role).optional(),
        isActive: zod_1.z.boolean().optional(),
    }),
});
// ─── Menu Schemas ─────────────────────────────────────────
exports.createCategorySchema = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z.string().min(1),
        slug: zod_1.z.string().min(1).regex(/^[a-z0-9-]+$/),
        description: zod_1.z.string().optional(),
        icon: zod_1.z.string().optional(),
        sortOrder: zod_1.z.number().int().optional(),
    }),
});
exports.createMenuItemSchema = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z.string().min(1),
        slug: zod_1.z.string().min(1).regex(/^[a-z0-9-]+$/),
        description: zod_1.z.string().optional(),
        categoryId: zod_1.z.string().uuid(),
        basePrice: zod_1.z.number().positive(),
        taxRate: zod_1.z.number().min(0).max(100).optional(),
        image: zod_1.z.string().optional(),
        isVeg: zod_1.z.boolean().optional(),
        prepTime: zod_1.z.number().int().positive().optional(),
        availableFrom: zod_1.z.string().optional(),
        availableTo: zod_1.z.string().optional(),
        availableDays: zod_1.z.string().optional(),
        variants: zod_1.z.array(zod_1.z.object({
            name: zod_1.z.string().min(1),
            priceAddon: zod_1.z.number().min(0),
        })).optional(),
    }),
});
exports.updateMenuItemSchema = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z.string().min(1).optional(),
        slug: zod_1.z.string().regex(/^[a-z0-9-]+$/).optional(),
        description: zod_1.z.string().optional(),
        categoryId: zod_1.z.string().uuid().optional(),
        basePrice: zod_1.z.number().positive().optional(),
        taxRate: zod_1.z.number().min(0).max(100).optional(),
        image: zod_1.z.string().optional(),
        isVeg: zod_1.z.boolean().optional(),
        isAvailable: zod_1.z.boolean().optional(),
        prepTime: zod_1.z.number().int().positive().optional(),
        sortOrder: zod_1.z.number().int().optional(),
        availableFrom: zod_1.z.string().optional(),
        availableTo: zod_1.z.string().optional(),
        availableDays: zod_1.z.string().optional(),
    }),
});
// ─── Order Schemas ────────────────────────────────────────
exports.createOrderSchema = zod_1.z.object({
    body: zod_1.z.object({
        customerName: zod_1.z.string().optional(),
        customerPhone: zod_1.z.string().optional(),
        items: zod_1.z.array(zod_1.z.object({
            menuItemId: zod_1.z.string().uuid(),
            variantId: zod_1.z.string().uuid().optional(),
            quantity: zod_1.z.number().int().positive(),
            notes: zod_1.z.string().optional(),
        })).min(1, 'At least one item is required'),
        paymentMethod: zod_1.z.nativeEnum(client_1.PaymentMethod),
        discountType: zod_1.z.enum(['FLAT', 'PERCENTAGE']).optional(),
        discountValue: zod_1.z.number().min(0).optional(),
        couponCode: zod_1.z.string().optional(),
        notes: zod_1.z.string().optional(),
        isPriority: zod_1.z.boolean().optional(),
        counterNumber: zod_1.z.number().int().optional(),
    }),
});
exports.updateOrderStatusSchema = zod_1.z.object({
    body: zod_1.z.object({
        status: zod_1.z.nativeEnum(client_1.OrderStatus),
        cancelReason: zod_1.z.string().optional(),
    }),
});
// ─── Inventory Schemas ────────────────────────────────────
exports.createInventoryItemSchema = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z.string().min(1),
        unit: zod_1.z.string().min(1),
        currentStock: zod_1.z.number().min(0),
        minStock: zod_1.z.number().min(0).optional(),
        maxStock: zod_1.z.number().min(0).optional(),
        costPerUnit: zod_1.z.number().positive(),
    }),
});
exports.adjustStockSchema = zod_1.z.object({
    body: zod_1.z.object({
        quantity: zod_1.z.number(),
        reason: zod_1.z.string().min(1),
    }),
});
exports.createPurchaseSchema = zod_1.z.object({
    body: zod_1.z.object({
        vendorId: zod_1.z.string().uuid(),
        invoiceNo: zod_1.z.string().optional(),
        notes: zod_1.z.string().optional(),
        items: zod_1.z.array(zod_1.z.object({
            inventoryItemId: zod_1.z.string().uuid(),
            quantity: zod_1.z.number().positive(),
            unitPrice: zod_1.z.number().positive(),
        })).min(1),
    }),
});
exports.recordWastageSchema = zod_1.z.object({
    body: zod_1.z.object({
        inventoryItemId: zod_1.z.string().uuid(),
        quantity: zod_1.z.number().positive(),
        reason: zod_1.z.string().min(1),
    }),
});
exports.createVendorSchema = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z.string().min(1),
        contact: zod_1.z.string().optional(),
        email: zod_1.z.string().email().optional(),
        phone: zod_1.z.string().optional(),
        address: zod_1.z.string().optional(),
        gstNumber: zod_1.z.string().optional(),
    }),
});
//# sourceMappingURL=schemas.js.map