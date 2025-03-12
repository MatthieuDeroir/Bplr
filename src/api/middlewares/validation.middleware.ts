// src/api/middlewares/validation.middleware.ts
import { Request, Response, NextFunction } from 'express';
import { AnySchema } from 'joi';
import { ValidationError } from '@/domain/exceptions/validation.error';

export const validate = (schema: AnySchema) => {
    return (req: Request, res: Response, next: NextFunction) => {
        const { error } = schema.validate(req.body, {
            abortEarly: false,
            stripUnknown: true
        });

        if (error) {
            const errorMessage = error.details.map(detail => detail.message).join(', ');
            return next(new ValidationError(errorMessage));
        }

        next();
    };
};