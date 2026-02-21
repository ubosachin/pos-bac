import { Role } from '@prisma/client';
export declare class UserService {
    static getAll(params: {
        page?: number;
        limit?: number;
        role?: Role;
        search?: string;
        isActive?: boolean;
    }): Promise<{
        users: {
            id: string;
            email: string;
            username: string;
            firstName: string;
            lastName: string;
            role: import(".prisma/client").$Enums.Role;
            phone: string | null;
            isActive: boolean;
            lastLoginAt: Date | null;
            createdAt: Date;
        }[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            pages: number;
        };
    }>;
    static getById(id: string): Promise<{
        id: string;
        email: string;
        username: string;
        firstName: string;
        lastName: string;
        role: import(".prisma/client").$Enums.Role;
        phone: string | null;
        avatar: string | null;
        isActive: boolean;
        lastLoginAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    static create(data: {
        email: string;
        username: string;
        password: string;
        firstName: string;
        lastName: string;
        role: Role;
        phone?: string;
    }): Promise<{
        id: string;
        email: string;
        username: string;
        firstName: string;
        lastName: string;
        role: import(".prisma/client").$Enums.Role;
        phone: string | null;
        isActive: boolean;
        createdAt: Date;
    }>;
    static update(id: string, data: {
        firstName?: string;
        lastName?: string;
        phone?: string;
        role?: Role;
        isActive?: boolean;
    }): Promise<{
        id: string;
        email: string;
        username: string;
        firstName: string;
        lastName: string;
        role: import(".prisma/client").$Enums.Role;
        phone: string | null;
        isActive: boolean;
        updatedAt: Date;
    }>;
    static softDelete(id: string): Promise<{
        id: string;
        email: string;
        username: string;
        passwordHash: string;
        firstName: string;
        lastName: string;
        role: import(".prisma/client").$Enums.Role;
        phone: string | null;
        avatar: string | null;
        isActive: boolean;
        lastLoginAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
    }>;
    static resetPassword(id: string, newPassword: string): Promise<{
        id: string;
        email: string;
        username: string;
        passwordHash: string;
        firstName: string;
        lastName: string;
        role: import(".prisma/client").$Enums.Role;
        phone: string | null;
        avatar: string | null;
        isActive: boolean;
        lastLoginAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
    }>;
}
//# sourceMappingURL=user.service.d.ts.map