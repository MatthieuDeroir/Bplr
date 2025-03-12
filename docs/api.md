# Mood Tracker API Documentation

## Overview

This document provides comprehensive documentation for the Mood Tracker application backend API. The application is designed with a modular N-tier architecture that supports dynamic scale definitions, custom scales, and personalized stability formulas.

## Architecture

The application follows a clean architecture pattern with clear separation of concerns:

### Layers

1. **API Layer**
    - REST Controllers
    - Request Validation
    - Authentication & Authorization Middleware
    - Error Handling

2. **Application Layer**
    - Services
    - DTOs
    - Use Cases
    - Cross-cutting concerns

3. **Domain Layer**
    - Entities
    - Repository Interfaces
    - Domain Services
    - Domain Events
    - Value Objects
    - Business Rules

4. **Infrastructure Layer**
    - Database Access
    - External APIs (Mistral AI)
    - Logging
    - Configuration
    - Repository Implementations

## Database Schema

The application uses a flexible database schema that supports:
- Dynamic scale definitions
- User-created custom scales
- Configurable stability formulas
- Historical mood tracking

Key Tables:
- `users` - User accounts
- `scales` - Scale definitions with min/max values
- `scale_levels` - Detailed level descriptions for each scale
- `mood_entries` - User mood entries
- `mood_scale_values` - Scale values for each mood entry
- `stability_formulas` - Formula definitions for calculating stability
- `scale_weights` - Weights for each scale in a formula

## Authentication

The API uses JWT (JSON Web Token) authentication:

- Tokens are issued at login/registration
- Tokens must be included in the `Authorization` header as `Bearer <token>`
- Protected endpoints require a valid token
- Some endpoints may require specific roles

## API Endpoints

### Authentication

#### Register a New User

```
POST /api/users/register
```

Request Body:
```json
{
  "email": "user@example.com",
  "username": "username",
  "password": "password"
}
```

Response:
```json
{
  "token": "jwt_token_here",
  "user": {
    "id": "user_id",
    "email": "user@example.com",
    "username": "username"
  }
}
```

#### Login

```
POST /api/users/login
```

Request Body:
```json
{
  "email": "user@example.com",
  "password": "password"
}
```

Response:
```json
{
  "token": "jwt_token_here",
  "user": {
    "id": "user_id",
    "email": "user@example.com",
    "username": "username"
  }
}
```

#### Get Current User

```
GET /api/users/me
```

Response:
```json
{
  "id": "user_id",
  "email": "user@example.com",
  "username": "username"
}
```

### Scales Management

#### Get All Scales

```
GET /api/scales
```

Response:
```json
[
  {
    "id": "scale_id",
    "name": "humeur",
    "description": "Échelle de l'Humeur (Dépression ←→ Manie)",
    "isDefault": true,
    "userId": null,
    "minValue": 0,
    "maxValue": 13,
    "isActive": true,
    "levels": [
      {
        "id": "level_id",
        "level": 0,
        "description": "Détresse absolue : désespoir intense, idées suicidaires ou grande souffrance psychique."
      },
      // ... more levels
    ]
  },
  // ... more scales
]
```

#### Get Scale by ID

```
GET /api/scales/:id
```

Response:
```json
{
  "id": "scale_id",
  "name": "humeur",
  "description": "Échelle de l'Humeur (Dépression ←→ Manie)",
  "isDefault": true,
  "userId": null,
  "minValue": 0,
  "maxValue": 13,
  "isActive": true,
  "levels": [
    {
      "id": "level_id",
      "level": 0,
      "description": "Détresse absolue : désespoir intense, idées suicidaires ou grande souffrance psychique."
    },
    // ... more levels
  ]
}
```

#### Create a New Scale

```
POST /api/scales
```

Request Body:
```json
{
  "name": "My Custom Scale",
  "description": "A custom scale for tracking specific symptoms",
  "minValue": 0,
  "maxValue": 10,
  "isActive": true,
  "levels": [
    { "level": 0, "description": "None" },
    { "level": 1, "description": "Mild" },
    { "level": 2, "description": "Moderate" },
    // ... more levels
  ]
}
```

