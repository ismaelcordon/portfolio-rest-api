# API Response Format

## Overview

This API uses a unified response format for both successful and failed requests.

The goal of this approach is to keep responses consistent across all endpoints and make frontend integration easier and more predictable.

The response contract is defined in `src/types/api.types.ts` and used through helper functions in the response utility layer.

---

## Response Helpers

The API exposes two helper functions to standardize responses:

- `sendSuccess(...)`
- `sendError(...)`

These helpers are responsible for building the response body and sending the appropriate HTTP status code.

---

## Success Response

Successful responses follow this structure:

```json
{
    "message": "Operation completed successfully",
    "data": {}
}
```

### Type definition

```ts
export interface SuccessResponse<T = null> {
    message: string;
    data: T;
}
```

### Fields

- `message`: human-readable message describing the result
- `data`: response payload returned by the endpoint

### Example

```json
{
    "message": "Posts fetched successfully",
    "data": [
        {
            "id": "1",
            "title": "My first post",
            "slug": "my-first-post"
        }
    ]
}
```

---

## Error Response

Failed responses follow this structure:

```json
{
    "message": "Validation failed",
    "code": "VALIDATION_ERROR",
    "data": null
}
```

### Type definition

```ts
export interface ErrorResponse<T = null> {
    message: string;
    code: ApiErrorCode;
    data: T | null;
}
```

### Fields

- `message`: human-readable description of the error
- `code`: internal API error code
- `data`: optional extra error details

### Example

```json
{
    "message": "Invalid credentials",
    "code": "INVALID_CREDENTIALS",
    "data": null
}
```

### Validation error example

```json
{
    "message": "Validation failed",
    "code": "VALIDATION_ERROR",
    "data": {
        "email": "Email is required",
        "password": "Password must be at least 8 characters"
    }
}
```

---

## Available Error Codes

The following error codes are currently defined in `src/types/api.types.ts`:

```ts
export type ApiErrorCode =
    | "INVALID_CREDENTIALS"
    | "EMAIL_ALREADY_EXISTS"
    | "ACCOUNT_LOCKED"
    | "VALIDATION_ERROR"
    | "NOT_FOUND"
    | "FORBIDDEN"
    | "INTERNAL_ERROR";
```

### Error code meanings

- `INVALID_CREDENTIALS` → invalid login credentials
- `EMAIL_ALREADY_EXISTS` → attempted to register with an email that already exists
- `ACCOUNT_LOCKED` → account is locked and cannot authenticate
- `VALIDATION_ERROR` → request payload is invalid
- `NOT_FOUND` → requested resource was not found
- `FORBIDDEN` → user does not have permission to perform the action
- `INTERNAL_ERROR` → unexpected server-side failure

---

## HTTP Status Codes

HTTP status codes are not hardcoded across the application.
They are centralized in a constants file to avoid the use of magic numbers.

### Source

```text
src/utils/constants.utils.ts
```

### Definition

```ts
export const HTTP_STATUSES = {
    SUCCESS: 200,
    CREATED: 201,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    UNPROCESSABLE_CONTENT: 422,
    INTERNAL_SERVER_ERROR: 500,
    CONFLICT: 409,
};
```

### Usage

These constants are used when sending responses:

```ts
sendSuccess(res, "Post created", data, HTTP_STATUSES.CREATED);
```

```ts
sendError(
    res,
    "Invalid input",
    "VALIDATION_ERROR",
    null,
    HTTP_STATUSES.BAD_REQUEST,
);
```

### Why this approach

- Avoids hardcoded numeric values (magic numbers)
- Improves readability
- Ensures consistency across the codebase
- Makes future changes easier to manage

---

## Helper Implementation

### `sendSuccess`

```ts
export const sendSuccess = <T = null>(
    res: Response,
    message: string,
    data: T = null as T,
    httpCode = HTTP_STATUSES.SUCCESS,
): void => {
    const body: SuccessResponse<T> = { message, data };
    res.status(httpCode).json(body);
};
```

### Behavior

- Sends a successful HTTP response
- Uses `message` and `data` as the response body
- Defaults to `HTTP_STATUSES.SUCCESS`

---

### `sendError`

```ts
export const sendError = <T = null>(
    res: Response,
    message: string,
    code: ApiErrorCode,
    data: T | null = null,
    httpCode = HTTP_STATUSES.INTERNAL_SERVER_ERROR,
): void => {
    const body: ErrorResponse<T> = { message, code, data };
    res.status(httpCode).json(body);
};
```

### Behavior

- Sends an error HTTP response
- Includes an internal error `code`
- Can optionally include extra error details in `data`
- Defaults to `HTTP_STATUSES.INTERNAL_SERVER_ERROR`

---

## Conventions

- All controllers must use `sendSuccess` or `sendError`
- Response bodies must always follow the documented structure
- `message` should be short and clear
- `code` should only be present in error responses
- `data` may be `null` when there is no payload to return
- Error codes must come from `ApiErrorCode`
- HTTP status codes must be taken from `HTTP_STATUSES`

---

## Source of Truth

The response contract is defined in:

```text
src/types/api.types.ts
```

HTTP status codes are defined in:

```text
src/utils/constants.utils.ts
```

If the response format or status codes change in code, this document must be updated accordingly.
