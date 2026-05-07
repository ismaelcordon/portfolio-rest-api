import { NextFunction, Request, Response } from "express";
import { sendError } from "#helpers/response.helper.js";
import { HTTP_STATUSES } from "#utils/constants.utils.js";

export const apiKeyMiddleware = (required = false) => {
    return (req: Request, res: Response, next: NextFunction) => {
        const apiKey = req.headers["x-api-key"];
        const isValid = apiKey === process.env.API_KEY;

        if (required && !isValid) {
            return sendError(
                res,
                "Unauthorized",
                "UNAUTHORIZED",
                null,
                HTTP_STATUSES.UNAUTHORIZED,
            );
        }

        res.locals.isAdmin = isValid;
        next();
    };
};
