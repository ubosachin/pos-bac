import prisma from '../database/client';
import { AuthRequest } from './auth';
import { Request, Response, NextFunction } from 'express';

export const createAuditLog = async (
    userId: string | undefined,
    action: string,
    entity: string,
    entityId?: string,
    oldValue?: object,
    newValue?: object,
    req?: Request,
) => {
    try {
        await prisma.auditLog.create({
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
    } catch (error) {
        // Don't fail the request if audit log fails
        console.error('Audit log creation failed:', error);
    }
};

export const auditMiddleware = (action: string, entity: string) => {
    return (req: AuthRequest, _res: Response, next: NextFunction): void => {
        const originalJson = _res.json.bind(_res);

        _res.json = function (body: any) {
            if (_res.statusCode >= 200 && _res.statusCode < 300) {
                createAuditLog(
                    req.user?.userId,
                    action,
                    entity,
                    (req.params.id as string),
                    undefined,
                    body,
                    req,
                );
            }
            return originalJson(body);
        };

        next();
    };
};
