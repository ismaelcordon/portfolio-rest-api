# API Architecture

## Overview

The API follows a layered architecture to ensure separation of concerns, scalability, and maintainability.

Each layer has a clearly defined responsibility and should not leak logic into other layers.

---

## Project Structure

```text
src/
  config/
  controllers/
  dtos/
  middlewares/
  models/
    sequelize/
  routes/
  services/
  types/
  utils/
  app.ts
  server.ts
```

---

## Layers and Responsibilities

### Routes

Location: `src/routes/`

- Define API endpoints
- Attach middlewares
- Delegate request handling to controllers

Routes should contain **no business logic**.

---

### Controllers

Location: `src/controllers/`

- Receive HTTP requests
- Extract params, query, and body
- Call the appropriate service
- Return responses using `sendSuccess` or `sendError`

Controllers should remain **thin** and focused on request/response handling.

---

### Services

Location: `src/services/`

- Contain business logic
- Apply rules and validations that go beyond simple request validation

Services should not be aware of HTTP or Express.

---

### Models

Location: `src/models/sequelize/`

- Define database models
- Represent persisted entities such as `Post`, `User`, etc.
- Include ORM-specific model definitions and associations

This layer is responsible for **database representation**, not HTTP contracts.

---

### DTOs

Location: `src/dtos/`

- Define request and response payload contracts
- Represent the data shape exchanged through the API
- Keep transport-layer structures separate from persistence models

Examples:

- `LoginDto`
- `LoginResponseDto`
- `CreatePostDto`
- `UpdatePostDto`
- `PostResponseDto`

DTOs should be grouped by domain when appropriate.

Example structure:

```text
src/dtos/
  auth/
    login.dto.ts
    login-response.dto.ts
  posts/
    create-post.dto.ts
    update-post.dto.ts
    post-response.dto.ts
```

---

### Middlewares

Location: `src/middlewares/`

- Handle cross-cutting concerns

Examples:

- authentication
- authorization
- error handling
- request validation

---

### Utils

Location: `src/utils/`

- Shared helper functions
- Constants (e.g. `HTTP_STATUSES`)
- Reusable utilities across the application

---

### Types

Location: `src/types/`

- Shared TypeScript types and interfaces
- API-wide contracts and reusable type definitions
- Internal types that do not belong specifically to DTOs or models

Examples:

- `ApiErrorCode`
- `SuccessResponse<T>`
- `ErrorResponse<T>`

---

### Config

Location: `src/config/`

- Environment configuration
- Database configuration
- External services setup
- Application-level configuration

Example:

- `database.config.ts`

---

## Entry Points

### `app.ts`

- Creates and configures the Express application
- Registers middlewares
- Registers routes

### `server.ts`

- Starts the HTTP server
- Defines the port
- Boots the application

---

## Request Flow

A typical request follows this flow:

```text
Client → Route → Middleware(s) → Controller → Service → Database
```

### Step-by-step

1. The request reaches a defined route
2. Route-level middlewares are executed
3. The controller processes the request
4. The controller calls the service
5. The service executes business logic
6. The result flows back up to the controller
7. The controller sends a response using `sendSuccess` or `sendError`

DTOs may be used in the controller-service boundary to define expected input and output shapes.

---

## Response Handling

All responses must be sent using the response helpers:

- `sendSuccess`
- `sendError`

This ensures consistency across the entire API.

See: `docs/responses.md`

---

## Architectural Principles

### Separation of Concerns

Each layer has a single responsibility:

- routes → routing
- controllers → request/response handling
- services → business logic
- models → persistence structure
- dtos → API transport contracts

---

### Thin Controllers

Controllers should:

- not contain business logic
- only orchestrate calls and return responses

---

### No HTTP in Services

Services must not:

- access `req` or `res`
- depend on Express

---

### Clear Separation Between Models and DTOs

Database models and API payloads must remain separated.

- Models define how data is stored
- DTOs define how data is received or returned through the API

This prevents persistence concerns from leaking into the transport layer and keeps contracts explicit.

---

### Centralized Error Handling

Errors should be:

- standardized using `sendError`
- associated with a defined `ApiErrorCode`

---

### Consistent Imports

All imports should use path aliases (`#...`) defined in `tsconfig.json`.

Example:

```ts
import { createPost } from "#services/posts.service";
```

---

## Conventions

- New features should follow the same structure
- Each new domain should include:
    - route
    - controller
    - service
    - dto definitions (when needed)

- Naming should be consistent across layers
- Files should be grouped by responsibility, not by feature (for now)

---

## Future Improvements

Potential improvements as the project grows:

- Feature-based modular structure
- Dependency injection
- Validation layer standardization
- Logging and monitoring integration
- Testing strategy (unit + integration)

---

## Source of Truth

The architecture is implemented in the `src/` directory.

This document must be updated if the structure or responsibilities change.
