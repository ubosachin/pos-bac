import { Prisma } from '@prisma/client';
export declare class InventoryService {
    static getAll(params: {
        search?: string;
        lowStock?: boolean;
        page?: number;
        limit?: number;
    }): Promise<{
        items: ({
            _count: {
                menuIngredients: number;
            };
        } & {
            name: string;
            id: string;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            deletedAt: Date | null;
            unit: string;
            currentStock: Prisma.Decimal;
            minStock: Prisma.Decimal;
            maxStock: Prisma.Decimal | null;
            costPerUnit: Prisma.Decimal;
        })[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            pages: number;
        };
    }>;
    static getById(id: string): Promise<{
        menuIngredients: ({
            menuItem: {
                name: string;
                id: string;
            };
        } & {
            id: string;
            menuItemId: string;
            inventoryItemId: string;
            quantityNeeded: Prisma.Decimal;
        })[];
        stockMovements: {
            id: string;
            createdAt: Date;
            type: string;
            referenceId: string | null;
            quantity: Prisma.Decimal;
            inventoryItemId: string;
            reason: string | null;
        }[];
    } & {
        name: string;
        id: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        unit: string;
        currentStock: Prisma.Decimal;
        minStock: Prisma.Decimal;
        maxStock: Prisma.Decimal | null;
        costPerUnit: Prisma.Decimal;
    }>;
    static create(data: {
        name: string;
        unit: string;
        currentStock: number;
        minStock?: number;
        maxStock?: number;
        costPerUnit: number;
    }): Promise<{
        name: string;
        id: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        unit: string;
        currentStock: Prisma.Decimal;
        minStock: Prisma.Decimal;
        maxStock: Prisma.Decimal | null;
        costPerUnit: Prisma.Decimal;
    }>;
    static update(id: string, data: {
        name?: string;
        unit?: string;
        minStock?: number;
        maxStock?: number;
        costPerUnit?: number;
    }): Promise<{
        name: string;
        id: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        unit: string;
        currentStock: Prisma.Decimal;
        minStock: Prisma.Decimal;
        maxStock: Prisma.Decimal | null;
        costPerUnit: Prisma.Decimal;
    }>;
    static adjustStock(id: string, quantity: number, reason: string): Promise<any>;
    static delete(id: string): Promise<{
        name: string;
        id: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        unit: string;
        currentStock: Prisma.Decimal;
        minStock: Prisma.Decimal;
        maxStock: Prisma.Decimal | null;
        costPerUnit: Prisma.Decimal;
    }>;
    static getLowStockAlerts(): Promise<unknown>;
    static mapIngredient(menuItemId: string, inventoryItemId: string, quantityNeeded: number): Promise<{
        id: string;
        menuItemId: string;
        inventoryItemId: string;
        quantityNeeded: Prisma.Decimal;
    }>;
    static removeIngredientMapping(menuItemId: string, inventoryItemId: string): Promise<{
        id: string;
        menuItemId: string;
        inventoryItemId: string;
        quantityNeeded: Prisma.Decimal;
    }>;
    static recordWastage(data: {
        inventoryItemId: string;
        quantity: number;
        reason: string;
        recordedBy: string;
    }): Promise<any>;
    static getWastageRecords(params: {
        dateFrom?: Date;
        dateTo?: Date;
        page?: number;
        limit?: number;
    }): Promise<{
        records: ({
            inventoryItem: {
                name: string;
                id: string;
                unit: string;
            };
        } & {
            id: string;
            createdAt: Date;
            quantity: Prisma.Decimal;
            inventoryItemId: string;
            reason: string;
            recordedBy: string;
        })[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            pages: number;
        };
    }>;
    static getAllVendors(params: {
        search?: string;
        page?: number;
        limit?: number;
    }): Promise<{
        vendors: {
            name: string;
            id: string;
            email: string | null;
            phone: string | null;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            deletedAt: Date | null;
            contact: string | null;
            address: string | null;
            gstNumber: string | null;
        }[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            pages: number;
        };
    }>;
    static createVendor(data: {
        name: string;
        contact?: string;
        email?: string;
        phone?: string;
        address?: string;
        gstNumber?: string;
    }): Promise<{
        name: string;
        id: string;
        email: string | null;
        phone: string | null;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        contact: string | null;
        address: string | null;
        gstNumber: string | null;
    }>;
    static updateVendor(id: string, data: any): Promise<{
        name: string;
        id: string;
        email: string | null;
        phone: string | null;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        contact: string | null;
        address: string | null;
        gstNumber: string | null;
    }>;
    static createPurchase(data: {
        vendorId: string;
        invoiceNo?: string;
        notes?: string;
        items: {
            inventoryItemId: string;
            quantity: number;
            unitPrice: number;
        }[];
    }): Promise<any>;
}
//# sourceMappingURL=inventory.service.d.ts.map