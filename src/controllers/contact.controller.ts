import { ContactRequestDto } from "#dtos/ContactRequest.dto.js";
import { CustomException } from "#exceptions/custom.exception.js";
import { sendError, sendSuccess } from "#helpers/response.helper.js";
import { sendContactEmail } from "#services/email.service.js";
import { Request, Response } from "express";

export const sendContact = async (req: Request, res: Response) => {
    try {
        const contactRequestDto = req.body as ContactRequestDto;

        await sendContactEmail(
            contactRequestDto.name,
            contactRequestDto.email,
            contactRequestDto.message,
        );

        return sendSuccess(
            res,
            "Email succesfully sent. Thank you for reaching me out :)",
        );
    } catch (error) {
        if (error instanceof CustomException) {
            return sendError(
                res,
                error.message,
                error.code,
                null,
                error.statusCode,
            );
        }

        return sendError(res, "Unexpected error", "UNKNOWN_ERROR");
    }
};
