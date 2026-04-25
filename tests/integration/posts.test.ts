import { API_ROUTES, HTTP_STATUSES } from "#utils/constants.utils.js";
import { describe, expect, it } from "vitest";
import { createApp } from "../../src/app";
import request from "supertest";
import {
    createPostDto,
    createPostDtoWithInvalidTagId,
    createTagDTO,
    postModelArray,
} from "../fixtures/post.fixtures";
import { PostModel } from "#models/sequelize/post.sequelize.js";
import { TagModel } from "#models/sequelize/post-tag.sequelize.js";
import { PostStatus } from "#types/post.types.js";

const createNewPostEndpoint = `${API_ROUTES.BASE}${API_ROUTES.POSTS.BASE}`;
const findPostByIdEndpoint = `${API_ROUTES.BASE}${API_ROUTES.POSTS.BASE}${API_ROUTES.POSTS.BY_ID}`;
const findAllPostsEndpoint = `${API_ROUTES.BASE}${API_ROUTES.POSTS.BASE}`;

describe("Posts", () => {
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

        it("Should return paginated posts successfully with published status when does not have an api key", async () => {
            // Arrange
            await TagModel.create(createTagDTO);

            await Promise.all(postModelArray());

            const app = createApp();

            // Act
            const response = await request(app).get(createNewPostEndpoint);

            // Assert
            expect(response.status).toBe(HTTP_STATUSES.SUCCESS);
            expect(response.body.data.data).toHaveLength(2);
            response.body.data.data.forEach((post: { status: string }) => {
                expect(post.status).toBe(PostStatus.PUBLISHED);
            });
            expect(response.body.data.meta.total_pages).toBe(1);
            expect(response.body.data.meta.has_next_page).toBe(false);
            expect(response.body.data.meta.has_prev_page).toBe(false);
        });

        it("Should return all paginated posts successfully when have an api key", async () => {
            // Arrange
            await TagModel.create(createTagDTO);

            await Promise.all(postModelArray());

            const app = createApp();

            // Act
            const response = await request(app)
                .get(createNewPostEndpoint)
                .set("x-api-key", process.env.API_KEY ?? "test-api-key");

            // Assert
            expect(response.status).toBe(HTTP_STATUSES.SUCCESS);
            expect(response.body.data.data).toHaveLength(4);
            expect(response.body.data.meta.total_pages).toBe(1);
            expect(response.body.data.meta.has_next_page).toBe(false);
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
            const response = await request(app)
                .get(`${createNewPostEndpoint}?tag_id=${tag1.tagId}`)
                .set("x-api-key", process.env.API_KEY ?? "test-api-key");

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
            const response = await request(app)
                .get(`${createNewPostEndpoint}?page=2`)
                .set("x-api-key", process.env.API_KEY ?? "test-api-key");

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

        it("Returns post successfully when post status is not published and api key is provided", async () => {
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
            const response = await request(app)
                .get(
                    findPostByIdEndpoint.replace(
                        ":id",
                        String(createdPost.postId),
                    ),
                )
                .set("x-api-key", process.env.API_KEY ?? "test-api-key");

            // Assert
            expect(response.status).toBe(HTTP_STATUSES.SUCCESS);
            expect(response.body.data.post_id).toBe(createdPost.postId);
        });

        it("Returns post successfully when post status is published and api key is not provided", async () => {
            // Arrange
            await TagModel.create(createTagDTO);

            const createdPost = await PostModel.create({
                title: createPostDto.title,
                description: createPostDto.description,
                content: createPostDto.content,
                readingTime: createPostDto.reading_time,
                status: PostStatus.PUBLISHED,
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

        it("Returns 404 when post status is not published and api key is not provided", async () => {
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
            expect(response.status).toBe(HTTP_STATUSES.NOT_FOUND);
        });
    });

    const hidePostEndpoint = `${API_ROUTES.BASE}${API_ROUTES.POSTS.BASE}${API_ROUTES.POSTS.HIDE_BY_ID}`;
    const deletePostEndpoint = `${API_ROUTES.BASE}${API_ROUTES.POSTS.BASE}${API_ROUTES.POSTS.BY_ID}`;

    describe("Hide post", () => {
        it("Should return 401 if api key is not provided", async () => {
            // Arrange
            const app = createApp();

            // Act
            const response = await request(app).patch(
                hidePostEndpoint.replace(":id", "999"),
            );
            // Assert
            expect(response.status).toBe(HTTP_STATUSES.UNAUTHORIZED);
        });

        it("Should return 404 if post does not exist", async () => {
            // Arrange
            const app = createApp();

            // Act
            const response = await request(app)
                .patch(hidePostEndpoint.replace(":id", "999"))
                .set("x-api-key", process.env.API_KEY ?? "test-api-key");

            // Assert
            expect(response.status).toBe(HTTP_STATUSES.NOT_FOUND);
        });

        it("Should return 409 if post is already hidden", async () => {
            // Arrange
            await TagModel.create(createTagDTO);
            const post = await PostModel.create({
                title: createPostDto.title,
                description: createPostDto.description,
                content: createPostDto.content,
                readingTime: createPostDto.reading_time,
                status: PostStatus.HIDDEN,
                tagId: 1,
            });

            const app = createApp();

            // Act
            const response = await request(app)
                .patch(hidePostEndpoint.replace(":id", String(post.postId)))
                .set("x-api-key", process.env.API_KEY ?? "test-api-key");

            // Assert
            expect(response.status).toBe(HTTP_STATUSES.CONFLICT);
        });

        it("Should hide a post successfully", async () => {
            // Arrange
            await TagModel.create(createTagDTO);
            const post = await PostModel.create({
                title: createPostDto.title,
                description: createPostDto.description,
                content: createPostDto.content,
                readingTime: createPostDto.reading_time,
                status: PostStatus.DRAFT,
                tagId: 1,
            });

            const app = createApp();

            // Act
            const response = await request(app)
                .patch(hidePostEndpoint.replace(":id", String(post.postId)))
                .set("x-api-key", process.env.API_KEY ?? "test-api-key");

            const updatedPost = await PostModel.findByPk(post.postId);

            // Assert
            expect(response.status).toBe(HTTP_STATUSES.SUCCESS);
            expect(updatedPost?.status).toBe(PostStatus.HIDDEN);
        });
    });

    describe("Delete post", () => {
        it("Should return 401 if api key is not provided", async () => {
            // Arrange
            const app = createApp();

            // Act
            const response = await request(app).delete(
                deletePostEndpoint.replace(":id", "999"),
            );
            // Assert
            expect(response.status).toBe(HTTP_STATUSES.UNAUTHORIZED);
        });

        it("Should return 404 if post does not exist", async () => {
            // Arrange
            const app = createApp();

            // Act
            const response = await request(app)
                .delete(deletePostEndpoint.replace(":id", "999"))
                .set("x-api-key", process.env.API_KEY ?? "test-api-key");
            // Assert
            expect(response.status).toBe(HTTP_STATUSES.NOT_FOUND);
        });

        it("Should delete a post successfully", async () => {
            // Arrange
            await TagModel.create(createTagDTO);
            const post = await PostModel.create({
                title: createPostDto.title,
                description: createPostDto.description,
                content: createPostDto.content,
                readingTime: createPostDto.reading_time,
                status: PostStatus.DRAFT,
                tagId: 1,
            });

            const app = createApp();

            // Act
            const response = await request(app)
                .delete(deletePostEndpoint.replace(":id", String(post.postId)))
                .set("x-api-key", process.env.API_KEY ?? "test-api-key");

            const deletedPost = await PostModel.findByPk(post.postId);

            // Assert
            expect(response.status).toBe(HTTP_STATUSES.NO_CONTENT);
            expect(deletedPost).toBeNull();
        });
    });
});
