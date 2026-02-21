import prisma from '../database/client';
import { Role } from '@prisma/client';
import { AppError } from '../middleware/errorHandler';
import bcrypt from 'bcryptjs';

export class UserService {
    static async getAll(params: {
        page?: number;
        limit?: number;
        role?: Role;
        search?: string;
        isActive?: boolean;
    }) {
        const { page = 1, limit = 20, role, search, isActive } = params;
        const skip = (page - 1) * limit;

        const where: any = {
            deletedAt: null,
            ...(role && { role }),
            ...(isActive !== undefined && { isActive }),
            ...(search && {
                OR: [
                    { firstName: { contains: search, mode: 'insensitive' } },
                    { lastName: { contains: search, mode: 'insensitive' } },
                    { email: { contains: search, mode: 'insensitive' } },
                    { username: { contains: search, mode: 'insensitive' } },
                ],
            }),
        };

        const [users, total] = await Promise.all([
            prisma.user.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                select: {
                    id: true,
                    email: true,
                    username: true,
                    firstName: true,
                    lastName: true,
                    role: true,
                    phone: true,
                    isActive: true,
                    lastLoginAt: true,
                    createdAt: true,
                },
            }),
            prisma.user.count({ where }),
        ]);

        return {
            users,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit),
            },
        };
    }

    static async getById(id: string) {
        const user = await prisma.user.findUnique({
            where: { id },
            select: {
                id: true,
                email: true,
                username: true,
                firstName: true,
                lastName: true,
                role: true,
                phone: true,
                avatar: true,
                isActive: true,
                lastLoginAt: true,
                createdAt: true,
                updatedAt: true,
            },
        });

        if (!user) {
            throw new AppError(404, 'User not found');
        }

        return user;
    }

    static async create(data: {
        email: string;
        username: string;
        password: string;
        firstName: string;
        lastName: string;
        role: Role;
        phone?: string;
    }) {
        const passwordHash = await bcrypt.hash(data.password, 12);

        return prisma.user.create({
            data: {
                email: data.email,
                username: data.username,
                passwordHash,
                firstName: data.firstName,
                lastName: data.lastName,
                role: data.role,
                phone: data.phone,
            },
            select: {
                id: true,
                email: true,
                username: true,
                firstName: true,
                lastName: true,
                role: true,
                phone: true,
                isActive: true,
                createdAt: true,
            },
        });
    }

    static async update(id: string, data: {
        firstName?: string;
        lastName?: string;
        phone?: string;
        role?: Role;
        isActive?: boolean;
    }) {
        return prisma.user.update({
            where: { id },
            data,
            select: {
                id: true,
                email: true,
                username: true,
                firstName: true,
                lastName: true,
                role: true,
                phone: true,
                isActive: true,
                updatedAt: true,
            },
        });
    }

    static async softDelete(id: string) {
        return prisma.user.update({
            where: { id },
            data: {
                deletedAt: new Date(),
                isActive: false,
            },
        });
    }

    static async resetPassword(id: string, newPassword: string) {
        const passwordHash = await bcrypt.hash(newPassword, 12);
        return prisma.user.update({
            where: { id },
            data: { passwordHash },
        });
    }
}
