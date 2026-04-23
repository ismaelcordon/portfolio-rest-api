import { API_ROUTES, HTTP_STATUSES } from "#utils/constants.utils";
import { describe, expect, it } from "vitest";
import { createApp } from "../../src/app";
import request from "supertest";
import {
    createPostDto,
    createPostDtoWithInvalidTagId,
    createTagDTO,
} from "../fixtures/post.fixtures";
import { PostModel } from "#models/sequelize/post.sequelize";
import { TagModel } from "#models/sequelize/post-tag.sequelize";
import { PostStatus } from "#types/post.types";

const createNewPostEndpoint = `${API_ROUTES.BASE}${API_ROUTES.POSTS.BASE}`;
const findPostByIdEndpoint = `${API_ROUTES.BASE}${API_ROUTES.POSTS.BASE}${API_ROUTES.POSTS.BY_ID}`;

describe("Posts", () => {
    describe("Insert new post", () => {
        it("Return 404 if tag id does not exist", async () => {
            // Arrange
            await TagModel.create(createTagDTO);
            const app = createApp();

            // Act
            const response = await request(app)
                .post(createNewPostEndpoint)
                .send(createPostDtoWithInvalidTagId);

            // Assert
            expect(response.status).toBe(HTTP_STATUSES.NOT_FOUND);
        });

        it("Inserts successfully", async () => {
            // Arrange
            await TagModel.create(createTagDTO);

            const app = createApp();

            // Act
            const response = await request(app)
                .post(createNewPostEndpoint)
                .send(createPostDto);

            const postDB = await PostModel.findOne({
                where: { title: createPostDto.title },
            });

            // Assert
            expect(response.status).toBe(HTTP_STATUSES.CREATED);
            expect(postDB).not.toBeNull();
        });
    });

    describe("Find post by id", () => {
        it("Return 404 if post id does not exist", async () => {
            // Arrange
            await TagModel.create(createTagDTO);

            const app = createApp();

            // Act
            const response = await request(app).get(
                findPostByIdEndpoint.replace(":id", String(999)),
            );

            // Assert
            expect(response.status).toBe(HTTP_STATUSES.NOT_FOUND);
        });

        it("Returns post successfully", async () => {
            // Arrange
            await TagModel.create(createTagDTO);

            const createdPost = await PostModel.create({
                title: createPostDto.title,
                description: createPostDto.description,
                content: createPostDto.content,
                readingTime: createPostDto.reading_time,
                status: PostStatus.DRAFT,
                tagId: 1,
            });

            const app = createApp();

            // Act
            const response = await request(app).get(
                findPostByIdEndpoint.replace(":id", String(createdPost.postId)),
            );

            // Assert
            expect(response.status).toBe(HTTP_STATUSES.SUCCESS);
            expect(response.body.data.post_id).toBe(createdPost.postId);
        });
    });
});
