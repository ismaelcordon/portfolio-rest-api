import { CreatePostResponseDto } from "#dtos/Post.dto.js";
import { PostModel } from "#models/sequelize/post.sequelize.js";
import { TagModel } from "#models/sequelize/post-tag.sequelize.js";

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
