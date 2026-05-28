import { sendError, sendSuccess } from "#helpers/response.helper.js";
import { Request, Response } from "express";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { sendContactDto } from "../../fixtures/contact.fixtures.js";
import { sendContact } from "#controllers/contact.controller.js";
import { sendContactEmail } from "#services/email.service.js";
import { InternalServerException } from "#exceptions/internal-server.exception.js";

vi.mock("#services/email.service.js", () => ({
    sendContactEmail: vi.fn(),
}));

vi.mock("#helpers/response.helper.js", () => ({
    sendSuccess: vi.fn(),
    sendError: vi.fn(),
}));

describe("contact.controller", () => {
    let req: Request;
    let res: Response;

    beforeEach(() => {
        vi.clearAllMocks();

        req = {
            body: sendContactDto,
        } as Request;

        res = {} as Response;
    });

    describe("sendContact", () => {
        it("should call sendContactEmail with correct params and return success", async () => {
            // Arrange
            vi.mocked(sendContactEmail).mockResolvedValue(undefined as any);

            // Act
            await sendContact(req, res);
            // Assert
            expect(sendContactEmail).toHaveBeenCalledOnce();
            expect(sendContactEmail).toHaveBeenCalledWith(
                sendContactDto.name,
                sendContactDto.email,
                sendContactDto.message,
            );
            expect(sendSuccess).toHaveBeenCalledWith(
                res,
                "Email succesfully sent. Thank you for reaching me out :)",
            );
            expect(sendError).not.toHaveBeenCalled();
        });
        it("should call sendError with CustomException params when service throws CustomException", async () => {
            // Arrange
            const exception = new InternalServerException("SMTP error");
            vi.mocked(sendContactEmail).mockRejectedValue(exception);

            // Act
            await sendContact(req, res);

            // Assert
            expect(sendError).toHaveBeenCalledWith(
                res,
                exception.message,
                exception.code,
                null,
                exception.statusCode,
            );
            expect(sendSuccess).not.toHaveBeenCalled();
        });
        it("should call sendError with UNKNOWN_ERROR when service throws unexpected error", async () => {
            // Arrange
            vi.mocked(sendContactEmail).mockRejectedValue(
                new Error("Unexpected"),
            );

            await sendContact(req, res);

            // Assert
            expect(sendSuccess).not.toHaveBeenCalled();
            expect(sendError).toHaveBeenCalledWith(
                res,
                "Unexpected error",
                "UNKNOWN_ERROR",
            );
        });
    });
});
