import { Request, Response, NextFunction } from 'express';
import { ZodError, ZodSchema } from 'zod';
import { logger } from '../utils/logger';

export class AppError extends Error {
    constructor(
        public statusCode: number,
        public message: string,
        public isOperational = true,
        public details?: unknown,
    ) {
        super(message);
        Object.setPrototypeOf(this, AppError.prototype);
    }
}

export const errorHandler = (
    err: Error,
    req: Request,
    res: Response,
    _next: NextFunction,
): void => {
    if (err instanceof AppError) {
        res.status(err.statusCode).json({
            error: err.message,
            ...(err.details ? { details: err.details as Record<string, unknown> } : {}),
        });
        return;
    }

    if (err instanceof ZodError) {
        res.status(400).json({
            error: 'Validation failed',
            details: err.errors.map((e) => ({
                field: e.path.join('.'),
                message: e.message,
            })),
        });
        return;
    }

    // Prisma errors
    if ((err as any).code === 'P2002') {
        res.status(409).json({
            error: 'A record with this value already exists',
            details: (err as any).meta,
        });
        return;
    }

    if ((err as any).code === 'P2025') {
        res.status(404).json({
            error: 'Record not found',
        });
        return;
    }

    // Unexpected errors
    logger.error('Unhandled error:', err);
    res.status(500).json({
        error: process.env.NODE_ENV === 'production'
            ? 'Internal server error'
            : err.message,
    });
};

export const validate = (schema: ZodSchema) => {
    return (req: Request, _res: Response, next: NextFunction): void => {
        try {
            schema.parse({
                body: req.body,
                query: req.query,
                params: req.params,
            });
            next();
        } catch (error) {
            next(error);
        }
    };
};

export const asyncHandler = (
    fn: (req: Request, res: Response, next: NextFunction) => Promise<void>,
) => {
    return (req: Request, res: Response, next: NextFunction) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};
