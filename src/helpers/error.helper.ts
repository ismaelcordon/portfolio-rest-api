import { CustomException } from "#exceptions/custom.exception.js";
import { InternalServerException } from "#exceptions/internal-server.exception.js";

const getErrorMessage = (error: unknown): string =>
    error instanceof Error ? error.message : "Unexpected error";

export const handleServiceError = (error: unknown): never => {
    if (error instanceof CustomException) throw error;
    throw new InternalServerException(getErrorMessage(error));
};
