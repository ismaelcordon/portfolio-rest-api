import snakecaseKeys from "snakecase-keys";
import { NextFunction, Request, Response } from "express";

export const snakeCaseResponseMiddleware = (
    _req: Request,
    res: Response,
    next: NextFunction,
) => {
    const originalJson = res.json.bind(res);

    res.json = (body: unknown) => {
        if (body && typeof body === "object") {
            return originalJson(
                snakecaseKeys(body as Record<string, unknown>, { deep: true }),
            );
        }
        return originalJson(body);
    };

    next();
};
