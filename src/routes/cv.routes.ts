import { getCvPdf } from "#controllers/cv.controller.js";
import { Router } from "express";

const router = Router();

router.get("/", getCvPdf);

export default router;
