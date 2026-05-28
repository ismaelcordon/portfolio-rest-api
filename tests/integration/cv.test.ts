import {
    API_ROUTES,
    CV_FILENAMES,
    HTTP_STATUSES,
} from "#utils/constants.utils.js";
import { describe, expect, it } from "vitest";
import { createApp } from "../../src/app.js";
import request from "supertest";
import fs from "fs";
import path from "path";

const getCvEndpoint = `${API_ROUTES.BASE}${API_ROUTES.CV.BASE}`;

const binaryParser = (
    res: any,
    callback: (err: Error | null, body: Buffer) => void,
) => {
    const chunks: Buffer[] = [];

    res.on("data", (chunk: Buffer) => {
        chunks.push(chunk);
    });

    res.on("end", () => {
        callback(null, Buffer.concat(chunks));
    });
};

describe("CV", () => {
    describe("Get CV pdf", () => {
        it("Should return Spanish CV pdf when accept-language is es", async () => {
            // Arrange
            const app = createApp();

            const expectedPdf = fs.readFileSync(
                path.resolve(process.cwd(), "assets", CV_FILENAMES.es),
            );

            // Act
            const response = await request(app)
                .get(getCvEndpoint)
                .set("Accept-Language", "es")
                .buffer()
                .parse(binaryParser);

            // Assert
            expect(response.status).toBe(HTTP_STATUSES.SUCCESS);
            expect(response.headers["content-type"]).toContain(
                "application/pdf",
            );
            expect(response.headers["content-disposition"]).toContain("inline");
            expect(Buffer.compare(response.body, expectedPdf)).toBe(0);
        });

        it("Should return English CV pdf when accept-language is en", async () => {
            // Arrange
            const app = createApp();

            const expectedPdf = fs.readFileSync(
                path.resolve(process.cwd(), "assets", CV_FILENAMES.en),
            );

            // Act
            const response = await request(app)
                .get(getCvEndpoint)
                .set("Accept-Language", "en")
                .buffer()
                .parse(binaryParser);

            // Assert
            expect(response.status).toBe(HTTP_STATUSES.SUCCESS);
            expect(response.headers["content-type"]).toContain(
                "application/pdf",
            );
            expect(response.headers["content-disposition"]).toContain("inline");
            expect(Buffer.compare(response.body, expectedPdf)).toBe(0);
        });

        it("Should return English CV pdf by default when accept-language is not provided", async () => {
            // Arrange
            const app = createApp();

            const expectedPdf = fs.readFileSync(
                path.resolve(process.cwd(), "assets", CV_FILENAMES.en),
            );

            // Act
            const response = await request(app)
                .get(getCvEndpoint)
                .buffer()
                .parse(binaryParser);

            // Assert
            expect(response.status).toBe(HTTP_STATUSES.SUCCESS);
            expect(response.headers["content-type"]).toContain(
                "application/pdf",
            );
            expect(response.headers["content-disposition"]).toContain("inline");
            expect(Buffer.compare(response.body, expectedPdf)).toBe(0);
        });

        it("Should return English CV pdf by default when accept-language is unsupported", async () => {
            // Arrange
            const app = createApp();

            const expectedPdf = fs.readFileSync(
                path.resolve(process.cwd(), "assets", CV_FILENAMES.en),
            );

            // Act
            const response = await request(app)
                .get(getCvEndpoint)
                .set("Accept-Language", "fr")
                .buffer()
                .parse(binaryParser);

            // Assert
            expect(response.status).toBe(HTTP_STATUSES.SUCCESS);
            expect(response.headers["content-type"]).toContain(
                "application/pdf",
            );
            expect(response.headers["content-disposition"]).toContain("inline");
            expect(Buffer.compare(response.body, expectedPdf)).toBe(0);
        });
    });
});
