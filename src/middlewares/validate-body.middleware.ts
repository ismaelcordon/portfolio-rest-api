import { sendError } from "#helpers/response.helper.js";
import { HTTP_STATUSES } from "#utils/constants.utils.js";

import { NextFunction, Request, Response } from "express";
import { validationResult } from "express-validator/lib/validation-result";

export const validateBody = (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        const message = errors.array()[0]?.msg || "Validation error";

        return sendError(
            res,
            message,
            "BAD_REQUEST",
            null,
            HTTP_STATUSES.BAD_REQUEST,
        );
    }

    next();
};
