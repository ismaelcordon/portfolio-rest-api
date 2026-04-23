export type ApiErrorCode =
    | "INVALID_CREDENTIALS"
    | "EMAIL_ALREADY_EXISTS"
    | "ACCOUNT_LOCKED"
    | "VALIDATION_ERROR"
    | "NOT_FOUND"
    | "FORBIDDEN"
    | "INTERNAL_ERROR";

export interface SuccessResponse<T = null> {
    message: string;
    data: T;
}

export interface ErrorResponse<T = null> {
    message: string;
    code: ApiErrorCode;
    data: T | null;
}
