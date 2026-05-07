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
import { ConflictException } from "#exceptions/conflict.exception";

export const findAllPosts = async (
    page: number,
    tagId?: number,
    searchQuery?: string,
    isAdmin: boolean = false,
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
        if (!isAdmin) where.status = PostStatus.PUBLISHED;

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

export const findPostById = async (postId: number, isAdmin: boolean) => {
    try {
        const post = await PostModel.findByPk(postId);

        if (!post) {
            throw new NotFoundException(`Post with id ${postId} not found`);
        }

        if (!isAdmin && post.status !== PostStatus.PUBLISHED) {
            throw new NotFoundException(`Post wih id ${postId} not found`);
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

export const updatePostToHidden = async (postId: number) => {
    try {
        const post = await PostModel.findByPk(postId);

        if (!post) {
            throw new NotFoundException(`Post with id ${postId} not found`);
        }

        if (post.status === PostStatus.HIDDEN) {
            throw new ConflictException(
                `Post with id ${postId} is already hidden`,
            );
        }

        await post.update({ status: PostStatus.HIDDEN });
    } catch (error) {
        if (error instanceof CustomException) throw error;
        throw new InternalServerException(
            error instanceof Error ? error.message : "Unexpected error",
        );
    }
};

export const destroyPost = async (postId: number) => {
    try {
        const post = await PostModel.findByPk(postId);

        if (!post) {
            throw new NotFoundException(`Post with id ${postId} not found`);
        }

        await post.destroy();
    } catch (error) {
        if (error instanceof CustomException) throw error;
        throw new InternalServerException(
            error instanceof Error ? error.message : "Unexpected error",
        );
    }
};

export const updatePostToPublished = async (postId: number) => {
    try {
        const post = await PostModel.findByPk(postId);

        if (!post) {
            throw new NotFoundException(`Post with id ${postId} not found`);
        }

        if (post.status === PostStatus.PUBLISHED) {
            throw new ConflictException(
                `Post with id ${postId} is already published`,
            );
        }

        await post.update({
            status: PostStatus.PUBLISHED,
            publishedAt: new Date(),
        });
    } catch (error) {
        if (error instanceof CustomException) throw error;
        throw new InternalServerException(
            error instanceof Error ? error.message : "Unexpected error",
        );
    }
};

export const updatePostToScheduled = async (
    postId: number,
    scheduledAt: string,
) => {
    try {
        console.log(`scheduledAt received: ${scheduledAt}`);
        console.log(`new date: ${new Date(scheduledAt)}`);

        const post = await PostModel.findByPk(postId);

        if (!post) {
            throw new NotFoundException(`Post with id ${postId} not found`);
        }

        if (
            post.status === PostStatus.PUBLISHED ||
            post.status === PostStatus.HIDDEN
        ) {
            throw new ConflictException(
                `Post with id ${postId} cannot be scheduled, it is already published`,
            );
        }

        await post.update({
            status: PostStatus.SCHEDULED,
            scheduledAt: new Date(scheduledAt),
        });
    } catch (error) {
        if (error instanceof CustomException) throw error;
        throw new InternalServerException(
            error instanceof Error ? error.message : "Unexpected error",
        );
    }
};

export const findScheduledPosts = async (): Promise<number[]> => {
    try {
        const posts = await PostModel.findAll({
            where: {
                status: PostStatus.SCHEDULED,
                scheduledAt: { [Op.lte]: new Date() },
            },
            attributes: ["postId"],
        });

        return posts.map((post) => post.postId);
    } catch (error) {
        if (error instanceof CustomException) throw error;
        throw new InternalServerException(
            error instanceof Error ? error.message : "Unexpected error",
        );
    }
};
