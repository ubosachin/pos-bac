import { z } from 'zod';
import { Role, PaymentMethod, OrderStatus } from '@prisma/client';

// ─── Auth Schemas ─────────────────────────────────────────
export const loginSchema = z.object({
    body: z.object({
        emailOrUsername: z.string().min(1, 'Email or username is required'),
        password: z.string().min(6, 'Password must be at least 6 characters'),
    }),
});

export const registerSchema = z.object({
    body: z.object({
        email: z.string().email('Invalid email'),
        username: z.string().min(3).max(30).regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'),
        password: z.string().min(8, 'Password must be at least 8 characters'),
        firstName: z.string().min(1, 'First name is required'),
        lastName: z.string().min(1, 'Last name is required'),
        role: z.nativeEnum(Role).optional(),
        phone: z.string().optional(),
    }),
});

export const changePasswordSchema = z.object({
    body: z.object({
        currentPassword: z.string().min(1),
        newPassword: z.string().min(8),
    }),
});

// ─── User Schemas ─────────────────────────────────────────
export const createUserSchema = z.object({
    body: z.object({
        email: z.string().email(),
        username: z.string().min(3).max(30),
        password: z.string().min(8),
        firstName: z.string().min(1),
        lastName: z.string().min(1),
        role: z.nativeEnum(Role),
        phone: z.string().optional(),
    }),
});

export const updateUserSchema = z.object({
    body: z.object({
        firstName: z.string().min(1).optional(),
        lastName: z.string().min(1).optional(),
        phone: z.string().optional(),
        role: z.nativeEnum(Role).optional(),
        isActive: z.boolean().optional(),
    }),
});

// ─── Menu Schemas ─────────────────────────────────────────
export const createCategorySchema = z.object({
    body: z.object({
        name: z.string().min(1),
        slug: z.string().min(1).regex(/^[a-z0-9-]+$/),
        description: z.string().optional(),
        icon: z.string().optional(),
        sortOrder: z.number().int().optional(),
    }),
});

export const createMenuItemSchema = z.object({
    body: z.object({
        name: z.string().min(1),
        slug: z.string().min(1).regex(/^[a-z0-9-]+$/),
        description: z.string().optional(),
        categoryId: z.string().uuid(),
        basePrice: z.number().positive(),
        taxRate: z.number().min(0).max(100).optional(),
        image: z.string().optional(),
        isVeg: z.boolean().optional(),
        prepTime: z.number().int().positive().optional(),
        availableFrom: z.string().optional(),
        availableTo: z.string().optional(),
        availableDays: z.string().optional(),
        variants: z.array(z.object({
            name: z.string().min(1),
            priceAddon: z.number().min(0),
        })).optional(),
    }),
});

export const updateMenuItemSchema = z.object({
    body: z.object({
        name: z.string().min(1).optional(),
        slug: z.string().regex(/^[a-z0-9-]+$/).optional(),
        description: z.string().optional(),
        categoryId: z.string().uuid().optional(),
        basePrice: z.number().positive().optional(),
        taxRate: z.number().min(0).max(100).optional(),
        image: z.string().optional(),
        isVeg: z.boolean().optional(),
        isAvailable: z.boolean().optional(),
        prepTime: z.number().int().positive().optional(),
        sortOrder: z.number().int().optional(),
        availableFrom: z.string().optional(),
        availableTo: z.string().optional(),
        availableDays: z.string().optional(),
    }),
});

// ─── Order Schemas ────────────────────────────────────────
export const createOrderSchema = z.object({
    body: z.object({
        customerName: z.string().optional(),
        customerPhone: z.string().optional(),
        items: z.array(z.object({
            menuItemId: z.string().uuid(),
            variantId: z.string().uuid().optional(),
            quantity: z.number().int().positive(),
            notes: z.string().optional(),
        })).min(1, 'At least one item is required'),
        paymentMethod: z.nativeEnum(PaymentMethod),
        discountType: z.enum(['FLAT', 'PERCENTAGE']).optional(),
        discountValue: z.number().min(0).optional(),
        couponCode: z.string().optional(),
        notes: z.string().optional(),
        isPriority: z.boolean().optional(),
        counterNumber: z.number().int().optional(),
    }),
});

export const updateOrderStatusSchema = z.object({
    body: z.object({
        status: z.nativeEnum(OrderStatus),
        cancelReason: z.string().optional(),
    }),
});

// ─── Inventory Schemas ────────────────────────────────────
export const createInventoryItemSchema = z.object({
    body: z.object({
        name: z.string().min(1),
        unit: z.string().min(1),
        currentStock: z.number().min(0),
        minStock: z.number().min(0).optional(),
        maxStock: z.number().min(0).optional(),
        costPerUnit: z.number().positive(),
    }),
});

export const adjustStockSchema = z.object({
    body: z.object({
        quantity: z.number(),
        reason: z.string().min(1),
    }),
});

export const createPurchaseSchema = z.object({
    body: z.object({
        vendorId: z.string().uuid(),
        invoiceNo: z.string().optional(),
        notes: z.string().optional(),
        items: z.array(z.object({
            inventoryItemId: z.string().uuid(),
            quantity: z.number().positive(),
            unitPrice: z.number().positive(),
        })).min(1),
    }),
});

export const recordWastageSchema = z.object({
    body: z.object({
        inventoryItemId: z.string().uuid(),
        quantity: z.number().positive(),
        reason: z.string().min(1),
    }),
});

export const createVendorSchema = z.object({
    body: z.object({
        name: z.string().min(1),
        contact: z.string().optional(),
        email: z.string().email().optional(),
        phone: z.string().optional(),
        address: z.string().optional(),
        gstNumber: z.string().optional(),
    }),
});
