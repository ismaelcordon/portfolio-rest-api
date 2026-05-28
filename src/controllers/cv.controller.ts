import { CustomException } from "#exceptions/custom.exception.js";
import { sendError } from "#helpers/response.helper.js";
import { findCvPdfByLanguage } from "#services/cv.service.js";
import { Request, Response } from "express";

export const getCvPdf = async (req: Request, res: Response) => {
    try {
        const acceptLanguage =
            (req.query.lang as string) ?? req.headers["accept-language"];

        const cvPath = await findCvPdfByLanguage(acceptLanguage);

        return res.sendFile(cvPath, {
            headers: {
                "Content-Type": "application/pdf",
                "Content-Disposition": "inline",
            },
        });
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
