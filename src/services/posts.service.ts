import { CreatePostRequestDto } from "#dtos/CreatePostRequest.dto.js";
import { InternalServerException } from "#exceptions/internal-server.exception.js";
import { PostModel } from "#models/sequelize/post.sequelize";
import { PostStatus } from "#types/post.types";
import { POSTS_PER_PAGE } from "#utils/constants.utils";
import { Op, WhereOptions } from "sequelize";
import { CustomException } from "../exceptions/custom.exception";
import { NotFoundException } from "../exceptions/not-found.exception";
import {
    toPaginatedPostsResponseDto,
    toPostResponseDto,
} from "../mappers/post.mappers";
import { checkPostTagById, checkPostTagsByIds } from "./post-tags.service";

export const findAllPosts = async (
    page: number,
    tagId?: number,
    searchQuery?: string,
) => {
    try {
        if (tagId) {
            const tag = await checkPostTagById(tagId!);

            if (!tag) {
                throw new NotFoundException(`Tag with id ${tagId} not found`);
            }
        }

        const offset = (page - 1) * POSTS_PER_PAGE;
        const where: WhereOptions = {};

        if (tagId) where.tagId = tagId;
        if (searchQuery) where.title = { [Op.iLike]: `%${searchQuery}%` };

        const { count, rows } = await PostModel.findAndCountAll({
            limit: POSTS_PER_PAGE,
            offset,
            where,
            order: [["publishedAt", "DESC"]],
        });

        const tagIds = [...new Set(rows.map((post) => post.tagId))];
        const tags = await checkPostTagsByIds(tagIds);
        const tagsMap = new Map(tags.map((tag) => [tag.tagId, tag]));

        const posts = rows.map((post) =>
            toPostResponseDto(post, tagsMap.get(post.tagId)!),
        );

        return toPaginatedPostsResponseDto(posts, count, page);
    } catch (error) {
        if (error instanceof CustomException) throw error;
        throw new InternalServerException(
            error instanceof Error ? error.message : "Unexpected error",
        );
    }
};

export const findPostById = async (postId: number) => {
    try {
        const post = await PostModel.findByPk(postId);

        if (!post) {
            throw new NotFoundException(`Post with id ${postId} not found`);
        }

        const tag = await checkPostTagById(post.tagId);

        return toPostResponseDto(post, tag);
    } catch (error) {
        if (error instanceof CustomException) throw error;
        throw new InternalServerException(
            error instanceof Error ? error.message : "Unexpected error",
        );
    }
};

export const insertNewPost = async (postData: CreatePostRequestDto) => {
    try {
        const tag = await checkPostTagById(postData.tagId);

        const newPost = await PostModel.create({
            title: postData.title,
            description: postData.description,
            content: postData.content,
            readingTime: postData.readingTime,
            status: PostStatus.DRAFT,
            tagId: postData.tagId,
        });

        return toPostResponseDto(newPost, tag);
    } catch (error) {
        if (error instanceof CustomException) throw error;
        throw new InternalServerException(
            error instanceof Error ? error.message : "Unexpected error",
        );
    }
};
