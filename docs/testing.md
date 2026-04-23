# Testing Strategy

## Overview

This project uses **Vitest** as the testing framework and separates tests into two main categories:

- **Unit tests**
- **Integration tests**

This separation makes it possible to test business logic and controller behavior in isolation, while also validating end-to-end behavior across the HTTP and database layers.

---

## Testing Types

### Unit Tests

Unit tests focus on isolated pieces of logic.

Typical examples:

- controllers
- services
- helpers
- validators
- mappers

Unit tests should mock external dependencies when needed.

Examples of mocked dependencies:

- services
- helpers
- repositories

---

### Integration Tests

Integration tests validate how multiple parts of the system work together.

Typical examples:

- HTTP endpoints
- route handling
- controller + service + repository interaction
- database integration

Integration tests use a real test database and execute real application flows.

---

## Test Structure

Tests are organized into separate folders:

```text
tests/
  fixtures/
  integration/
  unit/
  global.setup.ts
```

### Folder responsibilities

- `tests/unit/` → isolated unit tests
- `tests/integration/` → integration tests with app + database
- `tests/fixtures/` → reusable mock data and test payloads
- `tests/global.setup.ts` → global setup for integration test database lifecycle

---

## Testing Tools

The project uses:

- **Vitest** for test execution
- **Supertest** for HTTP integration testing
- **Sequelize** for database interaction in integration tests

---

## Test Commands

The project defines the following test commands:

```json
{
    "test:coverage": "vitest run -c vitest.unit.config.ts --coverage",
    "test:unit": "vitest run -c vitest.unit.config.ts",
    "test:integration": "vitest run -c vitest.integration.config.ts",
    "test": "npm run test:unit && npm run test:integration"
}
```

### Command purpose

- `npm run test:unit` → runs unit tests only
- `npm run test:integration` → runs integration tests only
- `npm run test` → runs both unit and integration tests
- `npm run test:coverage` → generates coverage information for unit tests

---

## Unit Test Configuration

Unit tests are configured with a dedicated Vitest configuration.

### Scope

- Includes files matching: `tests/unit/**/*.test.ts`

### Coverage

Coverage reporting is enabled for unit tests.

### Coverage output

```text
.coverage/
```

### Coverage exclusions

- `node_modules/`
- `tests/`
- `**/*.config.ts`
- `dist/`

### Aliases

Unit tests use the same path aliases as the application to keep imports consistent.

Examples:

- `#controllers`
- `#services`
- `#helpers`
- `#utils`

---

## Integration Test Configuration

Integration tests are configured independently from unit tests.

### Scope

- Includes files matching: `tests/integration/**/*.test.ts`

### Environment

- `node`

### Setup

Integration tests use:

- `globalSetup`: `./tests/global.setup.ts`
- `setupFiles`: `./tests/integration/test.integration.setup.ts`

### Execution model

Integration tests run sequentially to avoid database race conditions.

Configuration used:

- `fileParallelism: false`
- `maxWorkers: 1`

### Environment variables

Integration tests load environment variables from:

```text
.env.test
```

These variables are injected into the Vitest test environment.

Examples:

- `DB_HOST`
- `DB_PORT`
- `DB_NAME`
- `DB_USER`
- `DB_PASSWORD`

### Coverage

Integration tests also define coverage reporting, while keeping test execution isolated from the unit test configuration.

---

## Global Integration Setup

Integration tests use a global setup file to initialize the database before the test suite runs.

### Responsibilities

- authenticate Sequelize connection
- drop the schema if it exists
- recreate the schema
- synchronize all models
- close the database connection after all tests finish

### Current implementation

```ts
import { sequelize } from "#config/database.config.js";

import "#models/sequelize/associations.js";

export default async function () {
    await sequelize.authenticate();

    await sequelize.query('DROP SCHEMA IF EXISTS "dbo" CASCADE;');
    await sequelize.query('CREATE SCHEMA "dbo";');

    await sequelize.sync({ force: true });

    return async () => {
        await sequelize.close();
    };
}
```

### Purpose

This ensures that integration tests always start from a clean and deterministic database state.

---

## Per-Test Integration Cleanup

Integration tests also reset database data after each test.

### Current implementation

