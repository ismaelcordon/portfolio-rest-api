import { ApiErrorCode } from "#types/api.types.js";

export class CustomException extends Error {
    constructor(
        message: string,
        public readonly code: ApiErrorCode,
        public readonly statusCode: number,
    ) {
        super(message);
        this.name = "CustomException";
    }
}
