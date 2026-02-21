import { Request, Response, NextFunction } from 'express';
import { ZodSchema } from 'zod';
export declare class AppError extends Error {
    statusCode: number;
    message: string;
    isOperational: boolean;
    details?: unknown | undefined;
    constructor(statusCode: number, message: string, isOperational?: boolean, details?: unknown | undefined);
}
export declare const errorHandler: (err: Error, req: Request, res: Response, _next: NextFunction) => void;
export declare const validate: (schema: ZodSchema) => (req: Request, _res: Response, next: NextFunction) => void;
export declare const asyncHandler: (fn: (req: Request, res: Response, next: NextFunction) => Promise<void>) => (req: Request, res: Response, next: NextFunction) => void;
//# sourceMappingURL=errorHandler.d.ts.map