import { Request, Response } from "express";
import { sendError, sendSuccess } from "#helpers/response.helper.js";
import { CreatePostRequestDto } from "#dtos/CreatePostRequest.dto.js";
import { CustomException } from "../exceptions/custom.exception";
import { findPostById, insertNewPost } from "#services/posts.service.js";
import { HTTP_STATUSES } from "#utils/constants.utils";

export const createPost = async (req: Request, res: Response) => {
    try {
        const dto = req.body as CreatePostRequestDto;

        const newPost = await insertNewPost(dto);

        sendSuccess(
            res,
            "Post created successfully",
            newPost,
            HTTP_STATUSES.CREATED,
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

export const getPostById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const post = await findPostById(Number(id));

        sendSuccess(res, "Post successfully retrieved", post);
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
