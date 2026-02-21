import { z } from 'zod';
export declare const loginSchema: z.ZodObject<{
    body: z.ZodObject<{
        emailOrUsername: z.ZodString;
        password: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        emailOrUsername: string;
        password: string;
    }, {
        emailOrUsername: string;
        password: string;
    }>;
}, "strip", z.ZodTypeAny, {
    body: {
        emailOrUsername: string;
        password: string;
    };
}, {
    body: {
        emailOrUsername: string;
        password: string;
    };
}>;
export declare const registerSchema: z.ZodObject<{
    body: z.ZodObject<{
        email: z.ZodString;
        username: z.ZodString;
        password: z.ZodString;
        firstName: z.ZodString;
        lastName: z.ZodString;
        role: z.ZodOptional<z.ZodNativeEnum<{
            ADMIN: "ADMIN";
            CASHIER: "CASHIER";
            KITCHEN: "KITCHEN";
            INVENTORY_MANAGER: "INVENTORY_MANAGER";
            STUDENT: "STUDENT";
        }>>;
        phone: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        email: string;
        username: string;
        firstName: string;
        lastName: string;
        password: string;
        role?: "ADMIN" | "CASHIER" | "KITCHEN" | "INVENTORY_MANAGER" | "STUDENT" | undefined;
        phone?: string | undefined;
    }, {
        email: string;
        username: string;
        firstName: string;
        lastName: string;
        password: string;
        role?: "ADMIN" | "CASHIER" | "KITCHEN" | "INVENTORY_MANAGER" | "STUDENT" | undefined;
        phone?: string | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    body: {
        email: string;
        username: string;
        firstName: string;
        lastName: string;
        password: string;
        role?: "ADMIN" | "CASHIER" | "KITCHEN" | "INVENTORY_MANAGER" | "STUDENT" | undefined;
        phone?: string | undefined;
    };
}, {
    body: {
        email: string;
        username: string;
        firstName: string;
        lastName: string;
        password: string;
        role?: "ADMIN" | "CASHIER" | "KITCHEN" | "INVENTORY_MANAGER" | "STUDENT" | undefined;
        phone?: string | undefined;
    };
}>;
export declare const changePasswordSchema: z.ZodObject<{
    body: z.ZodObject<{
        currentPassword: z.ZodString;
        newPassword: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        currentPassword: string;
        newPassword: string;
    }, {
        currentPassword: string;
        newPassword: string;
    }>;
}, "strip", z.ZodTypeAny, {
    body: {
        currentPassword: string;
        newPassword: string;
    };
}, {
    body: {
        currentPassword: string;
        newPassword: string;
    };
}>;
export declare const createUserSchema: z.ZodObject<{
    body: z.ZodObject<{
        email: z.ZodString;
        username: z.ZodString;
        password: z.ZodString;
        firstName: z.ZodString;
        lastName: z.ZodString;
        role: z.ZodNativeEnum<{
            ADMIN: "ADMIN";
            CASHIER: "CASHIER";
            KITCHEN: "KITCHEN";
            INVENTORY_MANAGER: "INVENTORY_MANAGER";
            STUDENT: "STUDENT";
        }>;
        phone: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        email: string;
        username: string;
        firstName: string;
        lastName: string;
        role: "ADMIN" | "CASHIER" | "KITCHEN" | "INVENTORY_MANAGER" | "STUDENT";
        password: string;
        phone?: string | undefined;
    }, {
        email: string;
        username: string;
        firstName: string;
        lastName: string;
        role: "ADMIN" | "CASHIER" | "KITCHEN" | "INVENTORY_MANAGER" | "STUDENT";
        password: string;
        phone?: string | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    body: {
        email: string;
        username: string;
        firstName: string;
        lastName: string;
        role: "ADMIN" | "CASHIER" | "KITCHEN" | "INVENTORY_MANAGER" | "STUDENT";
        password: string;
        phone?: string | undefined;
    };
}, {
    body: {
        email: string;
        username: string;
        firstName: string;
        lastName: string;
        role: "ADMIN" | "CASHIER" | "KITCHEN" | "INVENTORY_MANAGER" | "STUDENT";
        password: string;
        phone?: string | undefined;
    };
}>;
export declare const updateUserSchema: z.ZodObject<{
    body: z.ZodObject<{
        firstName: z.ZodOptional<z.ZodString>;
        lastName: z.ZodOptional<z.ZodString>;
        phone: z.ZodOptional<z.ZodString>;
        role: z.ZodOptional<z.ZodNativeEnum<{
            ADMIN: "ADMIN";
            CASHIER: "CASHIER";
            KITCHEN: "KITCHEN";
            INVENTORY_MANAGER: "INVENTORY_MANAGER";
            STUDENT: "STUDENT";
        }>>;
        isActive: z.ZodOptional<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        firstName?: string | undefined;
        lastName?: string | undefined;
        role?: "ADMIN" | "CASHIER" | "KITCHEN" | "INVENTORY_MANAGER" | "STUDENT" | undefined;
        phone?: string | undefined;
        isActive?: boolean | undefined;
    }, {
        firstName?: string | undefined;
        lastName?: string | undefined;
        role?: "ADMIN" | "CASHIER" | "KITCHEN" | "INVENTORY_MANAGER" | "STUDENT" | undefined;
        phone?: string | undefined;
        isActive?: boolean | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    body: {
        firstName?: string | undefined;
        lastName?: string | undefined;
        role?: "ADMIN" | "CASHIER" | "KITCHEN" | "INVENTORY_MANAGER" | "STUDENT" | undefined;
        phone?: string | undefined;
        isActive?: boolean | undefined;
    };
}, {
    body: {
        firstName?: string | undefined;
        lastName?: string | undefined;
        role?: "ADMIN" | "CASHIER" | "KITCHEN" | "INVENTORY_MANAGER" | "STUDENT" | undefined;
        phone?: string | undefined;
        isActive?: boolean | undefined;
    };
}>;
export declare const createCategorySchema: z.ZodObject<{
    body: z.ZodObject<{
        name: z.ZodString;
        slug: z.ZodString;
        description: z.ZodOptional<z.ZodString>;
        icon: z.ZodOptional<z.ZodString>;
        sortOrder: z.ZodOptional<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        name: string;
        slug: string;
        description?: string | undefined;
        icon?: string | undefined;
        sortOrder?: number | undefined;
    }, {
        name: string;
        slug: string;
        description?: string | undefined;
        icon?: string | undefined;
        sortOrder?: number | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    body: {
        name: string;
        slug: string;
        description?: string | undefined;
        icon?: string | undefined;
        sortOrder?: number | undefined;
    };
}, {
    body: {
        name: string;
        slug: string;
        description?: string | undefined;
        icon?: string | undefined;
        sortOrder?: number | undefined;
    };
}>;
export declare const createMenuItemSchema: z.ZodObject<{
    body: z.ZodObject<{
        name: z.ZodString;
        slug: z.ZodString;
        description: z.ZodOptional<z.ZodString>;
        categoryId: z.ZodString;
        basePrice: z.ZodNumber;
        taxRate: z.ZodOptional<z.ZodNumber>;
        image: z.ZodOptional<z.ZodString>;
        isVeg: z.ZodOptional<z.ZodBoolean>;
        prepTime: z.ZodOptional<z.ZodNumber>;
        availableFrom: z.ZodOptional<z.ZodString>;
        availableTo: z.ZodOptional<z.ZodString>;
        availableDays: z.ZodOptional<z.ZodString>;
        variants: z.ZodOptional<z.ZodArray<z.ZodObject<{
            name: z.ZodString;
            priceAddon: z.ZodNumber;
        }, "strip", z.ZodTypeAny, {
            name: string;
            priceAddon: number;
        }, {
            name: string;
            priceAddon: number;
        }>, "many">>;
    }, "strip", z.ZodTypeAny, {
        name: string;
        slug: string;
        categoryId: string;
        basePrice: number;
        description?: string | undefined;
        taxRate?: number | undefined;
        image?: string | undefined;
        isVeg?: boolean | undefined;
        prepTime?: number | undefined;
        availableFrom?: string | undefined;
        availableTo?: string | undefined;
        availableDays?: string | undefined;
        variants?: {
            name: string;
            priceAddon: number;
        }[] | undefined;
    }, {
        name: string;
        slug: string;
        categoryId: string;
        basePrice: number;
        description?: string | undefined;
        taxRate?: number | undefined;
        image?: string | undefined;
        isVeg?: boolean | undefined;
        prepTime?: number | undefined;
        availableFrom?: string | undefined;
        availableTo?: string | undefined;
        availableDays?: string | undefined;
        variants?: {
            name: string;
            priceAddon: number;
        }[] | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    body: {
        name: string;
        slug: string;
        categoryId: string;
        basePrice: number;
        description?: string | undefined;
        taxRate?: number | undefined;
        image?: string | undefined;
        isVeg?: boolean | undefined;
        prepTime?: number | undefined;
        availableFrom?: string | undefined;
        availableTo?: string | undefined;
        availableDays?: string | undefined;
        variants?: {
            name: string;
            priceAddon: number;
        }[] | undefined;
    };
}, {
    body: {
        name: string;
        slug: string;
        categoryId: string;
        basePrice: number;
        description?: string | undefined;
        taxRate?: number | undefined;
        image?: string | undefined;
        isVeg?: boolean | undefined;
        prepTime?: number | undefined;
        availableFrom?: string | undefined;
        availableTo?: string | undefined;
        availableDays?: string | undefined;
        variants?: {
            name: string;
            priceAddon: number;
        }[] | undefined;
    };
}>;
export declare const updateMenuItemSchema: z.ZodObject<{
    body: z.ZodObject<{
        name: z.ZodOptional<z.ZodString>;
        slug: z.ZodOptional<z.ZodString>;
        description: z.ZodOptional<z.ZodString>;
        categoryId: z.ZodOptional<z.ZodString>;
        basePrice: z.ZodOptional<z.ZodNumber>;
        taxRate: z.ZodOptional<z.ZodNumber>;
        image: z.ZodOptional<z.ZodString>;
        isVeg: z.ZodOptional<z.ZodBoolean>;
        isAvailable: z.ZodOptional<z.ZodBoolean>;
        prepTime: z.ZodOptional<z.ZodNumber>;
        sortOrder: z.ZodOptional<z.ZodNumber>;
        availableFrom: z.ZodOptional<z.ZodString>;
        availableTo: z.ZodOptional<z.ZodString>;
        availableDays: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        name?: string | undefined;
        description?: string | undefined;
        slug?: string | undefined;
        sortOrder?: number | undefined;
        categoryId?: string | undefined;
        basePrice?: number | undefined;
        taxRate?: number | undefined;
        image?: string | undefined;
        isVeg?: boolean | undefined;
        isAvailable?: boolean | undefined;
        prepTime?: number | undefined;
        availableFrom?: string | undefined;
        availableTo?: string | undefined;
        availableDays?: string | undefined;
    }, {
        name?: string | undefined;
        description?: string | undefined;
        slug?: string | undefined;
        sortOrder?: number | undefined;
        categoryId?: string | undefined;
        basePrice?: number | undefined;
        taxRate?: number | undefined;
        image?: string | undefined;
        isVeg?: boolean | undefined;
        isAvailable?: boolean | undefined;
        prepTime?: number | undefined;
        availableFrom?: string | undefined;
        availableTo?: string | undefined;
        availableDays?: string | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    body: {
        name?: string | undefined;
        description?: string | undefined;
        slug?: string | undefined;
        sortOrder?: number | undefined;
        categoryId?: string | undefined;
        basePrice?: number | undefined;
        taxRate?: number | undefined;
        image?: string | undefined;
        isVeg?: boolean | undefined;
        isAvailable?: boolean | undefined;
        prepTime?: number | undefined;
        availableFrom?: string | undefined;
        availableTo?: string | undefined;
        availableDays?: string | undefined;
    };
}, {
    body: {
        name?: string | undefined;
        description?: string | undefined;
        slug?: string | undefined;
        sortOrder?: number | undefined;
        categoryId?: string | undefined;
        basePrice?: number | undefined;
        taxRate?: number | undefined;
        image?: string | undefined;
        isVeg?: boolean | undefined;
        isAvailable?: boolean | undefined;
        prepTime?: number | undefined;
        availableFrom?: string | undefined;
        availableTo?: string | undefined;
        availableDays?: string | undefined;
    };
}>;
export declare const createOrderSchema: z.ZodObject<{
    body: z.ZodObject<{
        customerName: z.ZodOptional<z.ZodString>;
        customerPhone: z.ZodOptional<z.ZodString>;
        items: z.ZodArray<z.ZodObject<{
            menuItemId: z.ZodString;
            variantId: z.ZodOptional<z.ZodString>;
            quantity: z.ZodNumber;
            notes: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            menuItemId: string;
            quantity: number;
            notes?: string | undefined;
            variantId?: string | undefined;
        }, {
            menuItemId: string;
            quantity: number;
            notes?: string | undefined;
            variantId?: string | undefined;
        }>, "many">;
        paymentMethod: z.ZodNativeEnum<{
            CASH: "CASH";
            UPI: "UPI";
            CARD: "CARD";
            NET_BANKING: "NET_BANKING";
            WALLET: "WALLET";
            ONLINE: "ONLINE";
            SPLIT: "SPLIT";
        }>;
        discountType: z.ZodOptional<z.ZodEnum<["FLAT", "PERCENTAGE"]>>;
        discountValue: z.ZodOptional<z.ZodNumber>;
        couponCode: z.ZodOptional<z.ZodString>;
        notes: z.ZodOptional<z.ZodString>;
        isPriority: z.ZodOptional<z.ZodBoolean>;
        counterNumber: z.ZodOptional<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        paymentMethod: "CASH" | "UPI" | "CARD" | "NET_BANKING" | "WALLET" | "ONLINE" | "SPLIT";
        items: {
            menuItemId: string;
            quantity: number;
            notes?: string | undefined;
            variantId?: string | undefined;
        }[];
        customerName?: string | undefined;
        customerPhone?: string | undefined;
        discountType?: "FLAT" | "PERCENTAGE" | undefined;
        discountValue?: number | undefined;
        couponCode?: string | undefined;
        notes?: string | undefined;
        isPriority?: boolean | undefined;
        counterNumber?: number | undefined;
    }, {
        paymentMethod: "CASH" | "UPI" | "CARD" | "NET_BANKING" | "WALLET" | "ONLINE" | "SPLIT";
        items: {
            menuItemId: string;
            quantity: number;
            notes?: string | undefined;
            variantId?: string | undefined;
        }[];
        customerName?: string | undefined;
        customerPhone?: string | undefined;
        discountType?: "FLAT" | "PERCENTAGE" | undefined;
        discountValue?: number | undefined;
        couponCode?: string | undefined;
        notes?: string | undefined;
        isPriority?: boolean | undefined;
        counterNumber?: number | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    body: {
        paymentMethod: "CASH" | "UPI" | "CARD" | "NET_BANKING" | "WALLET" | "ONLINE" | "SPLIT";
        items: {
            menuItemId: string;
            quantity: number;
            notes?: string | undefined;
            variantId?: string | undefined;
        }[];
        customerName?: string | undefined;
        customerPhone?: string | undefined;
        discountType?: "FLAT" | "PERCENTAGE" | undefined;
        discountValue?: number | undefined;
        couponCode?: string | undefined;
        notes?: string | undefined;
        isPriority?: boolean | undefined;
        counterNumber?: number | undefined;
    };
}, {
    body: {
        paymentMethod: "CASH" | "UPI" | "CARD" | "NET_BANKING" | "WALLET" | "ONLINE" | "SPLIT";
        items: {
            menuItemId: string;
            quantity: number;
            notes?: string | undefined;
            variantId?: string | undefined;
        }[];
        customerName?: string | undefined;
        customerPhone?: string | undefined;
        discountType?: "FLAT" | "PERCENTAGE" | undefined;
        discountValue?: number | undefined;
        couponCode?: string | undefined;
        notes?: string | undefined;
        isPriority?: boolean | undefined;
        counterNumber?: number | undefined;
    };
}>;
export declare const updateOrderStatusSchema: z.ZodObject<{
    body: z.ZodObject<{
        status: z.ZodNativeEnum<{
            PENDING: "PENDING";
            PENDING_PAYMENT: "PENDING_PAYMENT";
            CONFIRMED: "CONFIRMED";
            PREPARING: "PREPARING";
            READY: "READY";
            SERVED: "SERVED";
            CANCELLED: "CANCELLED";
            ON_HOLD: "ON_HOLD";
        }>;
        cancelReason: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        status: "PENDING" | "PENDING_PAYMENT" | "CONFIRMED" | "PREPARING" | "READY" | "SERVED" | "CANCELLED" | "ON_HOLD";
        cancelReason?: string | undefined;
    }, {
        status: "PENDING" | "PENDING_PAYMENT" | "CONFIRMED" | "PREPARING" | "READY" | "SERVED" | "CANCELLED" | "ON_HOLD";
        cancelReason?: string | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    body: {
        status: "PENDING" | "PENDING_PAYMENT" | "CONFIRMED" | "PREPARING" | "READY" | "SERVED" | "CANCELLED" | "ON_HOLD";
        cancelReason?: string | undefined;
    };
}, {
    body: {
        status: "PENDING" | "PENDING_PAYMENT" | "CONFIRMED" | "PREPARING" | "READY" | "SERVED" | "CANCELLED" | "ON_HOLD";
        cancelReason?: string | undefined;
    };
}>;
export declare const createInventoryItemSchema: z.ZodObject<{
    body: z.ZodObject<{
        name: z.ZodString;
        unit: z.ZodString;
        currentStock: z.ZodNumber;
        minStock: z.ZodOptional<z.ZodNumber>;
        maxStock: z.ZodOptional<z.ZodNumber>;
        costPerUnit: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        name: string;
        unit: string;
        currentStock: number;
        costPerUnit: number;
        minStock?: number | undefined;
        maxStock?: number | undefined;
    }, {
        name: string;
        unit: string;
        currentStock: number;
        costPerUnit: number;
        minStock?: number | undefined;
        maxStock?: number | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    body: {
        name: string;
        unit: string;
        currentStock: number;
        costPerUnit: number;
        minStock?: number | undefined;
        maxStock?: number | undefined;
    };
}, {
    body: {
        name: string;
        unit: string;
        currentStock: number;
        costPerUnit: number;
        minStock?: number | undefined;
        maxStock?: number | undefined;
    };
}>;
export declare const adjustStockSchema: z.ZodObject<{
    body: z.ZodObject<{
        quantity: z.ZodNumber;
        reason: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        quantity: number;
        reason: string;
    }, {
        quantity: number;
        reason: string;
    }>;
}, "strip", z.ZodTypeAny, {
    body: {
        quantity: number;
        reason: string;
    };
}, {
    body: {
        quantity: number;
        reason: string;
    };
}>;
export declare const createPurchaseSchema: z.ZodObject<{
    body: z.ZodObject<{
        vendorId: z.ZodString;
        invoiceNo: z.ZodOptional<z.ZodString>;
        notes: z.ZodOptional<z.ZodString>;
        items: z.ZodArray<z.ZodObject<{
            inventoryItemId: z.ZodString;
            quantity: z.ZodNumber;
            unitPrice: z.ZodNumber;
        }, "strip", z.ZodTypeAny, {
            quantity: number;
            unitPrice: number;
            inventoryItemId: string;
        }, {
            quantity: number;
            unitPrice: number;
            inventoryItemId: string;
        }>, "many">;
    }, "strip", z.ZodTypeAny, {
        items: {
            quantity: number;
            unitPrice: number;
            inventoryItemId: string;
        }[];
        vendorId: string;
        notes?: string | undefined;
        invoiceNo?: string | undefined;
    }, {
        items: {
            quantity: number;
            unitPrice: number;
            inventoryItemId: string;
        }[];
        vendorId: string;
        notes?: string | undefined;
        invoiceNo?: string | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    body: {
        items: {
            quantity: number;
            unitPrice: number;
            inventoryItemId: string;
        }[];
        vendorId: string;
        notes?: string | undefined;
        invoiceNo?: string | undefined;
    };
}, {
    body: {
        items: {
            quantity: number;
            unitPrice: number;
            inventoryItemId: string;
        }[];
        vendorId: string;
        notes?: string | undefined;
        invoiceNo?: string | undefined;
    };
}>;
export declare const recordWastageSchema: z.ZodObject<{
    body: z.ZodObject<{
        inventoryItemId: z.ZodString;
        quantity: z.ZodNumber;
        reason: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        quantity: number;
        inventoryItemId: string;
        reason: string;
    }, {
        quantity: number;
        inventoryItemId: string;
        reason: string;
    }>;
}, "strip", z.ZodTypeAny, {
    body: {
        quantity: number;
        inventoryItemId: string;
        reason: string;
    };
}, {
    body: {
        quantity: number;
        inventoryItemId: string;
        reason: string;
    };
}>;
export declare const createVendorSchema: z.ZodObject<{
    body: z.ZodObject<{
        name: z.ZodString;
        contact: z.ZodOptional<z.ZodString>;
        email: z.ZodOptional<z.ZodString>;
        phone: z.ZodOptional<z.ZodString>;
        address: z.ZodOptional<z.ZodString>;
        gstNumber: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        name: string;
        email?: string | undefined;
        phone?: string | undefined;
        contact?: string | undefined;
        address?: string | undefined;
        gstNumber?: string | undefined;
    }, {
        name: string;
        email?: string | undefined;
        phone?: string | undefined;
        contact?: string | undefined;
        address?: string | undefined;
        gstNumber?: string | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    body: {
        name: string;
        email?: string | undefined;
        phone?: string | undefined;
        contact?: string | undefined;
        address?: string | undefined;
        gstNumber?: string | undefined;
    };
}, {
    body: {
        name: string;
        email?: string | undefined;
        phone?: string | undefined;
        contact?: string | undefined;
        address?: string | undefined;
        gstNumber?: string | undefined;
    };
}>;
//# sourceMappingURL=schemas.d.ts.map