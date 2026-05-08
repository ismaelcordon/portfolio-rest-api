import { sendContactEmail } from "#services/email.service";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { sendContactDto } from "../../fixtures/contact.fixtures";

const sendMailMock = vi.fn();

vi.mock("#config/email.config.js", () => ({
    getTransporter: vi.fn(() => ({
        sendMail: sendMailMock,
    })),
}));

import { getTransporter } from "#config/email.config.js";
import { InternalServerException } from "#exceptions/internal-server.exception";

describe("email.service", () => {
    beforeEach(() => {
        vi.resetAllMocks();

        process.env.CONTACT_TO = "contact@ismaelcordon.com";
        process.env.CONTACT_FROM = "noreply@ismaelcordon.com";
        process.env.SMTP_HOST = "smtp.test.com";
        process.env.SMTP_USER = "user@test.com";
        process.env.SMTP_PASS = "password";
    });

    describe("sendContactEmail", () => {
        it("should send an email with correct params", async () => {
            // Arrange
            // Act
            await sendContactEmail(
                sendContactDto.name,
                sendContactDto.email,
                sendContactDto.message,
            );

            // Assert
            expect(sendMailMock).toHaveBeenCalledOnce();
            expect(sendMailMock).toHaveBeenCalledWith(
                expect.objectContaining({
                    to: process.env.CONTACT_TO,
                    from: process.env.CONTACT_FROM,
                    replyTo: sendContactDto.email,
                    subject: `${sendContactDto.name} contacted you from your website`,
                }),
            );
        });
        it("should throw InternalServerException when CONTACT_TO is missing", async () => {
            // Arrange
            delete process.env.CONTACT_TO;

            // Act
            await expect(
                sendContactEmail(
                    sendContactDto.name,
                    sendContactDto.email,
                    sendContactDto.message,
                ),
            ).rejects.toThrow(InternalServerException);
        });
        it("should throw InternalServerException when sendMail fails", async () => {
            // Arrange
            vi.mocked(getTransporter().sendMail).mockRejectedValue(
                new Error("SMTP connection failed"),
            );

            // Assert
            await expect(
                sendContactEmail(
                    sendContactDto.name,
                    sendContactDto.email,
                    sendContactDto.message,
                ),
            ).rejects.toThrow(InternalServerException);
        });
        it("should use SMTP_USER as fallback when CONTACT_FROM is missing", async () => {
            delete process.env.CONTACT_FROM;

            await sendContactEmail(
                sendContactDto.name,
                sendContactDto.email,
                sendContactDto.message,
            );

            expect(sendMailMock).toHaveBeenCalledWith(
                expect.objectContaining({
                    from: process.env.SMTP_USER,
                }),
            );
        });
    });
});
