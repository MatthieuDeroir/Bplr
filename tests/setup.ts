import 'reflect-metadata';
import { createLogger, format, transports } from 'winston';

// Configure test logger
export const testLogger = createLogger({
    level: 'debug',
    format: format.combine(
        format.colorize(),
        format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        format.printf(({ timestamp, level, message, ...rest }) => {
            const metadata = Object.keys(rest).length ? JSON.stringify(rest) : '';
            return `${timestamp} [TEST] ${level}: ${message} ${metadata}`;
        })
    ),
    transports: [new transports.Console()]
});

// Global setup before tests
beforeAll(() => {
    testLogger.info('Starting test suite');
    // Add any global setup here
});

// Global cleanup after tests
afterAll(() => {
    testLogger.info('Test suite completed');
    // Add any global cleanup here
});