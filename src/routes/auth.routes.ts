import { Router } from 'express';
import { AuthService } from '../services/auth.service';
import { authenticate, AuthRequest } from '../middleware/auth';
import { validate, asyncHandler } from '../middleware/errorHandler';
import { loginSchema, registerSchema, changePasswordSchema } from '../validators/schemas';
import { createAuditLog } from '../middleware/audit';

const router = Router();

// POST /api/auth/login
router.post(
    '/login',
    validate(loginSchema),
    asyncHandler(async (req, res) => {
        const { emailOrUsername, password } = req.body;
        const result = await AuthService.login(emailOrUsername, password);

        await createAuditLog(result.user.id, 'LOGIN', 'User', result.user.id, undefined, undefined, req);

        res.json({
            success: true,
            data: result,
        });
    }),
);

// POST /api/auth/register
router.post(
    '/register',
    validate(registerSchema),
    asyncHandler(async (req, res) => {
        const result = await AuthService.register(req.body);

        await createAuditLog(result.user.id, 'REGISTER', 'User', result.user.id, undefined, undefined, req);

        res.status(201).json({
            success: true,
            data: result,
        });
    }),
);

// GET /api/auth/me
router.get(
    '/me',
    authenticate,
    asyncHandler(async (req, res) => {
        const authReq = req as AuthRequest;
        const user = await AuthService.getProfile(authReq.user!.userId);

        res.json({
            success: true,
            data: user,
        });
    }),
);

// PUT /api/auth/change-password
router.put(
    '/change-password',
    authenticate,
    validate(changePasswordSchema),
    asyncHandler(async (req, res) => {
        const authReq = req as AuthRequest;
        const result = await AuthService.changePassword(
            authReq.user!.userId,
            req.body.currentPassword,
            req.body.newPassword,
        );

        await createAuditLog(authReq.user!.userId, 'CHANGE_PASSWORD', 'User', authReq.user!.userId, undefined, undefined, req);

        res.json({ success: true, data: result });
    }),
);

export default router;
