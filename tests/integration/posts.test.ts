import { API_ROUTES, HTTP_STATUSES } from "#utils/constants.utils.js";
import { describe, expect, it } from "vitest";
import { createApp } from "../../src/app";
import request from "supertest";
import {
    createPostDto,
    createTagDTO,
    currentDatePlus3Hours,
    postModelArray,
    updatePostRequestDto,
} from "../fixtures/post.fixtures";
import { PostModel } from "#models/sequelize/post.sequelize.js";
import { TagModel } from "#models/sequelize/post-tag.sequelize.js";
import { PostStatus } from "#types/post.types.js";
import { withApiKey } from "../helpers/with-api-key.helpers";
import { emptyPostDto } from "../fixtures/post.fixtures";

const createNewPostEndpoint = `${API_ROUTES.BASE}${API_ROUTES.POSTS.BASE}`;
const findPostByIdEndpoint = `${API_ROUTES.BASE}${API_ROUTES.POSTS.BASE}${API_ROUTES.POSTS.BY_ID}`;
const findPostBySlugEndpoint = `${API_ROUTES.BASE}${API_ROUTES.POSTS.BASE}${API_ROUTES.POSTS.BY_SLUG}`;
const changeVisibilityEndpoint = `${API_ROUTES.BASE}${API_ROUTES.POSTS.BASE}${API_ROUTES.POSTS.CHANGE_VISIBILITY_BY_ID}`;
const deletePostEndpoint = `${API_ROUTES.BASE}${API_ROUTES.POSTS.BASE}${API_ROUTES.POSTS.BY_ID}`;
const publishPostEndpoint = `${API_ROUTES.BASE}${API_ROUTES.POSTS.BASE}${API_ROUTES.POSTS.PUBLISH_BY_ID}`;
const schedulePostEndpoint = `${API_ROUTES.BASE}${API_ROUTES.POSTS.BASE}${API_ROUTES.POSTS.SCHEDULE_BY_ID}`;
const updatePostEndpoint = `${API_ROUTES.BASE}${API_ROUTES.POSTS.BASE}${API_ROUTES.POSTS.UPDATE_BY_ID}`;

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
            const response = await withApiKey(
                request(app).get(createNewPostEndpoint),
            );

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
            const response = await withApiKey(
                request(app).get(
                    `${createNewPostEndpoint}?tag_id=${tag1.tagId}`,
                ),
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
            const response = await withApiKey(
                request(app).get(`${createNewPostEndpoint}?page=2`),
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
            const response = await withApiKey(
                request(app).get(`${createNewPostEndpoint}?page=-1`),
            );

            // Assert
            expect(response.status).toBe(HTTP_STATUSES.BAD_REQUEST);
        });

        it("Should return 400 when tagId is invalid", async () => {
            // Arrange
            const app = createApp();

            // Act
            const response = await withApiKey(
                request(app).get(`${createNewPostEndpoint}?tag_id=-1`),
            );

            // Assert
            expect(response.status).toBe(HTTP_STATUSES.BAD_REQUEST);
        });
    });

    describe("Insert new post", () => {
        it("Inserts successfully", async () => {
            // Arrange
            await TagModel.create(createTagDTO);

            const app = createApp();

            // Act
            const response = await withApiKey(
                request(app).post(createNewPostEndpoint),
            );

            const postDB = await PostModel.findOne({
                where: { title: emptyPostDto.title },
            });

            // Assert
            expect(response.status).toBe(HTTP_STATUSES.CREATED);
            expect(postDB).not.toBeNull();
        });
    });

    describe("Find post by id", () => {
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
            const response = await withApiKey(
                request(app).get(
                    findPostByIdEndpoint.replace(
                        ":id",
                        String(createdPost.postId),
                    ),
                ),
            );

            // Assert
            expect(response.status).toBe(HTTP_STATUSES.SUCCESS);
            expect(response.body.data.post_id).toBe(createdPost.postId);
        });

        it("Return 401 if api key is not provided", async () => {
            // Arrange
            await TagModel.create(createTagDTO);

            const app = createApp();

            // Act
            const response = await request(app).get(
                findPostByIdEndpoint.replace(":id", String(999)),
            );

            // Assert
            expect(response.status).toBe(HTTP_STATUSES.UNAUTHORIZED);
        });

        it("Return 404 if post id does not exist", async () => {
            // Arrange
            await TagModel.create(createTagDTO);

            const app = createApp();

            // Act
            const response = await withApiKey(
                request(app).get(
                    findPostByIdEndpoint.replace(":id", String(999)),
                ),
            );

            // Assert
            expect(response.status).toBe(HTTP_STATUSES.NOT_FOUND);
        });
    });

    describe("Find post by slug", () => {
        it("Returns post successfully if slug exists", async () => {
            // Arrange
            await TagModel.create(createTagDTO);

            const createdPost = await PostModel.create({
                title: createPostDto.title,
                description: createPostDto.description,
                content: createPostDto.content,
                readingTime: createPostDto.reading_time,
                status: PostStatus.PUBLISHED,
                slug: "without-title",
                tagId: 1,
            });

            const app = createApp();

            // Act
            const response = await request(app).get(
                findPostBySlugEndpoint.replace(
                    ":slug",
                    String(createdPost.slug),
                ),
            );

            // Assert
            expect(response.status).toBe(HTTP_STATUSES.SUCCESS);
            expect(response.body.data.slug).toBe(createdPost.slug);
        });

        it("Return 404 if post slug does not exist", async () => {
            // Arrange
            await TagModel.create(createTagDTO);

            const app = createApp();

            // Act
            const response = await request(app).get(
                findPostBySlugEndpoint.replace(":id", "XXXXXX"),
            );

            // Assert
            expect(response.status).toBe(HTTP_STATUSES.NOT_FOUND);
        });
    });

    describe("Change post visibility", () => {
        it("Should return 401 if api key is not provided", async () => {
            // Arrange
            await TagModel.create(createTagDTO);
            const post = await PostModel.create({
                title: createPostDto.title,
                description: createPostDto.description,
                content: createPostDto.content,
                readingTime: createPostDto.reading_time,
                status: PostStatus.PUBLISHED,
                tagId: 1,
            });

            const app = createApp();

            // Act
            const response = await request(app).patch(
                changeVisibilityEndpoint.replace(":id", String(post.postId)),
            );

            // Assert
            expect(response.status).toBe(HTTP_STATUSES.UNAUTHORIZED);
        });

        it("Should return 404 if post does not exist", async () => {
            // Arrange
            const app = createApp();

            // Act
            const response = await withApiKey(
                request(app).patch(
                    changeVisibilityEndpoint.replace(":id", "999"),
                ),
            );

            // Assert
            expect(response.status).toBe(HTTP_STATUSES.NOT_FOUND);
        });

        it("Should return 409 if post has a status different from hidden or published", async () => {
            // Arrange
            await TagModel.create(createTagDTO);
            const post = await PostModel.create({
                title: createPostDto.title,
                description: createPostDto.description,
                content: createPostDto.content,
                readingTime: createPostDto.reading_time,
                status: PostStatus.SCHEDULED,
                tagId: 1,
            });

            const app = createApp();

            // Act
            const response = await withApiKey(
                request(app).patch(
                    changeVisibilityEndpoint.replace(
                        ":id",
                        String(post.postId),
                    ),
                ),
            );

            // Assert
            expect(response.status).toBe(HTTP_STATUSES.CONFLICT);
        });

        it("Should return 409 if post has scheduled status", async () => {
            // Arrange
            await TagModel.create(createTagDTO);
            const post = await PostModel.create({
                title: createPostDto.title,
                description: createPostDto.description,
                content: createPostDto.content,
                readingTime: createPostDto.reading_time,
                status: PostStatus.SCHEDULED,
                tagId: 1,
            });

            const app = createApp();

            // Act
            const response = await withApiKey(
                request(app).patch(
                    changeVisibilityEndpoint.replace(
                        ":id",
                        String(post.postId),
                    ),
                ),
            );

            // Assert
            expect(response.status).toBe(HTTP_STATUSES.CONFLICT);
        });

        it("Should change post visibility successfully", async () => {
            // Arrange
            await TagModel.create(createTagDTO);
            const post = await PostModel.create({
                title: createPostDto.title,
                description: createPostDto.description,
                content: createPostDto.content,
                readingTime: createPostDto.reading_time,
                status: PostStatus.PUBLISHED,
                tagId: 1,
            });

            const app = createApp();

            // Act
            const response = await withApiKey(
                request(app).patch(
                    changeVisibilityEndpoint.replace(
                        ":id",
                        String(post.postId),
                    ),
                ),
            );

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
            const response = await withApiKey(
                request(app).delete(deletePostEndpoint.replace(":id", "999")),
            );
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
            const response = await withApiKey(
                request(app).delete(
                    deletePostEndpoint.replace(":id", String(post.postId)),
                ),
            );

            const deletedPost = await PostModel.findByPk(post.postId);

            // Assert
            expect(response.status).toBe(HTTP_STATUSES.NO_CONTENT);
            expect(deletedPost).toBeNull();
        });
    });

    describe("Publish post", () => {
        it("Should return 401 when api key is not provided", async () => {
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
            const response = await request(app).patch(
                publishPostEndpoint.replace(":id", String(createdPost.postId)),
            );

            await PostModel.findByPk(createdPost.postId);

            // Assert
            expect(response.status).toBe(HTTP_STATUSES.UNAUTHORIZED);
        });
        it("Should return 404 if post does not exist", async () => {
            // Arrange
            const app = createApp();

            // Act
            const response = await withApiKey(
                request(app).patch(publishPostEndpoint.replace(":id", "999")),
            );

            // Assert
            expect(response.status).toBe(HTTP_STATUSES.NOT_FOUND);
        });

        it("Should return 409 if post is already published", async () => {
            // Arrange
            await TagModel.create(createTagDTO);

            const createdPost = await PostModel.create({
                title: createPostDto.title,
                description: createPostDto.description,
                content: createPostDto.content,
                readingTime: createPostDto.reading_time,
                status: PostStatus.PUBLISHED,
                tagId: 1,
                publishedAt: new Date(),
            });

            const app = createApp();

            // Act
            const response = await withApiKey(
                request(app).patch(
                    publishPostEndpoint.replace(
                        ":id",
                        String(createdPost.postId),
                    ),
                ),
            );

            // Assert
            expect(response.status).toBe(HTTP_STATUSES.CONFLICT);
        });

        it("Should publish a post successfully", async () => {
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
            const response = await withApiKey(
                request(app).patch(
                    publishPostEndpoint.replace(
                        ":id",
                        String(createdPost.postId),
                    ),
                ),
            );

            const postDB = await PostModel.findByPk(createdPost.postId);

            // Assert
            expect(response.status).toBe(HTTP_STATUSES.SUCCESS);
            expect(postDB?.status).toBe(PostStatus.PUBLISHED);
            expect(postDB?.publishedAt).not.toBeNull();
        });
    });

    describe("Schedule post", () => {
        it("Should return 400 if api. key is not provided", async () => {
            // Arrange
            const app = createApp();

            // Act
            const response = await request(app)
                .patch(schedulePostEndpoint.replace(":id", "1"))
                .send({ scheduled_at: currentDatePlus3Hours });

            // Assert
            expect(response.status).toBe(HTTP_STATUSES.UNAUTHORIZED);
        });
        it("Should return 400 when scheduled_at is not provided", async () => {
            // Arrange
            const app = createApp();

            // Act
            const response = await withApiKey(
                request(app)
                    .patch(schedulePostEndpoint.replace(":id", "1"))
                    .send({}),
            );

            // Assert
            expect(response.status).toBe(HTTP_STATUSES.BAD_REQUEST);
        });

        it("Should return 400 when scheduled_at has invalid format", async () => {
            // Arrange
            const app = createApp();

            // Act
            const response = await withApiKey(
                request(app)
                    .patch(schedulePostEndpoint.replace(":id", "1"))
                    .send({ scheduled_at: "not-a-date" }),
            );

            // Assert
            expect(response.status).toBe(HTTP_STATUSES.BAD_REQUEST);
        });

        it("Should return 400 when scheduled_at is in the past", async () => {
            // Arrange
            const app = createApp();

            // Act
            const response = await withApiKey(
                request(app)
                    .patch(schedulePostEndpoint.replace(":id", "1"))
                    .send({ scheduled_at: "2024-01-01T10:00:00+02:00" }),
            );

            // Assert
            expect(response.status).toBe(HTTP_STATUSES.BAD_REQUEST);
        });

        it("Should return 404 when post does not exist", async () => {
            // Arrange
            const app = createApp();

            // Act
            const response = await withApiKey(
                request(app)
                    .patch(schedulePostEndpoint.replace(":id", "999"))
                    .set("x-api-key", process.env.API_KEY ?? "test-api-key")
                    .send({ scheduled_at: currentDatePlus3Hours }),
            );

            // Assert
            expect(response.status).toBe(HTTP_STATUSES.NOT_FOUND);
        });

        it("Should return 409 when post is already published", async () => {
            // Arrange
            await TagModel.create(createTagDTO);

            const createdPost = await PostModel.create({
                title: createPostDto.title,
                description: createPostDto.description,
                content: createPostDto.content,
                readingTime: createPostDto.reading_time,
                status: PostStatus.PUBLISHED,
                tagId: 1,
                publishedAt: new Date(),
            });

            const app = createApp();

            // Act
            const response = await withApiKey(
                request(app)
                    .patch(
                        schedulePostEndpoint.replace(
                            ":id",
                            String(createdPost.postId),
                        ),
                    )
                    .send({ scheduled_at: currentDatePlus3Hours }),
            );

            // Assert
            expect(response.status).toBe(HTTP_STATUSES.CONFLICT);
        });

        it("Should return 409 when post is hidden", async () => {
            // Arrange
            await TagModel.create(createTagDTO);

            const createdPost = await PostModel.create({
                title: createPostDto.title,
                description: createPostDto.description,
                content: createPostDto.content,
                readingTime: createPostDto.reading_time,
                status: PostStatus.HIDDEN,
                tagId: 1,
            });

            const app = createApp();

            // Act
            const response = await withApiKey(
                request(app)
                    .patch(
                        schedulePostEndpoint.replace(
                            ":id",
                            String(createdPost.postId),
                        ),
                    )
                    .send({ scheduled_at: currentDatePlus3Hours }),
            );

            // Assert
            expect(response.status).toBe(HTTP_STATUSES.CONFLICT);
        });

        it("Should schedule a post successfully", async () => {
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
            const response = await withApiKey(
                request(app)
                    .patch(
                        schedulePostEndpoint.replace(
                            ":id",
                            String(createdPost.postId),
                        ),
                    )
                    .send({ scheduled_at: currentDatePlus3Hours }),
            );

            const postDB = await PostModel.findByPk(createdPost.postId);

            // Assert
            expect(response.status).toBe(HTTP_STATUSES.SUCCESS);
            expect(postDB?.status).toBe(PostStatus.SCHEDULED);
            expect(postDB?.scheduledAt).not.toBeNull();
        });
    });

    describe("UpdatePost", async () => {
        it("Should return 400 when title is not provided", async () => {
            // Arrange
            const app = createApp();

            const invalidBody = {
                ...updatePostRequestDto,
                title: undefined,
            };

            // Act
            const response = await withApiKey(
                request(app)
                    .put(updatePostEndpoint.replace(":id", "1"))
                    .send(invalidBody),
            );

            // Assert
            expect(response.status).toBe(HTTP_STATUSES.BAD_REQUEST);
        });

        it("Should return 400 when title_es is not provided", async () => {
            // Arrange
            const app = createApp();

            const invalidBody = {
                ...updatePostRequestDto,
                title_es: undefined,
            };

            // Act
            const response = await withApiKey(
                request(app)
                    .put(updatePostEndpoint.replace(":id", "1"))
                    .send(invalidBody),
            );

            // Assert
            expect(response.status).toBe(HTTP_STATUSES.BAD_REQUEST);
        });

        it("Should return 400 when description is not provided", async () => {
            // Arrange
            const app = createApp();

            const invalidBody = {
                ...updatePostRequestDto,
                description: undefined,
            };

            // Act
            const response = await withApiKey(
                request(app)
                    .put(updatePostEndpoint.replace(":id", "1"))
                    .send(invalidBody),
            );

            // Assert
            expect(response.status).toBe(HTTP_STATUSES.BAD_REQUEST);
        });

        it("Should return 400 when description_es is not provided", async () => {
            // Arrange
            const app = createApp();

            const invalidBody = {
                ...updatePostRequestDto,
                description_es: undefined,
            };

            // Act
            const response = await withApiKey(
                request(app)
                    .put(updatePostEndpoint.replace(":id", "1"))
                    .send(invalidBody),
            );

            // Assert
            expect(response.status).toBe(HTTP_STATUSES.BAD_REQUEST);
        });

        it("Should return 400 when content is not provided", async () => {
            // Arrange
            const app = createApp();

            const invalidBody = {
                ...updatePostRequestDto,
                content: undefined,
            };

            // Act
            const response = await withApiKey(
                request(app)
                    .put(updatePostEndpoint.replace(":id", "1"))
                    .send(invalidBody),
            );

            // Assert
            expect(response.status).toBe(HTTP_STATUSES.BAD_REQUEST);
        });

        it("Should return 400 when content_es is not provided", async () => {
            // Arrange
            const app = createApp();

            const invalidBody = {
                ...updatePostRequestDto,
                content_es: undefined,
            };

            // Act
            const response = await withApiKey(
                request(app)
                    .put(updatePostEndpoint.replace(":id", "1"))
                    .send(invalidBody),
            );

            // Assert
            expect(response.status).toBe(HTTP_STATUSES.BAD_REQUEST);
        });

        it("Should return 400 when reading_time is not provided", async () => {
            // Arrange
            const app = createApp();

            const invalidBody = {
                ...updatePostRequestDto,
                reading_time: undefined,
            };

            // Act
            const response = await withApiKey(
                request(app)
                    .put(updatePostEndpoint.replace(":id", "1"))
                    .send(invalidBody),
            );

            // Assert
            expect(response.status).toBe(HTTP_STATUSES.BAD_REQUEST);
        });

        it("Should return 400 when tag_id is not provided", async () => {
            // Arrange
            const app = createApp();

            const invalidBody = {
                ...updatePostRequestDto,
                tag_id: undefined,
            };

            // Act
            const response = await withApiKey(
                request(app)
                    .put(updatePostEndpoint.replace(":id", "1"))
                    .send(invalidBody),
            );

            // Assert
            expect(response.status).toBe(HTTP_STATUSES.BAD_REQUEST);
        });

        it("Should return 400 when reading_time is invalid", async () => {
            // Arrange
            const app = createApp();

            const invalidBody = {
                ...updatePostRequestDto,
                reading_time: -1,
            };

            // Act
            const response = await withApiKey(
                request(app)
                    .put(updatePostEndpoint.replace(":id", "1"))
                    .send(invalidBody),
            );

            // Assert
            expect(response.status).toBe(HTTP_STATUSES.BAD_REQUEST);
        });

        it("Should return 400 when tag_id is invalid", async () => {
            // Arrange
            const app = createApp();

            const invalidBody = {
                ...updatePostRequestDto,
                tag_id: -1,
            };

            // Act
            const response = await withApiKey(
                request(app)
                    .put(updatePostEndpoint.replace(":id", "1"))
                    .send(invalidBody),
            );

            // Assert
            expect(response.status).toBe(HTTP_STATUSES.BAD_REQUEST);
        });

        it("Should update a post successfully", async () => {
            // Arrange
            await TagModel.create(createTagDTO);

            const scheduledAt = new Date("2026-05-01T12:00:00+02:00");

            const createdPost = await PostModel.create({
                title: createPostDto.title,
                titleEs: createPostDto.title_es,
                description: createPostDto.description,
                descriptionEs: createPostDto.description_es,
                content: createPostDto.content,
                contentEs: createPostDto.content_es,
                readingTime: createPostDto.reading_time,
                status: PostStatus.SCHEDULED,
                tagId: 1,
                scheduledAt,
            });

            const app = createApp();

            // Act
            const response = await withApiKey(
                request(app)
                    .put(
                        updatePostEndpoint.replace(
                            ":id",
                            String(createdPost.postId),
                        ),
                    )
                    .send(updatePostRequestDto),
            );

            const postDB = await PostModel.findByPk(createdPost.postId);

            // Assert
            expect(response.status).toBe(HTTP_STATUSES.SUCCESS);
            expect(postDB?.title).toBe(updatePostRequestDto.title);
            expect(postDB?.description).toBe(updatePostRequestDto.description);
            expect(postDB?.content).toBe(updatePostRequestDto.content);
            expect(postDB?.readingTime).toBe(updatePostRequestDto.reading_time);
            expect(postDB?.tagId).toBe(updatePostRequestDto.tag_id);
            expect(postDB?.status).toBe(PostStatus.SCHEDULED);
            expect(postDB?.scheduledAt).not.toBeNull();
        });

        it("Should return 401 if api key is not provided", async () => {
            // Arrange
            await TagModel.create(createTagDTO);

            const scheduledAt = new Date("2026-05-01T12:00:00+02:00");

            const createdPost = await PostModel.create({
                title: createPostDto.title,
                titleEs: createPostDto.title_es,
                description: createPostDto.description,
                descriptionEs: createPostDto.description_es,
                content: createPostDto.content,
                contentEs: createPostDto.content_es,
                readingTime: createPostDto.reading_time,
                status: PostStatus.SCHEDULED,
                tagId: 1,
                scheduledAt,
            });

            const app = createApp();

            // Act
            const response = await request(app)
                .put(
                    updatePostEndpoint.replace(
                        ":id",
                        String(createdPost.postId),
                    ),
                )
                .send(updatePostRequestDto);
            const postDB = await PostModel.findByPk(createdPost.postId);

            // Assert
            expect(response.status).toBe(HTTP_STATUSES.UNAUTHORIZED);
        });

        it("Should return 404 when provided post does not exists in database", async () => {
            // Arrange
            await TagModel.create(createTagDTO);

            const app = createApp();

            // Act
            const response = await withApiKey(
                request(app)
                    .put(updatePostEndpoint.replace(":id", "999"))
                    .send(updatePostRequestDto),
            );

            // Assert
            expect(response.status).toBe(HTTP_STATUSES.NOT_FOUND);
        });

        it("Should return 404 when provided post tag id does not exists in database", async () => {
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
            const response = await withApiKey(
                request(app)
                    .put(
                        updatePostEndpoint.replace(
                            ":id",
                            String(createdPost.postId),
                        ),
                    )
                    .send({
                        ...updatePostRequestDto,
                        tag_id: 999,
                    }),
            );

            // Assert
            expect(response.status).toBe(HTTP_STATUSES.NOT_FOUND);
        });
    });
});
