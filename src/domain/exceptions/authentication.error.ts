// src/domain/exceptions/authentication.error.ts
import { ApplicationError } from './application.error';

export class AuthenticationError extends ApplicationError {
    constructor(message: string = 'Authentication required') {
        super(message);
    }
}