Response:
```json
{
  "id": "new_scale_id",
  "name": "My Custom Scale",
  "description": "A custom scale for tracking specific symptoms",
  "isDefault": false,
  "userId": "user_id",
  "minValue": 0,
  "maxValue": 10,
  "isActive": true,
  "levels": [
    // ... levels
  ]
}
```

#### Update a Scale

```
PUT /api/scales/:id
```

Request Body:
```json
{
  "name": "Updated Scale Name",
  "description": "Updated description",
  "isActive": true,
  "levels": [
    // ... updated levels
  ]
}
```

Response:
```json
{
  "id": "scale_id",
  "name": "Updated Scale Name",
  "description": "Updated description",
  "isDefault": false,
  "userId": "user_id",
  "minValue": 0,
  "maxValue": 10,
  "isActive": true,
  "levels": [
    // ... updated levels
  ]
}
```

#### Delete a Scale

```
DELETE /api/scales/:id
```

Response:
```
204 No Content
```

### Mood Entries

#### Get Mood Entries

```
GET /api/mood-entries
```

Parameters:
- `limit` - Number of entries to return (optional)
- `offset` - Pagination offset (optional)

Response:
```json
[
  {
    "id": "entry_id",
    "userId": "user_id",
    "entryDate": "2025-03-10T15:30:00Z",
    "comment": "Feeling better today",
    "medication": "Medication notes",
    "sleepHours": 7.5,
    "stabilityScore": 78.5,
    "stabilityDescription": "Bonne stabilité",
    "scaleValues": [
      {
        "scaleId": "scale_id",
        "scaleName": "humeur",
        "value": 8,
        "description": "Humeur positive : bonne énergie, optimisme modéré, on se sent assez bien."
      },
      // ... more scale values
    ]
  },
  // ... more entries
]
```

#### Get Mood Entry by ID

```
GET /api/mood-entries/:id
```

Response:
```json
{
  "id": "entry_id",
  "userId": "user_id",
  "entryDate": "2025-03-10T15:30:00Z",
  "comment": "Feeling better today",
  "medication": "Medication notes",
  "sleepHours": 7.5,
  "stabilityScore": 78.5,
  "stabilityDescription": "Bonne stabilité",
  "scaleValues": [
    {
      "scaleId": "scale_id",
      "scaleName": "humeur",
      "value": 8,
      "description": "Humeur positive : bonne énergie, optimisme modéré, on se sent assez bien."
    },
    // ... more scale values
  ]
}
```

#### Create a New Mood Entry

```
POST /api/mood-entries
```

Request Body:
```json
{
  "entryDate": "2025-03-10T15:30:00Z",
  "comment": "Feeling better today",
  "medication": "Medication notes",
  "sleepHours": 7.5,
  "scaleValues": [
    {
      "scaleId": "scale_id_humeur",
      "value": 8
    },
    {
      "scaleId": "scale_id_irritabilite",
      "value": 3
    },
    // ... more scale values
  ]
}
```

Response:
```json
{
  "id": "new_entry_id",
  "userId": "user_id",
  "entryDate": "2025-03-10T15:30:00Z",
  "comment": "Feeling better today",
  "medication": "Medication notes",
  "sleepHours": 7.5,
  "stabilityScore": 78.5,
  "stabilityDescription": "Bonne stabilité",
  "scaleValues": [
    // ... scale values with descriptions
  ]
}
```

#### Update a Mood Entry

```
PUT /api/mood-entries/:id
```

Request Body:
```json
{
  "entryDate": "2025-03-10T15:30:00Z",
  "comment": "Updated comment",
  "scaleValues": [
    // ... updated scale values
  ]
}
```

Response:
```json
{
  "id": "entry_id",
  "userId": "user_id",
  "entryDate": "2025-03-10T15:30:00Z",
  "comment": "Updated comment",
  "medication": "Medication notes",
  "sleepHours": 7.5,
  "stabilityScore": 75.2,
  "stabilityDescription": "Stabilité moyenne",
  "scaleValues": [
    // ... updated scale values with descriptions
  ]
}
```

