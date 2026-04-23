# Development Conventions

## Purpose

This document defines the conventions used across the API to ensure consistency, readability, and maintainability.

All contributors should follow these conventions when adding or modifying code.

---

## Naming Conventions

### Files

- Use lowercase with dot notation:
    - `auth.controller.ts`
    - `posts.service.ts`

### Classes / Interfaces / Types

- Use **PascalCase**:
    - `UserModel`
    - `LoginDto`
    - `LoginResponseDto`

### Variables / Functions

- Use **camelCase**:
    - `getPosts`
    - `createUser`

### Constants

- Use **UPPER_SNAKE_CASE**:
    - `HTTP_STATUSES`
    - `API_ROUTES`

---

## Import Conventions

- Always use path aliases with `#`
- Avoid relative imports like `../../../`

### Example

```ts
import { createPost } from "#services/posts.service";
```

---

## Layer Conventions

Each layer has a strict responsibility:

- **routes** → define endpoints only
- **controllers** → handle request/response
- **services** → business logic
- **models** → database structure
- **dtos** → API input/output contracts

### Rules

- Routes must not contain business logic
- Controllers must remain thin
- Services must not depend on Express (`req`, `res`)
- Repositories must not contain business logic

---

## DTO Conventions

- DTOs must live in `src/dtos/`
- DTOs should be grouped by domain

### Naming

- Request DTOs:
    - `CreatePostDto`
    - `LoginDto`

- Response DTOs:
    - `PostResponseDto`
    - `LoginResponseDto`

### Rules

- Do not reuse database models as API payloads
- DTOs define the contract between client and server
- Keep DTOs explicit and minimal

---

## Response Conventions

All responses must use the helper functions:

- `sendSuccess`
- `sendError`

### Rules

- Do not use `res.json()` directly
- Always return a structured response
- Keep messages clear and concise

See: `docs/responses.md`

---

## Error Handling Conventions

- All errors must use a defined `ApiErrorCode`
- Do not return raw or unstructured errors

### Rules

- Use meaningful error codes:
    - `VALIDATION_ERROR`
    - `NOT_FOUND`
    - `FORBIDDEN`

- Avoid exposing internal errors directly
- Use `data` field for additional error details when needed

---

## HTTP Status Code Conventions

- Do not use magic numbers
- Always use `HTTP_STATUSES`

### Source

```text
src/utils/constants.utils.ts
```

### Example

```ts
sendSuccess(res, "Created", data, HTTP_STATUSES.CREATED);
```

---

## Route Constants Convention

API routes must be centralized in a constants object.

### Example

```ts
export const API_ROUTES = {
    BASE: "/api",

    POSTS: {
        BASE: "/posts",
    },
};
```

### Rules

- Do not hardcode route strings in controllers or routes
- Use centralized constants instead
- Keep routes domain-oriented and consistent

---

## HTTP and Route Design Conventions

- Use plural resource names:
    - `/posts`
    - `/users`

- Use standard REST patterns:
    - `GET /posts`
    - `GET /posts/:id`
    - `POST /posts`
    - `PATCH /posts/:id`
    - `DELETE /posts/:id`

- Avoid verbs in routes (except for special cases like auth)

---

## File and Folder Conventions

Each feature should follow the same structure:

```text
posts/
  posts.routes.ts
  posts.controller.ts
  posts.service.ts
  posts.repository.ts
```

DTOs should be placed in:

```text
dtos/posts/
```

---

## Testing Conventions

- Test files should follow a consistent naming pattern
- Tests should be placed in the agreed test location
- Test code should follow the same naming and import conventions as production code

(See `docs/testing.md` for full testing strategy)

---

## General Rules

- Avoid code duplication
- Prefer small, focused functions
- Keep logic in the correct layer
- Use clear and descriptive names
- Follow existing patterns before introducing new ones

---

## Consistency Rule

When in doubt:

> Follow existing patterns already present in the codebase.

Consistency is more important than personal preference.
