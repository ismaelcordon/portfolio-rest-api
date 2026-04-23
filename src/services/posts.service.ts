import { CreatePostRequestDto } from "#dtos/CreatePostRequest.dto.js";
import { InternalServerException } from "#exceptions/internal-server.exception.js";
import { PostModel } from "#models/sequelize/post.sequelize";
import { PostStatus } from "#types/post.types";
import { CustomException } from "../exceptions/custom.exception";
import { NotFoundException } from "../exceptions/not-found.exception";
import { toPostResponseDto } from "../mappers/post.mappers";
import { checkPostTagById } from "./post-tags.service";

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
