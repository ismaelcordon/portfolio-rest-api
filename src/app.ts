import express, { type Express } from "express";
import { API_ROUTES } from "./utils/constants.utils";
import apiRouter from "./routes/api.routes";

export function createApp(): Express {
    const app = express();

    app.use(express.json());
    app.use(API_ROUTES.BASE, apiRouter);

    return app;
}
