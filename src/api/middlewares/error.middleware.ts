// src/api/middlewares/error.middleware.ts
import { Request, Response, NextFunction } from 'express';
import { ValidationError } from '@/domain/exceptions/validation.error';
import { AuthenticationError } from '@/domain/exceptions/authentication.error';
import { NotFoundError } from '@/domain/exceptions/not-found.error';
import { ForbiddenError } from '@/domain/exceptions/forbidden.error';
import { ConflictError } from '@/domain/exceptions/conflict.error';
import { inject, injectable } from 'inversify';
import { TYPES } from '../../types';
import { LoggerService } from '@/infrastructure/services/logger.service';

@injectable()
export class ErrorMiddleware {
    constructor(
        @inject(TYPES.Logger) private logger: {
            error: (message: string, meta?: any) => any;
            warn: (message: string, meta?: any) => any;
            info: (message: string, meta?: any) => any;
            debug: (message: string, meta?: any) => any
        }
    ) {}

    handle(error: Error, req: Request, res: Response, next: NextFunction): void {
        this.logger.error(`Error occurred: ${error.message}`, {
            stack: error.stack,
            path: req.path,
            method: req.method,
            body: req.body
        });

        if (error instanceof ValidationError) {
            res.status(400).json({
                status: 'error',
                message: error.message,
                errors: error.errors
            });
            return;
        }

        if (error instanceof AuthenticationError) {
            res.status(401).json({
                status: 'error',
                message: error.message
            });
            return;
        }

        if (error instanceof ForbiddenError) {
            res.status(403).json({
                status: 'error',
                message: error.message
            });
            return;
        }

        if (error instanceof NotFoundError) {
            res.status(404).json({
                status: 'error',
                message: error.message
            });
            return;
        }

        if (error instanceof ConflictError) {
            res.status(409).json({
                status: 'error',
                message: error.message
            });
            return;
        }

        // Default to 500 server error
        res.status(500).json({
            status: 'error',
            message: 'An unexpected error occurred'
        });
    }
}

// Export a factory function
export default (req: Request, res: Response, next: NextFunction): void => {
    const errorMiddleware = new ErrorMiddleware(
        // Use a simple console logger if container is not available
        {
            error: (message: string, meta?: any) => console.error(message, meta),
            warn: (message: string, meta?: any) => console.warn(message, meta),
            info: (message: string, meta?: any) => console.info(message, meta),
            debug: (message: string, meta?: any) => console.debug(message, meta)
        }
    );
    // @ts-ignore
    errorMiddleware.handle(req, res, next);
};
