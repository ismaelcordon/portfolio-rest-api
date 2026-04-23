import { Router } from "express";
import {
    createPost,
    getAllPosts,
    getPostById,
    hidePost,
} from "#controllers/posts.controller.js";
import { validateBody } from "#middlewares/validate-body.middleware.js";
import { createPostValidator } from "#validators/create-post-validator.js";
import { camelCaseMiddleware } from "#middlewares/camel-case.middleware.js";
import { API_ROUTES } from "#utils/constants.utils.js";
import { getPostValidator } from "#validators/get-post-validator.js";
import { getAllPostsValidator } from "#validators/get-all-posts-validator";
import { deletePost } from "../controllers/posts.controller";

const router = Router();

router.post(
    "/",
    createPostValidator,
    validateBody,
    camelCaseMiddleware,
    createPost,
);

router.get(API_ROUTES.POSTS.BY_ID, getPostValidator, validateBody, getPostById);

router.get("/", getAllPostsValidator, validateBody, getAllPosts);

router.patch(API_ROUTES.POSTS.HIDE_BY_ID, hidePost);

router.delete(API_ROUTES.POSTS.BY_ID, deletePost);

export default router;
