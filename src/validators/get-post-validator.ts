import { param } from "express-validator";

export const getPostValidator = [
    param("id")
        .notEmpty()
        .withMessage("Post id is required")
        .isInt({ min: 1 })
        .withMessage("id must be a positive integer"),
];
