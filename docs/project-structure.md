mood-tracker-backend/
│
├── src/                         # Source files
│   │
│   ├── api/                     # API Layer
│   │   ├── controllers/         # REST controllers
│   │   │   ├── scale.controller.ts
│   │   │   ├── mood-entry.controller.ts
│   │   │   ├── stability-formula.controller.ts
│   │   │   ├── ai-assessment.controller.ts
│   │   │   └── user.controller.ts
│   │   │
│   │   ├── middlewares/         # API middlewares
│   │   │   ├── auth.middleware.ts
│   │   │   ├── validation.middleware.ts
│   │   │   └── error.middleware.ts
│   │   │
│   │   ├── validation/          # Request validation schemas
│   │   │   ├── scale.validation.ts
│   │   │   ├── mood-entry.validation.ts
│   │   │   ├── stability-formula.validation.ts
│   │   │   └── user.validation.ts
│   │   │
│   │   └── routes/              # Express routes (if not using inversify-express-utils)
│   │
│   ├── application/             # Application Layer
│   │   ├── dtos/                # Data Transfer Objects
│   │   │   ├── scale.dto.ts
│   │   │   ├── mood-entry.dto.ts
│   │   │   ├── stability-formula.dto.ts
│   │   │   └── user.dto.ts
│   │   │
│   │   └── services/            # Application services
│   │       ├── scale.service.ts
│   │       ├── mood-entry.service.ts
│   │       ├── stability-formula.service.ts
│   │       ├── ai-assessment.service.ts
│   │       └── user.service.ts
│   │
│   ├── domain/                  # Domain Layer
│   │   ├── entities/            # Domain entities
│   │   │   ├── user.entity.ts
│   │   │   ├── scale.entity.ts
│   │   │   ├── scale-level.entity.ts
│   │   │   ├── mood-entry.entity.ts
│   │   │   ├── mood-scale-value.entity.ts
│   │   │   ├── stability-formula.entity.ts
│   │   │   └── scale-weight.entity.ts
│   │   │
│   │   ├── exceptions/          # Domain exceptions
│   │   │   ├── application.error.ts
│   │   │   ├── validation.error.ts
│   │   │   ├── authentication.error.ts
│   │   │   ├── forbidden.error.ts
│   │   │   ├── not-found.error.ts
│   │   │   └── conflict.error.ts
│   │   │
│   │   ├── interfaces/          # Interfaces
│   │   │   └── repositories/    # Repository interfaces
│   │   │       ├── user-repository.interface.ts
│   │   │       ├── scale-repository.interface.ts
│   │   │       ├── scale-level-repository.interface.ts
│   │   │       ├── mood-entry-repository.interface.ts
│   │   │       ├── mood-scale-value-repository.interface.ts
│   │   │       ├── stability-formula-repository.interface.ts
│   │   │       └── scale-weight-repository.interface.ts
│   │   │
│   │   └── services/            # Domain services
│   │       ├── stability-calculator.service.ts
│   │       ├── scale-management.service.ts
│   │       └── stability-formula-parser.service.ts
│   │
│   ├── infrastructure/          # Infrastructure Layer
│   │   ├── database/            # Database related
│   │   │   ├── entities/        # TypeORM entities
│   │   │   │   ├── user.entity.ts
│   │   │   │   ├── scale.entity.ts
│   │   │   │   ├── scale-level.entity.ts
│   │   │   │   ├── mood-entry.entity.ts
│   │   │   │   ├── mood-scale-value.entity.ts
│   │   │   │   ├── stability-formula.entity.ts
│   │   │   │   └── scale-weight.entity.ts
│   │   │   │
│   │   │   ├── migrations/      # Database migrations
│   │   │   │   ├── 1713378015000-CreateInitialTables.ts
│   │   │   │   └── 1713378015001-SeedDefaultScales.ts
│   │   │   │
│   │   │   └── migration-utils.ts  # Migration utilities
│   │   │
│   │   ├── repositories/        # Repository implementations
│   │   │   ├── base.repository.ts
│   │   │   ├── user.repository.ts
│   │   │   ├── scale.repository.ts
│   │   │   ├── scale-level.repository.ts
│   │   │   ├── mood-entry.repository.ts
│   │   │   ├── mood-scale-value.repository.ts
│   │   │   ├── stability-formula.repository.ts
│   │   │   └── scale-weight.repository.ts
│   │   │
│   │   └── services/            # Infrastructure services
│   │       ├── mistral-api.client.ts
│   │       ├── logger.service.ts
│   │       └── config.service.ts
│   │
│   ├── types.ts                 # Type definitions for dependency injection
│   ├── inversify.config.ts      # Dependency injection container config
│   └── app.ts                   # Main application entry point
│
├── scripts/                     # Scripts for deployment, database seeding, etc.
│   ├── seed-default-scales.ts
│   └── create-admin-user.ts
│
├── tests/                       # Test files
│   ├── unit/                    # Unit tests
│   │   ├── domain/
│   │   │   └── services/
│   │   │       └── stability-calculator.service.spec.ts
│   │   │
│   │   └── application/
│   │       └── services/
│   │           └── mood-entry.service.spec.ts
│   │
│   ├── integration/             # Integration tests
│   │   ├── api/
│   │   │   └── scale.controller.spec.ts
│   │   │
│   │   └── repositories/
│   │       └── mood-entry.repository.spec.ts
│   │
│   └── e2e/                     # End-to-end tests
│       └── mood-tracking.spec.ts
│
├── docs/                        # Documentation
│   ├── api.md                   # API documentation
│   └── architecture.md          # Architecture documentation
│
├── .env.example                 # Example environment variables
├── .gitignore                   # Git ignore file
├── tsconfig.json                # TypeScript configuration
├── jest.config.js               # Jest test configuration
├── package.json                 # npm package file
├── README.md                    # Project README
└── nodemon.json                 # Nodemon configuration for development