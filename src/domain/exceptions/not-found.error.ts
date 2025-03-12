// src/domain/exceptions/not-found.error.ts
import { ApplicationError } from './application.error';

export class NotFoundError extends ApplicationError {
    constructor(entity: string, id?: string) {
        const message = id ? `${entity} with id ${id} not found` : `${entity} not found`;
        super(message);
    }
}