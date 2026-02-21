"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const client_1 = __importDefault(require("../database/client"));
const config_1 = require("../config");
const client_2 = require("@prisma/client");
const errorHandler_1 = require("../middleware/errorHandler");
class AuthService {
    static async register(data) {
        const existingUser = await client_1.default.user.findFirst({
            where: {
                OR: [{ email: data.email }, { username: data.username }],
            },
        });
        if (existingUser) {
            throw new errorHandler_1.AppError(409, 'User with this email or username already exists');
        }
        const passwordHash = await bcryptjs_1.default.hash(data.password, 12);
        const user = await client_1.default.user.create({
            data: {
                email: data.email,
                username: data.username,
                passwordHash,
                firstName: data.firstName,
                lastName: data.lastName,
                role: data.role || client_2.Role.STUDENT,
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
    static async login(emailOrUsername, password) {
        const user = await client_1.default.user.findFirst({
            where: {
                OR: [{ email: emailOrUsername }, { username: emailOrUsername }],
                isActive: true,
                deletedAt: null,
            },
        });
        if (!user) {
            throw new errorHandler_1.AppError(401, 'Invalid credentials');
        }
        const isValidPassword = await bcryptjs_1.default.compare(password, user.passwordHash);
        if (!isValidPassword) {
            throw new errorHandler_1.AppError(401, 'Invalid credentials');
        }
        // Update last login
        await client_1.default.user.update({
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
    static generateToken(user) {
        const payload = {
            userId: user.id,
            email: user.email,
            role: user.role,
        };
        return jsonwebtoken_1.default.sign(payload, config_1.config.jwt.secret, {
            expiresIn: config_1.config.jwt.expiresIn,
        });
    }
    static async changePassword(userId, currentPassword, newPassword) {
        const user = await client_1.default.user.findUnique({
            where: { id: userId },
        });
        if (!user) {
            throw new errorHandler_1.AppError(404, 'User not found');
        }
        const isValid = await bcryptjs_1.default.compare(currentPassword, user.passwordHash);
        if (!isValid) {
            throw new errorHandler_1.AppError(400, 'Current password is incorrect');
        }
        const passwordHash = await bcryptjs_1.default.hash(newPassword, 12);
        await client_1.default.user.update({
            where: { id: userId },
            data: { passwordHash },
        });
        return { message: 'Password updated successfully' };
    }
    static async getProfile(userId) {
        const user = await client_1.default.user.findUnique({
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
            throw new errorHandler_1.AppError(404, 'User not found');
        }
        return user;
    }
}
exports.AuthService = AuthService;
//# sourceMappingURL=auth.service.js.map