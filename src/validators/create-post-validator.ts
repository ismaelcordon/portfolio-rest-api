import { body } from "express-validator";

export const updatePostValidator = [
    body("title")
        .isString()
        .notEmpty()
        .withMessage("Title is required and must be a string"),
    body("description")
        .isString()
        .notEmpty()
        .withMessage("Description is required and must be a string"),
    body("content")
        .isString()
        .notEmpty()
        .withMessage("Content is required and must be a string"),
    body("reading_time")
        .isInt({ gt: 0 })
        .withMessage("Reading time is required and must be a positive integer"),
    body("tag_id")
        .isInt({ gt: 0 })
        .withMessage("Tag id is required and must be a positive integer"),
];
