import { API_ROUTES, HTTP_STATUSES } from "#utils/constants.utils.js";
import request from "supertest";
import { createApp } from "../../src/app.js";
import {
    sendContactDtoWithInvalidEmail,
    sendContactDtoWithNoMessage,
    sendContactDtoWithNoEmail,
    sendContactDtoWithNoName,
    sendContactDto,
} from "../fixtures/contact.fixtures.js";

vi.mock("#config/email.config.js", () => ({
    getTransporter: vi.fn(() => ({
        sendMail: vi.fn().mockResolvedValue({ messageId: "test-123" }),
    })),
}));

const sendContactEndpoint = `${API_ROUTES.BASE}${API_ROUTES.CONTACT.BASE}`;

describe("Contact", () => {
    it("Contact succesfully sent", async () => {
        // Arrange
        const app = createApp();

        // Act
        const res = await request(app)
            .post(sendContactEndpoint)
            .send(sendContactDto);

        console.log("STATUS:", res.status);
        console.log("BODY:", JSON.stringify(res.body, null, 2)); // 👈

        // Assert
        expect(res.status).toBe(HTTP_STATUSES.SUCCESS);
        expect(res.body.message).toBe(
            "Email succesfully sent. Thank you for reaching me out :)",
        );
    });
    it("Contact sends 400 when there's no name provided", async () => {
        // Arrange
        const app = createApp();

        // Act
        const response = await request(app)
            .post(sendContactEndpoint)
            .send(sendContactDtoWithNoName);

        // Assert
        expect(response.status).toBe(HTTP_STATUSES.BAD_REQUEST);
        expect(response.body.message).toBe("Name is required.");
    });
    it("Contact send 400 when there's no email provided", async () => {
        // Arrange
        const app = createApp();

        // Act
        const response = await request(app)
            .post(sendContactEndpoint)
            .send(sendContactDtoWithNoEmail);

        // Assert
        expect(response.status).toBe(HTTP_STATUSES.BAD_REQUEST);
        expect(response.body.message).toBe("Email is required.");
    });
    it("Contact send 400 when email provided is not valid", async () => {
        // Arrange
        const app = createApp();

        // Act
        const response = await request(app)
            .post(sendContactEndpoint)
            .send(sendContactDtoWithInvalidEmail);

        // Assert
        expect(response.status).toBe(HTTP_STATUSES.BAD_REQUEST);
        expect(response.body.message).toBe(
            "Provided email is not valid, check and try again.",
        );
    });
    it("Contact send 400 when description is not provided", async () => {
        // Arrange
        const app = createApp();

        // Act
        const response = await request(app)
            .post(sendContactEndpoint)
            .send(sendContactDtoWithNoMessage);

        // Assert
        expect(response.status).toBe(HTTP_STATUSES.BAD_REQUEST);
        expect(response.body.message).toBe("Message is required.");
    });
});
