import { body } from "express-validator";

export const schedulePostValidator = [
    body("scheduled_at")
        .notEmpty()
        .withMessage("scheduled_at is required")
        .isISO8601()
        .withMessage("scheduled_at must be a valid ISO 8601 date with timezone")
        .custom((value) => {
            if (new Date(value) <= new Date()) {
                throw new Error("scheduled_at must be in the future");
            }
            return true;
        }),
];
