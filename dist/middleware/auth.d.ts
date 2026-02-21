import { Request, Response, NextFunction } from 'express';
import { Role } from '@prisma/client';
export interface AuthPayload {
    userId: string;
    email: string;
    role: Role;
}
export interface AuthRequest extends Request {
    user?: AuthPayload;
}
export declare const authenticate: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const authorize: (...roles: Role[]) => (req: AuthRequest, res: Response, next: NextFunction) => void;
export declare const optionalAuth: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
//# sourceMappingURL=auth.d.ts.map