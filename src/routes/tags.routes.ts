import { getAllTags } from "#controllers/tags.controller.js";
import { apiKeyMiddleware } from "#middlewares/api-key.middleware.js";
import { validateBody } from "#middlewares/validate-body.middleware.js";
import { Router } from "express";

const router = Router();

router.get("/", apiKeyMiddleware(true), validateBody, getAllTags);

export default router;
