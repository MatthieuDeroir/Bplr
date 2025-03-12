// src/domain/exceptions/forbidden.error.ts
import { ApplicationError } from './application.error';

export class ForbiddenError extends ApplicationError {
    constructor(message: string = 'Access forbidden') {
        super(message);
    }
}