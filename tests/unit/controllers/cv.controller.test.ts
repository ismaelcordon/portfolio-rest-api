import { getCvPdf } from "#controllers/cv.controller.js";
import { NotFoundException } from "#exceptions/not-found.exception.js";
import { sendError } from "#helpers/response.helper.js";
import { findCvPdfByLanguage } from "#services/cv.service.js";
import { Request, Response } from "express";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("#services/cv.service.js", () => ({
    findCvPdfByLanguage: vi.fn(),
}));

vi.mock("#helpers/response.helper.js", () => ({
    sendError: vi.fn(),
}));

describe("cv.controller", () => {
    let req: Request;
    let res: Response;

    beforeEach(() => {
        vi.clearAllMocks();

        req = {
            headers: {},
        } as Request;

        res = {
            sendFile: vi.fn(),
        } as unknown as Response;
    });

    describe("getCvPdf", () => {
        it("Should return CV pdf file successfully with accept-language es", async () => {
            // Arrange
            const cvPath =
                "/project/assets/CV_Ismael_Cordón_Domínguez_Spanish.pdf";

            req.headers = {
                "accept-language": "es",
            };

            vi.mocked(findCvPdfByLanguage).mockResolvedValue(cvPath);

            // Act
            await getCvPdf(req, res);

            // Assert
            expect(findCvPdfByLanguage).toHaveBeenCalledWith("es");
            expect(res.sendFile).toHaveBeenCalledWith(cvPath, {
                headers: {
                    "Content-Type": "application/pdf",
                    "Content-Disposition": "inline",
                },
            });
            expect(sendError).not.toHaveBeenCalled();
        });

        it("Should return CV pdf file successfully with accept-language en", async () => {
            // Arrange
            const cvPath =
                "/project/assets/CV_Ismael_Cordón_Domínguez_English.pdf";

            req.headers = {
                "accept-language": "en",
            };

            vi.mocked(findCvPdfByLanguage).mockResolvedValue(cvPath);

            // Act
            await getCvPdf(req, res);

            // Assert
            expect(findCvPdfByLanguage).toHaveBeenCalledWith("en");
            expect(res.sendFile).toHaveBeenCalledWith(cvPath, {
                headers: {
                    "Content-Type": "application/pdf",
                    "Content-Disposition": "inline",
                },
            });
            expect(sendError).not.toHaveBeenCalled();
        });

        it("Should call findCvPdfByLanguage with undefined when accept-language is not provided", async () => {
            // Arrange
            const cvPath =
                "/project/assets/CV_Ismael_Cordón_Domínguez_English.pdf";

            req.headers = {};

            vi.mocked(findCvPdfByLanguage).mockResolvedValue(cvPath);

            // Act
            await getCvPdf(req, res);

            // Assert
            expect(findCvPdfByLanguage).toHaveBeenCalledWith(undefined);
            expect(res.sendFile).toHaveBeenCalledWith(cvPath, {
                headers: {
                    "Content-Type": "application/pdf",
                    "Content-Disposition": "inline",
                },
            });
            expect(sendError).not.toHaveBeenCalled();
        });

        it("Should return controlled error response when service throws CustomException", async () => {
            // Arrange
            req.headers = {
                "accept-language": "es",
            };

            const notFoundException = new NotFoundException(
                "CV file not found: CV_Ismael_Cordón_Domínguez_Spanish.pdf",
            );

            vi.mocked(findCvPdfByLanguage).mockRejectedValue(notFoundException);

            // Act
            await getCvPdf(req, res);

            // Assert
            expect(findCvPdfByLanguage).toHaveBeenCalledWith("es");
            expect(res.sendFile).not.toHaveBeenCalled();
            expect(sendError).toHaveBeenCalledWith(
                res,
                notFoundException.message,
                notFoundException.code,
                null,
                notFoundException.statusCode,
            );
        });

        it("Should return internal server error response when service throws unexpected error", async () => {
            // Arrange
            req.headers = {
                "accept-language": "en",
            };

            vi.mocked(findCvPdfByLanguage).mockRejectedValue(
                new Error("Filesystem crashed"),
            );

            // Act
            await getCvPdf(req, res);

            // Assert
            expect(findCvPdfByLanguage).toHaveBeenCalledWith("en");
            expect(res.sendFile).not.toHaveBeenCalled();
            expect(sendError).toHaveBeenCalledWith(
                res,
                "Unexpected error",
                "UNKNOWN_ERROR",
            );
        });
    });
});
