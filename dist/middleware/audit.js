"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.auditMiddleware = exports.createAuditLog = void 0;
const client_1 = __importDefault(require("../database/client"));
const createAuditLog = async (userId, action, entity, entityId, oldValue, newValue, req) => {
    try {
        await client_1.default.auditLog.create({
            data: {
                userId,
                action,
                entity,
                entityId,
                oldValue: oldValue ? JSON.parse(JSON.stringify(oldValue)) : undefined,
                newValue: newValue ? JSON.parse(JSON.stringify(newValue)) : undefined,
                ipAddress: req?.ip || req?.socket.remoteAddress,
                userAgent: req?.headers['user-agent'],
            },
        });
    }
    catch (error) {
        // Don't fail the request if audit log fails
        console.error('Audit log creation failed:', error);
    }
};
exports.createAuditLog = createAuditLog;
const auditMiddleware = (action, entity) => {
    return (req, _res, next) => {
        const originalJson = _res.json.bind(_res);
        _res.json = function (body) {
            if (_res.statusCode >= 200 && _res.statusCode < 300) {
                (0, exports.createAuditLog)(req.user?.userId, action, entity, req.params.id, undefined, body, req);
            }
            return originalJson(body);
        };
        next();
    };
};
exports.auditMiddleware = auditMiddleware;
//# sourceMappingURL=audit.js.map