#### Delete a Mood Entry

```
DELETE /api/mood-entries/:id
```

Response:
```
204 No Content
```

### Stability Formulas

#### Get All Stability Formulas

```
GET /api/stability-formulas
```

Response:
```json
[
  {
    "id": "formula_id",
    "userId": null,
    "description": "Default Formula",
    "isDefault": true,
    "isActive": true,
    "formula": "humeur:1,irritabilite:1:true,confiance:1,extraversion:1,bien_etre:1",
    "scaleWeights": [
      {
        "scaleId": "scale_id_humeur",
        "scaleName": "humeur",
        "weight": 1.0,
        "isInverted": false
      },
      // ... more scale weights
    ]
  },
  // ... more formulas
]
```

#### Get Active Formula

```
GET /api/stability-formulas/active
```

Response:
```json
{
  "id": "formula_id",
  "userId": "user_id",
  "description": "My custom formula",
  "isDefault": false,
  "isActive": true,
  "formula": "humeur:1.5,irritabilite:1:true,confiance:0.8,extraversion:0.5,bien_etre:1.2",
  "scaleWeights": [
    // ... scale weights
  ]
}
```

#### Create a New Formula

```
POST /api/stability-formulas
```

Request Body:
```json
{
  "description": "My custom formula",
  "isActive": true,
  "scaleWeights": [
    {
      "scaleId": "scale_id_humeur",
      "weight": 1.5,
      "isInverted": false
    },
    {
      "scaleId": "scale_id_irritabilite",
      "weight": 1.0,
      "isInverted": true
    },
    // ... more scale weights
  ]
}
```

Response:
```json
{
  "id": "new_formula_id",
  "userId": "user_id",
  "description": "My custom formula",
  "isDefault": false,
  "isActive": true,
  "formula": "humeur:1.5,irritabilite:1:true,confiance:0.8,extraversion:0.5,bien_etre:1.2",
  "scaleWeights": [
    // ... scale weights
  ]
}
```

#### Update a Formula

```
PUT /api/stability-formulas/:id
```

Request Body:
```json
{
  "description": "Updated formula description",
  "isActive": true,
  "scaleWeights": [
    // ... updated scale weights
  ]
}
```

Response:
```json
{
  "id": "formula_id",
  "userId": "user_id",
  "description": "Updated formula description",
  "isDefault": false,
  "isActive": true,
  "formula": "humeur:2.0,irritabilite:1:true,confiance:0.8,extraversion:0.5,bien_etre:1.2",
  "scaleWeights": [
    // ... updated scale weights
  ]
}
```

#### Delete a Formula

```
DELETE /api/stability-formulas/:id
```

Response:
```
204 No Content
```

### AI Assessment

#### Process Chat Message

```
POST /api/ai-assessment/chat
```

Request Body:
```json
{
  "message": "I've been feeling very anxious today and didn't sleep well."
}
```

Response:
```json
{
  "message": "I'm sorry to hear you're feeling anxious and had trouble sleeping. Can you tell me more about what's causing your anxiety?",
  "isAssessment": false
}
```

#### Generate Assessment

```
POST /api/ai-assessment/assess
```

Request Body:
```json
{
  "conversation": [
    { "role": "user", "content": "I've been feeling very anxious today and didn't sleep well." },
    { "role": "assistant", "content": "I'm sorry to hear that. Can you tell me more about what's causing your anxiety?" },
    { "role": "user", "content": "Work stress mostly. I have a big deadline coming up and I'm worried I won't meet it." }
  ]
}
```

