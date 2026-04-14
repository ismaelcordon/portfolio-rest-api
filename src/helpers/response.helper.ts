import { Response } from "express";
import { ApiErrorCode, ErrorResponse, SuccessResponse } from "#types/api.types";
import { HTTP_STATUSES } from "#utils/constants.utils.js";

export const sendSuccess = <T = null>(
    res: Response,
    message: string,
    data: T = null as T,
    httpCode = HTTP_STATUSES.SUCCESS,
): void => {
    const body: SuccessResponse<T> = { message, data };
    res.status(httpCode).json(body);
};

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
