# Mood Tracker Backend

N-tier TypeScript backend for the Mood Tracker application.

## Overview

This is a mental health tracking application backend designed with a clean N-tier architecture. It allows users to track their mood and mental health metrics using customizable scales and formulas.

## Features

- Dynamic custom scales for tracking various mental health metrics
- Stability formulas with configurable weights for different metrics
- User authentication and profile management
- Mood entry tracking with sleep, medication, and custom notes
- AI-powered mood assessment using Mistral AI

## Tech Stack

- TypeScript
- Node.js
- Express
- PostgreSQL
- TypeORM
- InversifyJS (Dependency Injection)
- JWT Authentication
- Mistral AI API Integration

## Architecture

The application follows a clean architecture pattern with clear separation of concerns:

- **API Layer**: Controllers, middleware, validation
- **Application Layer**: Services, DTOs, use cases
- **Domain Layer**: Entities, repository interfaces, domain services
- **Infrastructure Layer**: Database, external services, repository implementations

## Setup

### Prerequisites

- Node.js (v14+)
- PostgreSQL (v12+)
- Mistral AI API key (for AI assessment features)

### Environment Variables

Create a `.env` file in the root directory with the following variables:

```
# Server
PORT=3000
NODE_ENV=development

# Database
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=your_password
DB_NAME=mood_tracker

# Authentication
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=7d

# Mistral AI
MISTRAL_API_KEY=your_mistral_api_key
MISTRAL_MODEL=mistral-large-latest
```

### Installation

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Setup the database:
   ```
   npm run db:setup
   ```
   This will:
    - Run all pending migrations
    - Seed default scales and stability formula
    - Create a demo user with credentials `demo@example.com` / `demopassword`
    - Add example mood entries

4. Start the server:
   ```
   npm run dev
   ```

## API Documentation

The API documentation is available at `/api-docs` when the server is running.

Default scales provided include:
- Mood (Humeur)
- Irritability (Irritabilité)
- Self-confidence (Confiance)
- Extraversion
- Well-being (Bien-être)

Each scale has detailed level descriptions for accurate tracking.

## Important UUIDs for Testing

When testing with tools like Postman, you can use these predefined UUIDs:

### Default Scales
- Humeur: `9e28a52b-1a43-456d-be3d-85ec1d8d7dc5`
- Irritabilité: `a3cfcd9b-2608-4dce-a576-b0cab5894af5`
- Confiance: `c7f09f47-c71f-4d2e-9e06-b53c6e9dec2f`
- Extraversion: `d9b93e39-2d19-4af1-aae6-6895522bf81a`
- Bien-être: `f5a28535-76db-4aec-80c4-303c1497a707`

### Default Stability Formula
- Formula ID: `b0c0b3b8-c8a3-44c0-8a9d-2c53813d882e`

### Demo User
- User ID: `64b31607-1717-44d4-8344-5898a4119bd9`

## Available Scripts

- `npm run build` - Build the project
- `npm run start` - Start the production server
- `npm run dev` - Start the development server with hot reload
- `npm run test` - Run tests
- `npm run db:setup` - Setup database with migrations and seed data
- `npm run migration:create -- -n MyMigration` - Create a new migration
- `npm run migration:run` - Run pending migrations
- `npm run migration:revert` - Revert the last migration

## Contributing

Please follow the existing architecture and coding style when contributing to this project.

## License

This project is licensed under the MIT License.