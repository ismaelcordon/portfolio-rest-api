import { Test } from "supertest";

export const withApiKey = (request: Test): Test => {
    return request.set("x-api-key", process.env.API_KEY ?? "test-api-key");
};
