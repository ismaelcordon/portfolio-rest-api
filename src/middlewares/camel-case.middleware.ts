import camelcaseKeys from "camelcase-keys";
import { NextFunction, Request, Response } from "express";

export const camelCaseMiddleware = (
    req: Request,
    _res: Response,
    next: NextFunction,
) => {
    if (req.body && typeof req.body === "object") {
        req.body = camelcaseKeys(req.body, { deep: true });
    }
    next();
};
