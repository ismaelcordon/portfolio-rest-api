import { body } from "express-validator";

export const contactValidator = [
    body("name")
        .notEmpty()
        .withMessage("Name is required.")
        .isString()
        .withMessage("Name must be a string.")
        .bail(),
    body("email")
        .notEmpty()
        .withMessage("Email is required.")
        .isString()
        .withMessage("Email must be a string.")
        .isEmail()
        .withMessage("Provided email is not valid, check and try again.")
        .bail(),
    body("message")
        .notEmpty()
        .withMessage("Message is required.")
        .isString()
        .withMessage("Message must be a string.")
        .bail(),
];
