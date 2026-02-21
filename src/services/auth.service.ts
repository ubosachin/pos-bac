import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../database/client';
import { config } from '../config';
import { Role } from '@prisma/client';
import { AppError } from '../middleware/errorHandler';
import { AuthPayload } from '../middleware/auth';

export class AuthService {
    static async register(data: {
        email: string;
        username: string;
        password: string;
        firstName: string;
        lastName: string;
        role?: Role;
        phone?: string;
    }) {
        const existingUser = await prisma.user.findFirst({
            where: {
                OR: [{ email: data.email }, { username: data.username }],
            },
        });

        if (existingUser) {
            throw new AppError(409, 'User with this email or username already exists');
        }

        const passwordHash = await bcrypt.hash(data.password, 12);

        const user = await prisma.user.create({
            data: {
                email: data.email,
                username: data.username,
                passwordHash,
                firstName: data.firstName,
                lastName: data.lastName,
                role: data.role || Role.STUDENT,
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
                createdAt: true,
            },
        });

        const token = this.generateToken(user);

        return { user, token };
    }

    static async login(emailOrUsername: string, password: string) {
        const user = await prisma.user.findFirst({
            where: {
                OR: [{ email: emailOrUsername }, { username: emailOrUsername }],
                isActive: true,
                deletedAt: null,
            },
        });

        if (!user) {
            throw new AppError(401, 'Invalid credentials');
        }

        const isValidPassword = await bcrypt.compare(password, user.passwordHash);
        if (!isValidPassword) {
            throw new AppError(401, 'Invalid credentials');
        }

        // Update last login
        await prisma.user.update({
            where: { id: user.id },
            data: { lastLoginAt: new Date() },
        });

        const token = this.generateToken(user);

        return {
            user: {
                id: user.id,
                email: user.email,
                username: user.username,
                firstName: user.firstName,
                lastName: user.lastName,
                role: user.role,
                phone: user.phone,
                avatar: user.avatar,
            },
            token,
        };
    }

    static generateToken(user: { id: string; email: string; role: Role }): string {
        const payload: AuthPayload = {
            userId: user.id,
            email: user.email,
            role: user.role,
        };

        return jwt.sign(payload, config.jwt.secret, {
            expiresIn: config.jwt.expiresIn as any,
        });
    }

    static async changePassword(userId: string, currentPassword: string, newPassword: string) {
        const user = await prisma.user.findUnique({
            where: { id: userId },
        });

        if (!user) {
            throw new AppError(404, 'User not found');
        }

        const isValid = await bcrypt.compare(currentPassword, user.passwordHash);
        if (!isValid) {
            throw new AppError(400, 'Current password is incorrect');
        }

        const passwordHash = await bcrypt.hash(newPassword, 12);
        await prisma.user.update({
            where: { id: userId },
            data: { passwordHash },
        });

        return { message: 'Password updated successfully' };
    }

    static async getProfile(userId: string) {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                email: true,
                username: true,
                firstName: true,
                lastName: true,
                role: true,
                phone: true,
                avatar: true,
                createdAt: true,
                lastLoginAt: true,
            },
        });

        if (!user) {
            throw new AppError(404, 'User not found');
        }

        return user;
    }
}
