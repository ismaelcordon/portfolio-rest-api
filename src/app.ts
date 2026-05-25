import express, { type Express } from "express";
import cors from "cors";
import { API_ROUTES } from "./utils/constants.utils.js";
import apiRouter from "./routes/api.routes.js";
import { snakeCaseResponseMiddleware } from "#middlewares/snake-case-response.middleware.js";

export function createApp(): Express {
    const app = express();

    app.use(express.json({ limit: "20mb" }));
    app.use(cors());
    app.use(snakeCaseResponseMiddleware);
    app.use(API_ROUTES.BASE, apiRouter);

    return app;
}
