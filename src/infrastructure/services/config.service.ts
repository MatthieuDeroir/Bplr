import { injectable } from 'inversify';
import * as dotenv from 'dotenv';

@injectable()
export class ConfigService {
    constructor() {
        dotenv.config();
    }

    get(key: string): string | undefined {
        return process.env[key];
    }

    getNumber(key: string): number | undefined {
        const value = this.get(key);
        return value ? Number(value) : undefined;
    }

    getBoolean(key: string): boolean | undefined {
        const value = this.get(key);
        if (value === undefined) return undefined;
        return value.toLowerCase() === 'true';
    }

    isProduction(): boolean {
        return this.get('NODE_ENV') === 'production';
    }

    isDevelopment(): boolean {
        return !this.isProduction();
    }
}