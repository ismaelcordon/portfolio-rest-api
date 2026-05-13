import { body } from "express-validator";

export const updatePostValidator = [
    body("title")
        .notEmpty()
        .withMessage("title is required and must be a string"),
    body("title_es")
        .notEmpty()
        .withMessage("title_es is required and must be a string"),
    body("description")
        .notEmpty()
        .withMessage("description is required and must be a string"),
    body("description_es")
        .notEmpty()
        .withMessage("description_es is required and must be a string"),
    body("content")
        .notEmpty()
        .withMessage("content is required and must be a string"),
    body("content_es")
        .notEmpty()
        .withMessage("content_es is required and must be a string"),
    body("reading_time")
        .isInt({ gt: 0 })
        .withMessage("reading_time is required and must be a positive integer"),
    body("tag_id")
        .isInt({ gt: 0 })
        .withMessage("tag_id is required and must be a positive integer"),
];
