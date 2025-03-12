// src/infrastructure/services/logger.service.ts
import { injectable, inject } from 'inversify';
import { TYPES } from '../../types';
import { ConfigService } from './config.service';
import winston, { createLogger, format, transports } from 'winston';

@injectable()
export class LoggerService {
    private logger: winston.Logger;

    constructor(
        @inject(TYPES.ConfigService) private configService: ConfigService
    ) {
        this.logger = createLogger({
            level: this.configService.isDevelopment() ? 'debug' : 'info',
            format: format.combine(
                format.timestamp(),
                format.errors({ stack: true }),
                format.splat(),
                format.json()
            ),
            defaultMeta: { service: 'mood-tracker' },
            transports: [
                new transports.Console({
                    format: format.combine(
                        format.colorize(),
                        format.simple()
                    )
                })
            ]
        });

        // Add file transport in production
        if (this.configService.isProduction()) {
            this.logger.add(new transports.File({
                filename: 'logs/error.log',
                level: 'error'
            }));
            this.logger.add(new transports.File({
                filename: 'logs/combined.log'
            }));
        }
    }

    error(message: string, meta?: any): void {
        this.logger.error(message, meta);
    }

    warn(message: string, meta?: any): void {
        this.logger.warn(message, meta);
    }

    info(message: string, meta?: any): void {
        this.logger.info(message, meta);
    }

    debug(message: string, meta?: any): void {
        this.logger.debug(message, meta);
    }
}