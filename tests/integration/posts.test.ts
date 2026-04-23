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
const findAllPostsEndpoint = `${API_ROUTES.BASE}${API_ROUTES.POSTS.BASE}`;

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

    describe("Find all posts", () => {
        it("Should return 200 with empty data when no posts exist", async () => {
            // Arrange
            const app = createApp();

            // Act
            const response = await request(app).get(createNewPostEndpoint);

            // Assert
            expect(response.status).toBe(HTTP_STATUSES.SUCCESS);
            expect(response.body.data.data).toHaveLength(0);
            expect(response.body.data.meta.total).toBe(0);
        });

        it("Should return paginated posts successfully", async () => {
            // Arrange
            await TagModel.create(createTagDTO);

            await Promise.all(
                Array.from({ length: 25 }, (_, i) =>
                    PostModel.create({
                        title: `Post ${i + 1}`,
                        description: createPostDto.description,
                        content: createPostDto.content,
                        readingTime: createPostDto.reading_time,
                        status: PostStatus.DRAFT,
                        tagId: 1,
                    }),
                ),
            );

            const app = createApp();

            // Act
            const response = await request(app).get(createNewPostEndpoint);

            // Assert
            expect(response.status).toBe(HTTP_STATUSES.SUCCESS);
            expect(response.body.data.data).toHaveLength(20);
            expect(response.body.data.meta.total).toBe(25);
            expect(response.body.data.meta.total_pages).toBe(2);
            expect(response.body.data.meta.has_next_page).toBe(true);
            expect(response.body.data.meta.has_prev_page).toBe(false);
        });

        it("Should return only posts filtered by tagId", async () => {
            // Arrange
            const tag1 = await TagModel.create({ description: "TypeScript" });
            const tag2 = await TagModel.create({ description: "JavaScript" });

            await Promise.all([
                ...Array.from({ length: 5 }, (_, i) =>
                    PostModel.create({
                        title: `TypeScript Post ${i + 1}`,
                        description: createPostDto.description,
                        content: createPostDto.content,
                        readingTime: createPostDto.reading_time,
                        status: PostStatus.DRAFT,
                        tagId: tag1.tagId,
                    }),
                ),
                ...Array.from({ length: 5 }, (_, i) =>
                    PostModel.create({
                        title: `JavaScript Post ${i + 1}`,
                        description: createPostDto.description,
                        content: createPostDto.content,
                        readingTime: createPostDto.reading_time,
                        status: PostStatus.DRAFT,
                        tagId: tag2.tagId,
                    }),
                ),
            ]);

            const app = createApp();

            // Act
            const response = await request(app).get(
                `${createNewPostEndpoint}?tag_id=${tag1.tagId}`,
            );

            // Assert
            expect(response.status).toBe(HTTP_STATUSES.SUCCESS);
            expect(response.body.data.meta.total).toBe(5);
        });

        it("Should return page 2 correctly", async () => {
            // Arrange
            await TagModel.create(createTagDTO);

            await Promise.all(
                Array.from({ length: 25 }, (_, i) =>
                    PostModel.create({
                        title: `Post ${i + 1}`,
                        description: createPostDto.description,
                        content: createPostDto.content,
                        readingTime: createPostDto.reading_time,
                        status: PostStatus.DRAFT,
                        tagId: 1,
                    }),
                ),
            );

            const app = createApp();

            // Act
            const response = await request(app).get(
                `${createNewPostEndpoint}?page=2`,
            );

            // Assert
            expect(response.status).toBe(HTTP_STATUSES.SUCCESS);
            expect(response.body.data.data).toHaveLength(5);
            expect(response.body.data.meta.page).toBe(2);
            expect(response.body.data.meta.has_next_page).toBe(false);
            expect(response.body.data.meta.has_prev_page).toBe(true);
        });

        it("Should return 400 when page is invalid", async () => {
            // Arrange
            const app = createApp();

            // Act
            const response = await request(app).get(
                `${createNewPostEndpoint}?page=-1`,
            );

            // Assert
            expect(response.status).toBe(HTTP_STATUSES.BAD_REQUEST);
        });

        it("Should return 400 when tagId is invalid", async () => {
            // Arrange
            const app = createApp();

            // Act
            const response = await request(app).get(
                `${createNewPostEndpoint}?tag_id=-1`,
            );

            // Assert
            expect(response.status).toBe(HTTP_STATUSES.BAD_REQUEST);
        });
    });
});
