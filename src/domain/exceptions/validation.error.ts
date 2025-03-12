// src/domain/exceptions/validation.error.ts
import { ApplicationError } from './application.error';

export class ValidationError extends ApplicationError {
    public errors: string[] | Record<string, string[]>;

    constructor(message: string, errors?: string[] | Record<string, string[]>) {
        super(message);
        this.errors = errors || [];
    }
}
