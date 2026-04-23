export type ApiErrorCode =
    | "INVALID_CREDENTIALS"
    | "EMAIL_ALREADY_EXISTS"
    | "ACCOUNT_LOCKED"
    | "VALIDATION_ERROR"
    | "NOT_FOUND"
    | "FORBIDDEN"
    | "BAD_REQUEST"
    | "INTERNAL_SERVER_ERROR"
    | "UNKNOWN_ERROR";

export interface SuccessResponse<T = null> {
    message: string;
    data: T;
}

export interface ErrorResponse<T = null> {
    message: string;
    code: ApiErrorCode;
    data: T | null;
}
