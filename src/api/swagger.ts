import express from 'express';
import swaggerUi from 'swagger-ui-express';
import yaml from 'yamljs';
import path from 'path';
import fs from 'fs';

export function setupSwagger(app: express.Application): void {
    try {
        // Check if the swagger.yaml file exists
        const swaggerPath = path.join(__dirname, '../../swagger.yaml');
        if (!fs.existsSync(swaggerPath)) {
            console.warn('Warning: swagger.yaml not found at path:', swaggerPath);
            return;
        }

        // Load the swagger document
        const swaggerDocument = yaml.load(swaggerPath);

        // Set up the Swagger UI
        app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
        console.log('Swagger UI is available at /api-docs');
    } catch (error) {
        console.error('Error setting up Swagger UI:', error);
    }
}