Response:
```json
{
  "scaleValues": [
    { "scaleId": "scale_id_humeur", "scaleName": "humeur", "value": 5 },
    { "scaleId": "scale_id_irritabilite", "scaleName": "irritabilite", "value": 7 },
    { "scaleId": "scale_id_confiance", "scaleName": "confiance", "value": 4 },
    { "scaleId": "scale_id_extraversion", "scaleName": "extraversion", "value": 6 },
    { "scaleId": "scale_id_bien_etre", "scaleName": "bien_etre", "value": 3 }
  ],
  "sleepHours": 5.5,
  "comment": "User is experiencing anxiety due to work stress, with poor sleep and reduced confidence",
  "medication": ""
}
```

#### Save Assessment

```
POST /api/ai-assessment/save-assessment
```

Request Body:
```json
{
  "scaleValues": [
    { "scaleId": "scale_id_humeur", "scaleName": "humeur", "value": 5 },
    { "scaleId": "scale_id_irritabilite", "scaleName": "irritabilite", "value": 7 },
    { "scaleId": "scale_id_confiance", "scaleName": "confiance", "value": 4 },
    { "scaleId": "scale_id_extraversion", "scaleName": "extraversion", "value": 6 },
    { "scaleId": "scale_id_bien_etre", "scaleName": "bien_etre", "value": 3 }
  ],
  "sleepHours": 5.5,
  "comment": "User is experiencing anxiety due to work stress, with poor sleep and reduced confidence",
  "medication": ""
}
```

Response:
```json
{
  "id": "new_entry_id",
  "userId": "user_id",
  "entryDate": "2025-03-10T15:30:00Z",
  "comment": "User is experiencing anxiety due to work stress, with poor sleep and reduced confidence",
  "medication": "",
  "sleepHours": 5.5,
  "stabilityScore": 46.2,
  "stabilityDescription": "Modérément instable",
  "scaleValues": [
    // ... scale values with descriptions
  ]
}
```

## Error Handling

The API uses standard HTTP status codes:

- `200 OK` - Successful request
- `201 Created` - Resource created
- `204 No Content` - Successful deletion
- `400 Bad Request` - Invalid input
- `401 Unauthorized` - Authentication required
- `403 Forbidden` - Insufficient permissions
- `404 Not Found` - Resource not found
- `409 Conflict` - Resource conflict
- `500 Internal Server Error` - Server error

Error responses include a message and sometimes additional details:

```json
{
  "status": "error",
  "message": "Invalid input data",
  "errors": ["Scale name is required", "Value must be between 0 and 13"]
}
```

## Dynamic Scales and Stability Calculation

### Dynamic Scales

The system supports user-defined scales with:
- Custom name and description
- Configurable minimum and maximum values
- Detailed descriptions for each level

### Stability Calculation

Stability scores are calculated based on:
1. User's scale values for a mood entry
2. Active stability formula weights
3. Scale value adjustments (inversion for scales where higher is worse)

The calculation produces:
- A raw stability score
- A normalized score (0-100 scale)
- A text description of the stability level

## Database Migration

The system includes a migration system for evolving the database schema over time. Migrations are automatically applied during application startup.

## Environment Variables

The application uses the following environment variables:

```
# Server
PORT=3000
NODE_ENV=development

# Database
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_NAME=mood_tracker

# Authentication
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=7d

# Mistral AI
MISTRAL_API_KEY=your_mistral_api_key
MISTRAL_MODEL=mistral-large-latest
```

## Getting Started

### Prerequisites

- Node.js (v14+)
- PostgreSQL (v12+)
- Mistral AI API key (for AI assessment features)

### Installation

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Create a `.env` file with the environment variables
4. Run database migrations:
   ```
   npm run migration:run
   ```
5. Start the server:
   ```
   npm run start
   ```

## Development

### Running in Development Mode

```
npm run dev
```

### Creating a Migration

```
npm run migration:create -- -n MigrationName
```

### Running Tests

```
npm run test
```

## Deployment

For deployment, we recommend:

1. Setting `NODE_ENV=production`
2. Using a process manager like PM2
3. Setting up a reverse proxy with Nginx
4. Using PostgreSQL on a dedicated server
5. Implementing proper logging and monitoring

## Future Enhancements

- GraphQL API
- Real-time updates with WebSockets
- Data export functionality
- Advanced analytics and reporting
- Mobile app support