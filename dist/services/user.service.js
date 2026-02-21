"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserService = void 0;
const client_1 = __importDefault(require("../database/client"));
const errorHandler_1 = require("../middleware/errorHandler");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
class UserService {
    static async getAll(params) {
        const { page = 1, limit = 20, role, search, isActive } = params;
        const skip = (page - 1) * limit;
        const where = {
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
            client_1.default.user.findMany({
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
            client_1.default.user.count({ where }),
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
    static async getById(id) {
        const user = await client_1.default.user.findUnique({
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
            throw new errorHandler_1.AppError(404, 'User not found');
        }
        return user;
    }
    static async create(data) {
        const passwordHash = await bcryptjs_1.default.hash(data.password, 12);
        return client_1.default.user.create({
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
    static async update(id, data) {
        return client_1.default.user.update({
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
    static async softDelete(id) {
        return client_1.default.user.update({
            where: { id },
            data: {
                deletedAt: new Date(),
                isActive: false,
            },
        });
    }
    static async resetPassword(id, newPassword) {
        const passwordHash = await bcryptjs_1.default.hash(newPassword, 12);
        return client_1.default.user.update({
            where: { id },
            data: { passwordHash },
        });
    }
}
exports.UserService = UserService;
//# sourceMappingURL=user.service.js.map