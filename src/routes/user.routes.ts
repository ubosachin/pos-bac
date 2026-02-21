import { Router } from 'express';
import { UserService } from '../services/user.service';
import { authenticate, authorize, AuthRequest } from '../middleware/auth';
import { validate, asyncHandler } from '../middleware/errorHandler';
import { createUserSchema, updateUserSchema } from '../validators/schemas';
import { createAuditLog } from '../middleware/audit';
import { Role } from '@prisma/client';

const router = Router();

// All user routes require admin
router.use(authenticate, authorize(Role.ADMIN));

// GET /api/users
router.get(
    '/',
    asyncHandler(async (req, res) => {
        const result = await UserService.getAll({
            page: parseInt(req.query.page as string) || 1,
            limit: parseInt(req.query.limit as string) || 20,
            role: req.query.role as Role | undefined,
            search: req.query.search as string | undefined,
            isActive: req.query.isActive ? req.query.isActive === 'true' : undefined,
        });
        res.json({ success: true, data: result });
    }),
);

// GET /api/users/:id
router.get(
    '/:id',
    asyncHandler(async (req, res) => {
        const user = await UserService.getById(req.params.id as string);
        res.json({ success: true, data: user });
    }),
);

// POST /api/users
router.post(
    '/',
    validate(createUserSchema),
    asyncHandler(async (req, res) => {
        const authReq = req as AuthRequest;
        const user = await UserService.create(req.body);

        await createAuditLog(authReq.user!.userId, 'CREATE_USER', 'User', user.id, undefined, user, req);

        res.status(201).json({ success: true, data: user });
    }),
);

// PUT /api/users/:id
router.put(
    '/:id',
    validate(updateUserSchema),
    asyncHandler(async (req, res) => {
        const authReq = req as AuthRequest;
        const oldUser = await UserService.getById(req.params.id as string);
        const user = await UserService.update(req.params.id as string, req.body);

        await createAuditLog(authReq.user!.userId, 'UPDATE_USER', 'User', user.id, oldUser, user, req);

        res.json({ success: true, data: user });
    }),
);

// DELETE /api/users/:id
router.delete(
    '/:id',
    asyncHandler(async (req, res) => {
        const authReq = req as AuthRequest;
        await UserService.softDelete(req.params.id as string);

        await createAuditLog(authReq.user!.userId, 'DELETE_USER', 'User', req.params.id as string, undefined, undefined, req);

        res.json({ success: true, message: 'User deleted' });
    }),
);

// POST /api/users/:id/reset-password
router.post(
    '/:id/reset-password',
    asyncHandler(async (req, res) => {
        const authReq = req as AuthRequest;
        await UserService.resetPassword(req.params.id as string, req.body.newPassword);

        await createAuditLog(authReq.user!.userId, 'RESET_PASSWORD', 'User', req.params.id as string, undefined, undefined, req);

        res.json({ success: true, message: 'Password reset successful' });
    }),
);

export default router;
