export declare class MenuService {
    static getAllCategories(includeInactive?: boolean): Promise<({
        _count: {
            menuItems: number;
        };
    } & {
        name: string;
        id: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        description: string | null;
        slug: string;
        icon: string | null;
        sortOrder: number;
    })[]>;
    static createCategory(data: {
        name: string;
        slug: string;
        description?: string;
        icon?: string;
        sortOrder?: number;
    }): Promise<{
        name: string;
        id: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        description: string | null;
        slug: string;
        icon: string | null;
        sortOrder: number;
    }>;
    static updateCategory(id: string, data: {
        name?: string;
        slug?: string;
        description?: string;
        icon?: string;
        sortOrder?: number;
        isActive?: boolean;
    }): Promise<{
        name: string;
        id: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        description: string | null;
        slug: string;
        icon: string | null;
        sortOrder: number;
    }>;
    static deleteCategory(id: string): Promise<{
        name: string;
        id: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        description: string | null;
        slug: string;
        icon: string | null;
        sortOrder: number;
    }>;
    static getAllMenuItems(params: {
        categoryId?: string;
        search?: string;
        isAvailable?: boolean;
        isVeg?: boolean;
        page?: number;
        limit?: number;
    }): Promise<{
        items: ({
            category: {
                name: string;
                id: string;
                slug: string;
            };
            variants: {
                name: string;
                id: string;
                createdAt: Date;
                updatedAt: Date;
                isAvailable: boolean;
                menuItemId: string;
                priceAddon: import("@prisma/client/runtime/library").Decimal;
            }[];
        } & {
            name: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            deletedAt: Date | null;
            description: string | null;
            slug: string;
            sortOrder: number;
            categoryId: string;
            basePrice: import("@prisma/client/runtime/library").Decimal;
            taxRate: import("@prisma/client/runtime/library").Decimal;
            image: string | null;
            isVeg: boolean;
            isAvailable: boolean;
            prepTime: number;
            availableFrom: string | null;
            availableTo: string | null;
            availableDays: string | null;
        })[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            pages: number;
        };
    }>;
    static getMenuItemById(id: string): Promise<{
        category: {
            name: string;
            id: string;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            deletedAt: Date | null;
            description: string | null;
            slug: string;
            icon: string | null;
            sortOrder: number;
        };
        variants: {
            name: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            isAvailable: boolean;
            menuItemId: string;
            priceAddon: import("@prisma/client/runtime/library").Decimal;
        }[];
        ingredients: ({
            inventoryItem: {
                name: string;
                id: string;
                unit: string;
            };
        } & {
            id: string;
            menuItemId: string;
            inventoryItemId: string;
            quantityNeeded: import("@prisma/client/runtime/library").Decimal;
        })[];
    } & {
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        description: string | null;
        slug: string;
        sortOrder: number;
        categoryId: string;
        basePrice: import("@prisma/client/runtime/library").Decimal;
        taxRate: import("@prisma/client/runtime/library").Decimal;
        image: string | null;
        isVeg: boolean;
        isAvailable: boolean;
        prepTime: number;
        availableFrom: string | null;
        availableTo: string | null;
        availableDays: string | null;
    }>;
    static createMenuItem(data: {
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
        variants?: {
            name: string;
            priceAddon: number;
        }[];
    }): Promise<{
        category: {
            name: string;
            id: string;
        };
        variants: {
            name: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            isAvailable: boolean;
            menuItemId: string;
            priceAddon: import("@prisma/client/runtime/library").Decimal;
        }[];
    } & {
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        description: string | null;
        slug: string;
        sortOrder: number;
        categoryId: string;
        basePrice: import("@prisma/client/runtime/library").Decimal;
        taxRate: import("@prisma/client/runtime/library").Decimal;
        image: string | null;
        isVeg: boolean;
        isAvailable: boolean;
        prepTime: number;
        availableFrom: string | null;
        availableTo: string | null;
        availableDays: string | null;
    }>;
    static updateMenuItem(id: string, data: {
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
    }): Promise<{
        category: {
            name: string;
            id: string;
        };
        variants: {
            name: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            isAvailable: boolean;
            menuItemId: string;
            priceAddon: import("@prisma/client/runtime/library").Decimal;
        }[];
    } & {
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        description: string | null;
        slug: string;
        sortOrder: number;
        categoryId: string;
        basePrice: import("@prisma/client/runtime/library").Decimal;
        taxRate: import("@prisma/client/runtime/library").Decimal;
        image: string | null;
        isVeg: boolean;
        isAvailable: boolean;
        prepTime: number;
        availableFrom: string | null;
        availableTo: string | null;
        availableDays: string | null;
    }>;
    static deleteMenuItem(id: string): Promise<{
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        description: string | null;
        slug: string;
        sortOrder: number;
        categoryId: string;
        basePrice: import("@prisma/client/runtime/library").Decimal;
        taxRate: import("@prisma/client/runtime/library").Decimal;
        image: string | null;
        isVeg: boolean;
        isAvailable: boolean;
        prepTime: number;
        availableFrom: string | null;
        availableTo: string | null;
        availableDays: string | null;
    }>;
    static toggleAvailability(id: string): Promise<{
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        description: string | null;
        slug: string;
        sortOrder: number;
        categoryId: string;
        basePrice: import("@prisma/client/runtime/library").Decimal;
        taxRate: import("@prisma/client/runtime/library").Decimal;
        image: string | null;
        isVeg: boolean;
        isAvailable: boolean;
        prepTime: number;
        availableFrom: string | null;
        availableTo: string | null;
        availableDays: string | null;
    }>;
    static addVariant(menuItemId: string, data: {
        name: string;
        priceAddon: number;
    }): Promise<{
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        isAvailable: boolean;
        menuItemId: string;
        priceAddon: import("@prisma/client/runtime/library").Decimal;
    }>;
    static updateVariant(id: string, data: {
        name?: string;
        priceAddon?: number;
        isAvailable?: boolean;
    }): Promise<{
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        isAvailable: boolean;
        menuItemId: string;
        priceAddon: import("@prisma/client/runtime/library").Decimal;
    }>;
    static deleteVariant(id: string): Promise<{
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        isAvailable: boolean;
        menuItemId: string;
        priceAddon: import("@prisma/client/runtime/library").Decimal;
    }>;
    static quickSearch(query: string): Promise<({
        category: {
            name: string;
            id: string;
        };
        variants: {
            name: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            isAvailable: boolean;
            menuItemId: string;
            priceAddon: import("@prisma/client/runtime/library").Decimal;
        }[];
    } & {
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        description: string | null;
        slug: string;
        sortOrder: number;
        categoryId: string;
        basePrice: import("@prisma/client/runtime/library").Decimal;
        taxRate: import("@prisma/client/runtime/library").Decimal;
        image: string | null;
        isVeg: boolean;
        isAvailable: boolean;
        prepTime: number;
        availableFrom: string | null;
        availableTo: string | null;
        availableDays: string | null;
    })[]>;
}
//# sourceMappingURL=menu.service.d.ts.map