import { Request, Response } from "express";
import { sendError, sendSuccess } from "#helpers/response.helper.js";
import { CustomException } from "#exceptions/custom.exception.js";
import {
    destroyPost,
    findAllPosts,
    findPostById,
    findScheduledPosts,
    insertNewPost,
    updatePostVisibility,
    updatePostToPublished,
    updatePostToScheduled,
    findPostBySlug,
} from "#services/posts.service.js";
import { HTTP_STATUSES } from "#utils/constants.utils.js";
import { updatePostEditableFieldsAndOptionallyPublish } from "#services/posts.service.js";
import { UpdatePostRequestDto } from "#dtos/UpdatePostRequest.dto.js";

export const createPost = async (req: Request, res: Response) => {
    try {
        const newPost = await insertNewPost();

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
        console.log(`RETORNANDO ERROR EN EL CONTROLLER`);
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

export const getPostBySlug = async (req: Request, res: Response) => {
    try {
        const { slug } = req.params;
        const language = req.query.language === "es" ? "es" : "en";

        const post = await findPostBySlug(String(slug), language);

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

export const getAllPosts = async (req: Request, res: Response) => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const tagId = req.query.tag_id
            ? parseInt(req.query.tag_id as string)
            : undefined;
        const search = req.query.search ? String(req.query.search) : undefined;
        const language = req.query.language === "es" ? "es" : "en";

        const result = await findAllPosts(
            page,
            language,
            tagId,
            search,
            res.locals.isAdmin,
        );

        return sendSuccess(res, "Posts successfully retrieved", result);
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

export const changePostVisibility = async (req: Request, res: Response) => {
    try {
        const postId = parseInt(req.params.id as string);
        await updatePostVisibility(postId);

        return sendSuccess(res, "Post visibility successfully changed");
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

export const deletePost = async (req: Request, res: Response) => {
    try {
        const postId = parseInt(req.params.id as string);
        await destroyPost(postId);

        return res.status(HTTP_STATUSES.NO_CONTENT).send();
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

export const publishPost = async (req: Request, res: Response) => {
    try {
        const postId = parseInt(req.params.id as string);
        await updatePostToPublished(postId);

        return sendSuccess(res, "Post published successfully");
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

export const schedulePost = async (req: Request, res: Response) => {
    try {
        const postId = parseInt(req.params.id as string);

        await updatePostToScheduled(postId, req.body.scheduledAt);

        return sendSuccess(res, "Post scheduled successfully");
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

export const getScheduledPosts = async (req: Request, res: Response) => {
    try {
        const postIds = await findScheduledPosts();

        return sendSuccess(
            res,
            "Scheduled posts retrieved successfully",
            postIds,
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

export const updatePost = async (req: Request, res: Response) => {
    try {
        const postId = parseInt(req.params.id as string);
        const updatePostRequestDto = req.body as UpdatePostRequestDto;
        const publishNow = req.query.publish === "true";

        await updatePostEditableFieldsAndOptionallyPublish(
            postId,
            updatePostRequestDto,
            publishNow,
        );

        return sendSuccess(res, "Post successfully updated");
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
