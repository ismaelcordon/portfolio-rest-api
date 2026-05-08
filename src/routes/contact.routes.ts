import { sendContact } from "#controllers/contact.controller.js";
import { validateBody } from "#middlewares/validate-body.middleware.js";
import { contactValidator } from "#validators/contact.validator.js";
import { Router } from "express";

const router = Router();

router.post("/", contactValidator, validateBody, sendContact);

export default router;
