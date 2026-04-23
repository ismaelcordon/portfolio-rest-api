import { CreatePostResponseDto } from "#dtos/Post.dto.js";
import { PostModel } from "#models/sequelize/post.sequelize.js";
import { TagModel } from "#models/sequelize/post-tag.sequelize.js";
import { PaginatedPostResponseDto } from "#dtos/PaginatedPostResponse.dto";
import { POSTS_PER_PAGE } from "#utils/constants.utils";

export const toPostResponseDto = (
    post: PostModel,
    tag: TagModel,
): CreatePostResponseDto => ({
    postId: post.postId,
    title: post.title,
    description: post.description,
    content: post.content,
    readingTime: post.readingTime,
    status: post.status,
    scheduledAt: post.scheduledAt ?? null,
    publishedAt: post.publishedAt ?? null,
    createdAt: post.createdAt,
    updatedAt: post.updatedAt,
    tag: {
        tagId: tag.tagId,
        description: tag.description,
    },
});

export const toPaginatedPostsResponseDto = (
    posts: CreatePostResponseDto[],
    total: number,
    page: number,
): PaginatedPostResponseDto => {
    const totalPages = Math.ceil(total / POSTS_PER_PAGE);

    return {
        data: posts,
        meta: {
            total,
            page,
            totalPages,
            hasNextPage: page < totalPages,
            hasPrevPage: page > 1,
        },
    };
};
