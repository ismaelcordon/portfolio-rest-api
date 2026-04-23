import express, { type Express } from "express";
import { API_ROUTES } from "./utils/constants.utils";
import apiRouter from "./routes/api.routes";
import { snakeCaseResponseMiddleware } from "#middlewares/snake-case-response.middleware.js";

export function createApp(): Express {
    const app = express();

    app.use(express.json());
    app.use(snakeCaseResponseMiddleware);
    app.use(API_ROUTES.BASE, apiRouter);

    return app;
}
