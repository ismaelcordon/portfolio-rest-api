import { Router } from "express";
import {
    createPost,
    getAllPosts,
    getPostById,
    getScheduledPosts,
    hidePost,
    publishPost,
    schedulePost,
    updatePost,
} from "#controllers/posts.controller.js";
import { validateBody } from "#middlewares/validate-body.middleware.js";
import { updatePostValidator } from "#validators/create-post-validator.js";
import { camelCaseMiddleware } from "#middlewares/camel-case.middleware.js";
import { API_ROUTES } from "#utils/constants.utils.js";
import { getPostValidator } from "#validators/get-post-validator.js";
import { getAllPostsValidator } from "#validators/get-all-posts-validator";
import { deletePost } from "../controllers/posts.controller";
import { apiKeyMiddleware } from "#middlewares/api-key.middleware.js";
import { schedulePostValidator } from "#validators/schedule-post.validator";

const router = Router();

router.post(
    "/",
    apiKeyMiddleware(true),
    validateBody,
    camelCaseMiddleware,
    createPost,
);

router.get(
    API_ROUTES.POSTS.BY_ID,
    apiKeyMiddleware(),
    getPostValidator,
    validateBody,
    getPostById,
);

router.get(
    "/",
    apiKeyMiddleware(),
    getAllPostsValidator,
    validateBody,
    getAllPosts,
);

router.get(
    API_ROUTES.POSTS.SCHEDULED_DUE,
    apiKeyMiddleware(true),
    validateBody,
    getScheduledPosts,
);

router.get(
    "/",
    apiKeyMiddleware(),
    getAllPostsValidator,
    validateBody,
    getAllPosts,
);

router.patch(
    API_ROUTES.POSTS.HIDE_BY_ID,
    apiKeyMiddleware(true),
    validateBody,
    hidePost,
);

router.delete(
    API_ROUTES.POSTS.BY_ID,
    apiKeyMiddleware(true),
    validateBody,
    deletePost,
);

router.patch(
    API_ROUTES.POSTS.PUBLISH_BY_ID,
    apiKeyMiddleware(true),
    validateBody,
    publishPost,
);

router.patch(
    API_ROUTES.POSTS.SCHEDULE_BY_ID,
    apiKeyMiddleware(true),
    schedulePostValidator,
    validateBody,
    camelCaseMiddleware,
    schedulePost,
);

router.put(
    API_ROUTES.POSTS.UPDATE_BY_ID,
    apiKeyMiddleware(true),
    updatePostValidator,
    validateBody,
    camelCaseMiddleware,
    updatePost,
);

export default router;
