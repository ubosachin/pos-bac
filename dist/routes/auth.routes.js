"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_service_1 = require("../services/auth.service");
const auth_1 = require("../middleware/auth");
const errorHandler_1 = require("../middleware/errorHandler");
const schemas_1 = require("../validators/schemas");
const audit_1 = require("../middleware/audit");
const router = (0, express_1.Router)();
// POST /api/auth/login
router.post('/login', (0, errorHandler_1.validate)(schemas_1.loginSchema), (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { emailOrUsername, password } = req.body;
    const result = await auth_service_1.AuthService.login(emailOrUsername, password);
    await (0, audit_1.createAuditLog)(result.user.id, 'LOGIN', 'User', result.user.id, undefined, undefined, req);
    res.json({
        success: true,
        data: result,
    });
}));
// POST /api/auth/register
router.post('/register', (0, errorHandler_1.validate)(schemas_1.registerSchema), (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const result = await auth_service_1.AuthService.register(req.body);
    await (0, audit_1.createAuditLog)(result.user.id, 'REGISTER', 'User', result.user.id, undefined, undefined, req);
    res.status(201).json({
        success: true,
        data: result,
    });
}));
// GET /api/auth/me
router.get('/me', auth_1.authenticate, (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const authReq = req;
    const user = await auth_service_1.AuthService.getProfile(authReq.user.userId);
    res.json({
        success: true,
        data: user,
    });
}));
// PUT /api/auth/change-password
router.put('/change-password', auth_1.authenticate, (0, errorHandler_1.validate)(schemas_1.changePasswordSchema), (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const authReq = req;
    const result = await auth_service_1.AuthService.changePassword(authReq.user.userId, req.body.currentPassword, req.body.newPassword);
    await (0, audit_1.createAuditLog)(authReq.user.userId, 'CHANGE_PASSWORD', 'User', authReq.user.userId, undefined, undefined, req);
    res.json({ success: true, data: result });
}));
exports.default = router;
//# sourceMappingURL=auth.routes.js.map