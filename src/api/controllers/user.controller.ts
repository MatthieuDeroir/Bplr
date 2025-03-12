import { Request, Response } from 'express';
import { inject } from 'inversify';
import { controller, httpPost, httpGet } from 'inversify-express-utils';
import { TYPES } from '@/types';
import { UserService, UserRegistrationDto, UserLoginDto } from '@/application/services/user.service';
import { validate } from '@/api/middlewares/validation.middleware';
import { registerSchema, loginSchema } from '@/api/validation/user.validation';
import { authenticate } from '@/api/middlewares/auth.middleware';
import { LoggerService } from '@/infrastructure/services/logger.service';

@controller('/api/users')
export class UserController {
    constructor(
        @inject(TYPES.UserService) private userService: UserService,
        @inject(TYPES.Logger) private logger: LoggerService
    ) {}

    @httpPost('/register', validate(registerSchema))
    async register(req: Request, res: Response): Promise<void> {
        try {
            const userData: UserRegistrationDto = req.body;
            const result = await this.userService.register(userData);
            res.status(201).json(result);
        } catch (error: any) {
            this.logger.error('Registration failed in controller', { error, email: req.body.email });

            if (error.message && error.message.includes('already exists')) {
                res.status(409).json({ message: error.message });
            } else {
                // Log detailed error for debugging
                this.logger.error('Unexpected error during registration', {
                    errorName: error.name,
                    errorMessage: error.message,
                    errorStack: error.stack
                });
                res.status(500).json({ message: 'Registration failed', error: error.message });
            }
        }
    }

    @httpPost('/login', validate(loginSchema))
    async login(req: Request, res: Response): Promise<void> {
        try {
            const loginData: UserLoginDto = req.body;
            const result = await this.userService.login(loginData);
            res.json(result);
        } catch (error: any) {
            this.logger.error('Login failed in controller', { error, email: req.body.email });

            if (error.message && error.message.includes('Invalid email or password')) {
                res.status(401).json({ message: error.message });
            } else {
                // Log detailed error for debugging
                this.logger.error('Unexpected error during login', {
                    errorName: error.name,
                    errorMessage: error.message,
                    errorStack: error.stack
                });
                res.status(500).json({ message: 'Login failed', error: error.message });
            }
        }
    }

    @httpGet('/me', authenticate())
    async getUserProfile(req: Request, res: Response): Promise<void> {
        try {
            const userId = req.user!.id;
            const user = await this.userService.getUserById(userId);

            if (!user) {
                res.status(404).json({ message: 'User not found' });
                return;
            }

            res.json({
                id: user.id,
                email: user.email,
                username: user.username
            });
        } catch (error: any) {
            this.logger.error('Error getting user profile', { error, userId: req.user?.id });
            res.status(500).json({ message: 'Failed to get user profile', error: error.message });
        }
    }
}