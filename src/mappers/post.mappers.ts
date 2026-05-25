import { PostDto } from "#dtos/Post.dto.js";
import { PostModel } from "#models/sequelize/post.sequelize.js";
import { TagModel } from "#models/sequelize/post-tag.sequelize.js";
import { PaginatedPostResponseDto } from "#dtos/PaginatedPostResponse.dto.js";
import { POSTS_PER_PAGE } from "#utils/constants.utils.js";

export const toPostResponseDto = (
    post: PostModel,
    tag: TagModel | null | undefined,
): PostDto => ({
    postId: post.postId,
    title: post.title ?? null,
    titleEs: post.titleEs ?? null,
    description: post.description ?? null,
    descriptionEs: post.descriptionEs ?? null,
    content: post.content ?? null,
    contentEs: post.contentEs ?? null,
    slug: post.slug ?? null,
    readingTime: post.readingTime,
    status: post.status,
    scheduledAt: post.scheduledAt ?? null,
    publishedAt: post.publishedAt ?? null,
    createdAt: post.createdAt,
    updatedAt: post.updatedAt,
    tag: tag
        ? {
              tagId: tag.tagId,
              description: tag.description,
          }
        : null,
});

export const toPaginatedPostsResponseDto = <T>(
    posts: T[],
    total: number,
    page: number,
): PaginatedPostResponseDto<T> => {
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
