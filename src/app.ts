import 'reflect-metadata';
import express from 'express';
import { InversifyExpressServer } from 'inversify-express-utils';
import { container } from './inversify.config';
import { json, urlencoded } from 'body-parser';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import errorMiddleware from '@/api/middlewares/error.middleware';
import { initializeDataSource } from '@/infrastructure/database/data-source';
import { setupSwagger } from '@/api/swagger';

// Import controllers
import '@/api/controllers/scale.controller';
import '@/api/controllers/mood-entry.controller';
import '@/api/controllers/stability-formula.controller';
import '@/api/controllers/ai-assessment.controller';
import '@/api/controllers/user.controller';

async function startServer() {
    try {
        // Initialize the database connection before setting up the server
        console.log('Initializing database connection...');
        await initializeDataSource();
        console.log('Database connection initialized successfully');

        // Setup express server
        const server = new InversifyExpressServer(container);

        server.setConfig((app) => {
            // Middleware
            app.use(cors());
            app.use(helmet());
            app.use(json());
            app.use(urlencoded({ extended: true }));
            app.use(morgan('dev'));

            // Setup Swagger documentation
            setupSwagger(app);
        });

        server.setErrorConfig((app) => {
            app.use(errorMiddleware);
        });

        // Build and start the server
        const app = server.build();
        const PORT = process.env.PORT || 3000;

        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
            console.log(`Swagger documentation available at http://localhost:${PORT}/api-docs`);
        });
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
}

// Start the server
startServer();

// For testing
export default startServer;