import { describe, it, expect, vi, beforeEach } from "vitest";
import fs from "fs";
import path from "path";
import { findCvPdfByLanguage, resolveLang } from "#services/cv.service.js";
import { NotFoundException } from "#exceptions/not-found.exception.js";
import { InternalServerException } from "#exceptions/internal-server.exception.js";
import { CV_FILENAMES } from "#utils/constants.utils.js";

vi.mock("fs", () => {
    return {
        default: {
            existsSync: vi.fn(),
        },
    };
});

describe("cv.service", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe("resolveLang", () => {
        it("Should return en by default when accept-language is unsupported", () => {
            // Act
            const result = resolveLang("fr");

            // Assert
            expect(result).toBe("en");
        });
    });

    describe("findCvPdfByLanguage", () => {
        it("Should return Spanish CV path when accept-language is es", async () => {
            // Arrange
            vi.mocked(fs.existsSync).mockReturnValue(true);

            // Act
            const result = await findCvPdfByLanguage("es");

            // Assert
            const expectedPath = path.resolve(
                process.cwd(),
                "assets",
                CV_FILENAMES.es,
            );

            expect(fs.existsSync).toHaveBeenCalledWith(expectedPath);
            expect(result).toBe(expectedPath);
        });

        it("Should return English CV path when accept-language is en", async () => {
            // Arrange
            vi.mocked(fs.existsSync).mockReturnValue(true);

            // Act
            const result = await findCvPdfByLanguage("en");

            // Assert
            const expectedPath = path.resolve(
                process.cwd(),
                "assets",
                CV_FILENAMES.en,
            );

            expect(fs.existsSync).toHaveBeenCalledWith(expectedPath);
            expect(result).toBe(expectedPath);
        });

        it("Should return English CV path by default when accept-language is unsupported", async () => {
            // Arrange
            vi.mocked(fs.existsSync).mockReturnValue(true);

            // Act
            const result = await findCvPdfByLanguage("fr");

            // Assert
            const expectedPath = path.resolve(
                process.cwd(),
                "assets",
                CV_FILENAMES.en,
            );

            expect(fs.existsSync).toHaveBeenCalledWith(expectedPath);
            expect(result).toBe(expectedPath);
        });

        it("Should return English CV path by default when accept-language is undefined", async () => {
            // Arrange
            vi.mocked(fs.existsSync).mockReturnValue(true);

            // Act
            const result = await findCvPdfByLanguage(undefined);

            // Assert
            const expectedPath = path.resolve(
                process.cwd(),
                "assets",
                CV_FILENAMES.en,
            );

            expect(fs.existsSync).toHaveBeenCalledWith(expectedPath);
            expect(result).toBe(expectedPath);
        });

        it("Should throw NotFoundException when Spanish CV file does not exist", async () => {
            // Arrange
            vi.mocked(fs.existsSync).mockReturnValue(false);

            // Act
            const result = findCvPdfByLanguage("es");

            // Assert
            await expect(result).rejects.toThrow(NotFoundException);
            await expect(result).rejects.toThrow(
                `CV file not found: ${CV_FILENAMES.es}`,
            );
        });

        it("Should throw NotFoundException when English CV file does not exist", async () => {
            // Arrange
            vi.mocked(fs.existsSync).mockReturnValue(false);

            // Act
            const result = findCvPdfByLanguage("en");

            // Assert
            await expect(result).rejects.toThrow(NotFoundException);
            await expect(result).rejects.toThrow(
                `CV file not found: ${CV_FILENAMES.en}`,
            );
        });

        it("Should throw InternalServerException when an unexpected error occurs", async () => {
            // Arrange
            vi.mocked(fs.existsSync).mockImplementation(() => {
                throw new Error("Filesystem crashed");
            });

            // Act
            const result = findCvPdfByLanguage("es");

            // Assert
            await expect(result).rejects.toThrow(InternalServerException);
            await expect(result).rejects.toThrow("Filesystem crashed");
        });
    });
});
