import { Role } from '@prisma/client';
export declare class AuthService {
    static register(data: {
        email: string;
        username: string;
        password: string;
        firstName: string;
        lastName: string;
        role?: Role;
        phone?: string;
    }): Promise<{
        user: {
            id: string;
            email: string;
            username: string;
            firstName: string;
            lastName: string;
            role: import(".prisma/client").$Enums.Role;
            phone: string | null;
            createdAt: Date;
        };
        token: string;
    }>;
    static login(emailOrUsername: string, password: string): Promise<{
        user: {
            id: string;
            email: string;
            username: string;
            firstName: string;
            lastName: string;
            role: import(".prisma/client").$Enums.Role;
            phone: string | null;
            avatar: string | null;
        };
        token: string;
    }>;
    static generateToken(user: {
        id: string;
        email: string;
        role: Role;
    }): string;
    static changePassword(userId: string, currentPassword: string, newPassword: string): Promise<{
        message: string;
    }>;
    static getProfile(userId: string): Promise<{
        id: string;
        email: string;
        username: string;
        firstName: string;
        lastName: string;
        role: import(".prisma/client").$Enums.Role;
        phone: string | null;
        avatar: string | null;
        lastLoginAt: Date | null;
        createdAt: Date;
    }>;
}
//# sourceMappingURL=auth.service.d.ts.map