```ts
import { afterEach } from "vitest";
import { sequelize } from "#config/database.config.js";

afterEach(async () => {
    await sequelize.truncate({ cascade: true, restartIdentity: true });
});
```

### Purpose

This prevents test pollution and ensures that each integration test runs independently from previous test cases.

---

## Unit Testing Approach

Unit tests should isolate the unit under test and mock dependencies.

### Example: controller test

Controllers are tested by mocking:

- service functions
- response helpers

Example mocked modules:

- `#services/posts.service.js`
- `#helpers/response.helper.js`

### Example behaviors covered

- successful response path
- controlled exception path
- unexpected error path

### Example assertions

- service is called with expected input
- `sendSuccess` is called with expected payload
- `sendError` is called when needed

---

## Integration Testing Approach

Integration tests validate real endpoint behavior through HTTP requests.

### Example stack exercised

- route
- controller
- service

### Example tools

- `createApp()` to create the Express application
- `supertest` to send HTTP requests
- Sequelize models to seed and verify data

### Example behaviors covered

- returns `404` when related tag does not exist
- inserts a post successfully
- returns `404` when a post does not exist
- returns a post successfully by id

---

## Fixtures

Reusable test data should be stored in `tests/fixtures/`.

Examples:

- request DTO fixtures
- model payload fixtures
- reusable domain objects

Benefits:

- reduces duplication
- improves readability
- makes test cases easier to maintain

---

## Aliases in Tests

Tests follow the same alias convention as the main application.

Examples:

```ts
import { createPost } from "#controllers/posts.controller.js";
import { sendSuccess } from "#helpers/response.helper.js";
import { HTTP_STATUSES } from "#utils/constants.utils";
```

This keeps test imports consistent with production code and avoids long relative paths.

---

## Naming Conventions

### Test file naming

Test files should use the `.test.ts` suffix.

Examples:

- `posts.controller.test.ts`
- `posts.integration.test.ts`

### Describe blocks

Use clear and domain-oriented `describe(...)` blocks.

Examples:

- `describe("Posts", ...)`
- `describe("createPost", ...)`
- `describe("Find post by id", ...)`

### Test names

Test descriptions should explain expected behavior.

Examples:

- `Should create a new post and return success response`
- `Return 404 if post id does not exist`

---

## What Unit Tests Should Cover

Unit tests should focus on:

- success paths
- controlled exceptions
- unexpected failures
- mapping and helper behavior
- validation logic
- service orchestration

They should not depend on the database or real HTTP requests.

---

## What Integration Tests Should Cover

Integration tests should focus on:

- request/response behavior
- route-to-database flow
- persistence correctness
- endpoint status codes
- response payload shape

They should validate real application behavior with minimal mocking.

---

## General Testing Rules

- Keep unit and integration tests separated
- Use fixtures for reusable data
- Reset shared state between tests
- Keep tests deterministic
- Avoid unnecessary duplication
- Follow the same import conventions as production code
- Prefer explicit assertions over vague expectations

---

## Coverage Notes

- Coverage output is generated in `.coverage/`
- Coverage artifacts must not be committed
- The `.coverage/` directory should be ignored in `.gitignore`
- Coverage validation in CI/workflows may be added later

---

## Recommended Test Scope by Layer

### Controllers

- mostly unit tests
- integration tests indirectly through endpoints

### Services

- unit tests for business logic
- integration tests when database interaction matters

### Helpers / Validators / Mappers

- unit tests

### Routes / Endpoints

- integration tests

---

## Current Testing Strategy Summary

The current strategy is:

- **Unit tests** for isolated logic with mocked dependencies
- **Integration tests** for endpoint and database validation
- **Dedicated test database setup**
- **Database cleanup after each integration test**
- **Separate Vitest configuration for each testing type**

This approach provides a good balance between speed, reliability, and confidence.

---

## Future Improvements

Possible future improvements include:

- coverage thresholds
- CI workflow checks for coverage percentage
- test command documentation in the main README
- dedicated factory utilities for test data
- authentication integration test helpers
- test execution on pull requests

---

## Source of Truth

Testing behavior is currently defined through:

- `vitest.unit.config.ts`
- `vitest.integration.config.ts`
- integration setup files
- the `tests/` directory structure

If the testing setup changes, this document must be updated accordingly.
