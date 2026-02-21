"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const user_service_1 = require("../services/user.service");
const auth_1 = require("../middleware/auth");
const errorHandler_1 = require("../middleware/errorHandler");
const schemas_1 = require("../validators/schemas");
const audit_1 = require("../middleware/audit");
const client_1 = require("@prisma/client");
const router = (0, express_1.Router)();
// All user routes require admin
router.use(auth_1.authenticate, (0, auth_1.authorize)(client_1.Role.ADMIN));
// GET /api/users
router.get('/', (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const result = await user_service_1.UserService.getAll({
        page: parseInt(req.query.page) || 1,
        limit: parseInt(req.query.limit) || 20,
        role: req.query.role,
        search: req.query.search,
        isActive: req.query.isActive ? req.query.isActive === 'true' : undefined,
    });
    res.json({ success: true, data: result });
}));
// GET /api/users/:id
router.get('/:id', (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const user = await user_service_1.UserService.getById(req.params.id);
    res.json({ success: true, data: user });
}));
// POST /api/users
router.post('/', (0, errorHandler_1.validate)(schemas_1.createUserSchema), (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const authReq = req;
    const user = await user_service_1.UserService.create(req.body);
    await (0, audit_1.createAuditLog)(authReq.user.userId, 'CREATE_USER', 'User', user.id, undefined, user, req);
    res.status(201).json({ success: true, data: user });
}));
// PUT /api/users/:id
router.put('/:id', (0, errorHandler_1.validate)(schemas_1.updateUserSchema), (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const authReq = req;
    const oldUser = await user_service_1.UserService.getById(req.params.id);
    const user = await user_service_1.UserService.update(req.params.id, req.body);
    await (0, audit_1.createAuditLog)(authReq.user.userId, 'UPDATE_USER', 'User', user.id, oldUser, user, req);
    res.json({ success: true, data: user });
}));
// DELETE /api/users/:id
router.delete('/:id', (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const authReq = req;
    await user_service_1.UserService.softDelete(req.params.id);
    await (0, audit_1.createAuditLog)(authReq.user.userId, 'DELETE_USER', 'User', req.params.id, undefined, undefined, req);
    res.json({ success: true, message: 'User deleted' });
}));
// POST /api/users/:id/reset-password
router.post('/:id/reset-password', (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const authReq = req;
    await user_service_1.UserService.resetPassword(req.params.id, req.body.newPassword);
    await (0, audit_1.createAuditLog)(authReq.user.userId, 'RESET_PASSWORD', 'User', req.params.id, undefined, undefined, req);
    res.json({ success: true, message: 'Password reset successful' });
}));
exports.default = router;
//# sourceMappingURL=user.routes.js.map