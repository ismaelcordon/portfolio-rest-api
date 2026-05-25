import { PostModel } from "#models/sequelize/post.sequelize.js";
import { PostStatus } from "#types/post.types.js";
import { DEFAULT_POST_TITLE, POSTS_PER_PAGE } from "#utils/constants.utils.js";
import { Op, WhereOptions } from "sequelize";
import { NotFoundException } from "#exceptions/not-found.exception.js";
import {
    toPaginatedPostsResponseDto,
    toPostResponseDto,
} from "../mappers/post.mappers.js";
import {
    checkPostTagById,
    checkPostTagsByIds,
    findFirstTag,
} from "./post-tags.service.js";
import { ConflictException } from "#exceptions/conflict.exception.js";
import { handleServiceError } from "#helpers/error.helper.js";
import { UpdatePostRequestDto } from "#dtos/UpdatePostRequest.dto.js";
import { generateSlug } from "#utils/slug.utils.js";
import { mapPostToPublicDto } from "#mappers/post.public.mapper.js";

export const findAllPosts = async (
    page: number,
    language: string,
    tagId?: number,
    searchQuery?: string,
    isAdmin: boolean = false,
) => {
    try {
        if (tagId) {
            const tag = await checkPostTagById(tagId);

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

        const tagIds = [
            ...new Set(
                rows
                    .map((post) => post.tagId)
                    .filter((id): id is number => id != null),
            ),
        ];
        const tags = (await checkPostTagsByIds(tagIds)) ?? [];
        const tagsMap = new Map(tags.map((tag) => [tag.tagId, tag]));

        const posts = rows.map((post) =>
            isAdmin
                ? toPostResponseDto(post, tagsMap.get(post.tagId) ?? null)
                : mapPostToPublicDto(post, language, tagsMap.get(post.tagId)!),
        );

        return toPaginatedPostsResponseDto(posts, count, page);
    } catch (error) {
        return handleServiceError(error);
    }
};

export const findPostById = async (postId: number) => {
    try {
        console.log(`POST ID RECIBIDA: ${postId}`);

        const post = await PostModel.findByPk(postId);

        if (!post) {
            throw new NotFoundException(`Post with id ${postId} not found`);
        }

        const tag = await checkPostTagById(post.tagId);

        return toPostResponseDto(post, tag);
    } catch (error) {
        return handleServiceError(error);
    }
};

export const findPostBySlug = async (slug: string, language: string) => {
    try {
        const post = await PostModel.findOne({
            where: {
                slug: slug,
            },
        });

        if (!post) {
            throw new NotFoundException(
                `Post with slug: "${slug}" does not found`,
            );
        }

        const tag = await checkPostTagById(post.tagId);

        return mapPostToPublicDto(post, language, tag);
    } catch (error) {
        return handleServiceError(error);
    }
};

export const insertNewPost = async () => {
    try {
        const firstTag = await findFirstTag();

        const newPost = await PostModel.create({
            title: DEFAULT_POST_TITLE,
            description: "",
            content: "",
            readingTime: 1,
            status: PostStatus.DRAFT,
            tagId: firstTag?.tagId,
        });

        return toPostResponseDto(newPost, firstTag);
    } catch (error) {
        return handleServiceError(error);
    }
};

export const updatePostVisibility = async (postId: number) => {
    try {
        const post = await PostModel.findByPk(postId);

        if (!post) {
            throw new NotFoundException(`Post with id ${postId} not found`);
        }

        if (
            post.status === PostStatus.SCHEDULED ||
            post.status === PostStatus.DRAFT
        ) {
            throw new ConflictException(
                `Post with id ${postId} cannot be hidden. Post needs to be published`,
            );
        }

        const status =
            post.status === PostStatus.HIDDEN
                ? PostStatus.PUBLISHED
                : PostStatus.HIDDEN;

        await post.update({ status: status });
    } catch (error) {
        return handleServiceError(error);
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
        return handleServiceError(error);
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
            slug: generateSlug(post.title),
            status: PostStatus.PUBLISHED,
            publishedAt: new Date(),
        });
    } catch (error) {
        return handleServiceError(error);
    }
};

export const updatePostToScheduled = async (
    postId: number,
    scheduledAt: string,
) => {
    try {
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
        return handleServiceError(error);
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
        return handleServiceError(error);
    }
};

export const updatePostEditableFieldsAndOptionallyPublish = async (
    postId: number,
    updatePostRequestDto: UpdatePostRequestDto,
    publishNow: boolean = false,
) => {
    try {
        console.log(
            `updatePostRequestDto: ${JSON.stringify(updatePostRequestDto)}`,
        );

        const post = await PostModel.findByPk(postId);

        if (!post) {
            throw new NotFoundException(`Post with id ${postId} not found`);
        }

        await checkPostTagById(updatePostRequestDto.tagId);

        await post.update({
            title: updatePostRequestDto.title,
            titleEs: updatePostRequestDto.titleEs,
            description: updatePostRequestDto.description,
            descriptionEs: updatePostRequestDto.descriptionEs,
            content: updatePostRequestDto.content,
            contentEs: updatePostRequestDto.contentEs,
            readingTime: updatePostRequestDto.readingTime,
            status: publishNow ? PostStatus.PUBLISHED : post.status,
            publishedAt: publishNow ? new Date() : post.publishedAt,
            slug: publishNow
                ? generateSlug(updatePostRequestDto.title)
                : post.slug,
            tagId: updatePostRequestDto.tagId,
        });
    } catch (error) {
        return handleServiceError(error);
    }
};
