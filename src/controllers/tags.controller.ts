import { CustomException } from "#exceptions/custom.exception.js";
import { sendError, sendSuccess } from "#helpers/response.helper.js";
import { findAllTags } from "#services/post-tags.service.js";
import { Request, Response } from "express";

export const getAllTags = async (req: Request, res: Response) => {
    try {
        const tags = await findAllTags();
        return sendSuccess(res, "Tags retrieved successfully", tags);
    } catch (error) {
        if (error instanceof CustomException) {
            return sendError(
                res,
                error.message,
                error.code,
                null,
                error.statusCode,
            );
        }

        return sendError(res, "Unexpected error", "UNKNOWN_ERROR");
    }
};
