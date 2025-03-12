// src/api/middlewares/auth.middleware.ts
import { Request, Response, NextFunction } from 'express';
import { AuthenticationError } from '@/domain/exceptions/authentication.error';
import { ForbiddenError } from '@/domain/exceptions/forbidden.error';
import jwt from 'jsonwebtoken';
import { container } from '@/inversify.config';
import { TYPES } from '../../types';
import { ConfigService } from '@/infrastructure/services/config.service';

interface TokenPayload {
    userId: string;
    email: string;
    roles?: string[];
}

declare global {
    namespace Express {
        interface Request {
            user?: {
                id: string;
                email: string;
                roles?: string[];
            };
        }
    }
}

export const authenticate = (requiredRoles?: string[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
        try {
            const authHeader = req.headers.authorization;
            if (!authHeader || !authHeader.startsWith('Bearer ')) {
                throw new AuthenticationError('No authentication token provided');
            }

            const token = authHeader.split(' ')[1];
            if (!token) {
                throw new AuthenticationError('Invalid authentication token');
            }

            const configService = container.get<ConfigService>(TYPES.ConfigService);
            const jwtSecret = configService.get('JWT_SECRET');

            if (!jwtSecret) {
                throw new Error('JWT_SECRET not configured');
            }

            const decoded = jwt.verify(token, jwtSecret) as TokenPayload;

            req.user = {
                id: decoded.userId,
                email: decoded.email,
                roles: decoded.roles || []
            };

            // Check roles if required
            if (requiredRoles && requiredRoles.length > 0) {
                const hasRequiredRole = decoded.roles &&
                    requiredRoles.some(role => decoded.roles!.includes(role));

                if (!hasRequiredRole) {
                    throw new ForbiddenError('Insufficient permissions');
                }
            }

            next();
        } catch (error) {
            if (error instanceof jwt.JsonWebTokenError) {
                next(new AuthenticationError('Invalid token'));
            } else {
                next(error);
            }
        }
    };
};
