import { injectable, inject } from 'inversify';
import { TYPES } from '@/types';
import { IUserRepository } from '@/domain/interfaces/repositories/user-repository.interface';
import { User } from '@/domain/entities/user.entity';
import { ConfigService } from '@/infrastructure/services/config.service';
import { LoggerService } from '@/infrastructure/services/logger.service';
import bcrypt from 'bcrypt';
import jwt, { Secret } from 'jsonwebtoken';
import { AuthenticationError } from '@/domain/exceptions/authentication.error';
import { ConflictError } from '@/domain/exceptions/conflict.error';

export interface UserRegistrationDto {
    email: string;
    username: string;
    password: string;
}

export interface UserLoginDto {
    email: string;
    password: string;
}

export interface AuthResponseDto {
    token: string;
    user: {
        id: string;
        email: string;
        username: string;
    };
}

@injectable()
export class UserService {
    constructor(
        @inject(TYPES.UserRepository) private userRepository: IUserRepository,
        @inject(TYPES.ConfigService) private configService: ConfigService,
        @inject(TYPES.Logger) private logger: LoggerService
    ) {}

    async register(userData: UserRegistrationDto): Promise<AuthResponseDto> {
        try {
            // Check if user already exists
            const existingUser = await this.userRepository.findByEmail(userData.email);
            if (existingUser) {
                throw new ConflictError('User with this email already exists');
            }

            // Hash password
            const salt = await bcrypt.genSalt(10);
            const passwordHash = await bcrypt.hash(userData.password, salt);

            // Create user
            const newUser = await this.userRepository.create({
                email: userData.email,
                username: userData.username,
                passwordHash
            });

            // Generate JWT token
            const token = this.generateToken(newUser);

            return {
                token,
                user: {
                    id: newUser.id,
                    email: newUser.email,
                    username: newUser.username
                }
            };
        } catch (error) {
            this.logger.error('Error during user registration', { error, email: userData.email });
            throw error;
        }
    }

    async login(loginData: UserLoginDto): Promise<AuthResponseDto> {
        try {
            // Find user by email
            const user = await this.userRepository.findByEmail(loginData.email);
            if (!user) {
                throw new AuthenticationError('Invalid email or password');
            }

            // Verify password
            const isPasswordValid = await bcrypt.compare(loginData.password, user.passwordHash);
            if (!isPasswordValid) {
                throw new AuthenticationError('Invalid email or password');
            }

            // Generate JWT token
            const token = this.generateToken(user);

            return {
                token,
                user: {
                    id: user.id,
                    email: user.email,
                    username: user.username
                }
            };
        } catch (error) {
            this.logger.error('Error during user login', { error, email: loginData.email });
            throw error;
        }
    }

    async getUserById(id: string): Promise<User | null> {
        return this.userRepository.findById(id);
    }

    private generateToken(user: User): string {
        const jwtSecret = this.configService.get('JWT_SECRET');

        if (!jwtSecret) {
            this.logger.error('JWT_SECRET not configured in environment variables');
            // Use a default secret for development (DON'T DO THIS IN PRODUCTION)
            const defaultSecret = 'dev-temporary-secret-key-for-development-only';
            this.logger.warn(`Using default JWT secret - NOT SECURE FOR PRODUCTION`);

            // @ts-ignore
            return jwt.sign(
                {
                    userId: user.id,
                    email: user.email
                },
                defaultSecret as Secret,
                {
                    expiresIn: this.configService.get('JWT_EXPIRES_IN') || '7d'
                }
            );
        }

        try {
            // @ts-ignore
            return jwt.sign(
                {
                    userId: user.id,
                    email: user.email
                },
                jwtSecret as Secret,
                {
                    expiresIn: this.configService.get('JWT_EXPIRES_IN') || '7d'
                }
            );
        } catch (error) {
            this.logger.error('Error signing JWT token', { error, userId: user.id });
            throw new Error('Failed to generate authentication token');
        }
    }
}