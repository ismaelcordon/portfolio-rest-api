import { query } from "express-validator";

export const getAllPostsValidator = [
    query("page")
        .optional()
        .isInt({ min: 1 })
        .withMessage("Page must be a positive integer")
        .toInt(),

    query("tag_id")
        .optional()
        .isInt({ min: 1 })
        .withMessage("Tag id must be a positive integer")
        .toInt(),

    query("search")
        .optional()
        .trim()
        .notEmpty()
        .withMessage("Search cannot be empty"),
];
