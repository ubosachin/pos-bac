import { AuthRequest } from './auth';
import { Request, Response, NextFunction } from 'express';
export declare const createAuditLog: (userId: string | undefined, action: string, entity: string, entityId?: string, oldValue?: object, newValue?: object, req?: Request) => Promise<void>;
export declare const auditMiddleware: (action: string, entity: string) => (req: AuthRequest, _res: Response, next: NextFunction) => void;
//# sourceMappingURL=audit.d.ts.map