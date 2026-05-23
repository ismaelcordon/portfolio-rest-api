import { describe, it, expect, vi, beforeEach } from "vitest";
import { PostModel } from "#models/sequelize/post.sequelize.js";
import {
    destroyPost,
    findAllPosts,
    findPostById,
    insertNewPost,
    updatePostVisibility,
    updatePostToPublished,
    updatePostToScheduled,
    updatePostEditableFieldsAndOptionallyPublish,
    findPostBySlug,
} from "#services/posts.service.js";
import {
    toPaginatedPostsResponseDto,
    toPostResponseDto,
} from "#mappers/post.mappers.js";
import { mapPostToPublicDto } from "#mappers/post.public.mapper.js";
import { NotFoundException } from "#exceptions/not-found.exception.js";
import { InternalServerException } from "#exceptions/internal-server.exception.js";
import {
    mockHiddenPost,
    mockPaginatedPostsDto,
    mockPost,
    mockPostDto,
    mockPostList,
    mockPublishedPost,
    mockPublishedPostDto,
    publishedMockPost,
    mockScheduledPost,
    emptyPostDto,
    emptyMockPost,
    updatePostDto,
} from "../../fixtures/post.fixtures.js";
import { mockTag } from "../../fixtures/post-tags.fixtures.js";
import { Op } from "sequelize";
import { ConflictException } from "#exceptions/conflict.exception.js";
import { PostStatus } from "#types/post.types.js";
import {
    checkPostTagById,
    checkPostTagsByIds,
    findFirstTag,
} from "#services/post-tags.service.js";

vi.mock("#models/sequelize/post.sequelize.js", () => {
    return {
        PostModel: {
            findByPk: vi.fn(),
            create: vi.fn(),
            findAndCountAll: vi.fn(),
            findOne: vi.fn(),
        },
    };
});

vi.mock("#models/sequelize/post-tag.sequelize.js", () => {
    return {
        TagModel: {
            findOne: vi.fn(),
        },
    };
});

vi.mock("#services/post-tags.service.js", () => {
    return {
        checkPostTagById: vi.fn(),
        checkPostTagsByIds: vi.fn(),
        findFirstTag: vi.fn(),
    };
});

vi.mock("#mappers/post.mappers.js", () => {
    return {
        toPostResponseDto: vi.fn(),
        toPaginatedPostsResponseDto: vi.fn(),
    };
});

vi.mock("#mappers/post.public.mapper.js", () => {
    return {
        mapPostToPublicDto: vi.fn(),
    };
});

describe("post.service", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe("findAllPosts", () => {
        it("Should return paginated posts without tagId filter and user is not an admin", async () => {
            // Arrange
            vi.mocked(PostModel.findAndCountAll).mockResolvedValue({
                count: 40,
                rows: mockPostList,
            } as any);
            vi.mocked(checkPostTagsByIds).mockResolvedValue([mockTag]);
            vi.mocked(mapPostToPublicDto).mockReturnValue(mockPostDto as any);
            vi.mocked(toPaginatedPostsResponseDto).mockReturnValue(
                mockPaginatedPostsDto,
            );

            // Act
            const result = await findAllPosts(1, "en", undefined, undefined, false);

            // Assert
            expect(checkPostTagById).not.toHaveBeenCalled();
            expect(PostModel.findAndCountAll).toHaveBeenCalledWith({
                limit: 20,
                offset: 0,
                where: {
                    status: PostStatus.PUBLISHED,
                },
                order: [["publishedAt", "DESC"]],
            });
            expect(checkPostTagsByIds).toHaveBeenCalledWith([1, 2]);
            expect(mapPostToPublicDto).toHaveBeenCalledTimes(20);
            expect(toPaginatedPostsResponseDto).toHaveBeenCalledWith(
                Array(20).fill(mockPostDto),
                40,
                1,
            );
            expect(result).toEqual(mockPaginatedPostsDto);
        });

        it("Should return paginated posts without tagId filter and user is admin", async () => {
            // Arrange
            vi.mocked(PostModel.findAndCountAll).mockResolvedValue({
                count: 40,
                rows: mockPostList,
            } as any);
            vi.mocked(checkPostTagsByIds).mockResolvedValue([mockTag]);
            vi.mocked(toPostResponseDto).mockReturnValue(mockPostDto);
            vi.mocked(toPaginatedPostsResponseDto).mockReturnValue(
                mockPaginatedPostsDto,
            );

            // Act
            const result = await findAllPosts(1, "en", undefined, undefined, true);

            // Assert
            expect(checkPostTagById).not.toHaveBeenCalled();
            expect(PostModel.findAndCountAll).toHaveBeenCalledWith({
                limit: 20,
                offset: 0,
                where: {},
                order: [["publishedAt", "DESC"]],
            });
            expect(checkPostTagsByIds).toHaveBeenCalledWith([1, 2]);
            expect(toPostResponseDto).toHaveBeenCalledTimes(20);
            expect(toPaginatedPostsResponseDto).toHaveBeenCalledWith(
                Array(20).fill(mockPostDto),
                40,
                1,
            );
            expect(result).toEqual(mockPaginatedPostsDto);
        });

        it("Should calculate offset correctly for page 2 without tagId filter and user is admin", async () => {
            // Arrange
            vi.mocked(PostModel.findAndCountAll).mockResolvedValue({
                count: 40,
                rows: mockPostList,
            } as any);
            vi.mocked(checkPostTagsByIds).mockResolvedValue([mockTag]);
            vi.mocked(toPostResponseDto).mockReturnValue(mockPostDto);
            vi.mocked(toPaginatedPostsResponseDto).mockReturnValue(
                mockPaginatedPostsDto,
            );

            // Act
            await findAllPosts(2, "en", undefined, undefined, true);

            // Assert
            expect(checkPostTagById).not.toHaveBeenCalled();
            expect(PostModel.findAndCountAll).toHaveBeenCalledWith({
                limit: 20,
                offset: 20,
                where: {},
                order: [["publishedAt", "DESC"]],
            });
        });

        it("Should return paginated posts filtered by tagId and user is admin", async () => {
            // Arrange
            vi.mocked(checkPostTagById).mockResolvedValue(mockTag);
            vi.mocked(PostModel.findAndCountAll).mockResolvedValue({
                count: 40,
                rows: mockPostList,
            } as any);
            vi.mocked(checkPostTagsByIds).mockResolvedValue([mockTag]);
            vi.mocked(toPostResponseDto).mockReturnValue(mockPostDto);
            vi.mocked(toPaginatedPostsResponseDto).mockReturnValue(
                mockPaginatedPostsDto,
            );

            // Act
            const result = await findAllPosts(1, "en", 1, undefined, true);

            // Assert
            expect(checkPostTagById).toHaveBeenCalledWith(1);
            expect(PostModel.findAndCountAll).toHaveBeenCalledWith({
                limit: 20,
                offset: 0,
                where: { tagId: 1 },
                order: [["publishedAt", "DESC"]],
            });
            expect(result).toEqual(mockPaginatedPostsDto);
        });

        it("Should return paginated posts filtered by search query and user is admin", async () => {
            // Arrange
            vi.mocked(PostModel.findAndCountAll).mockResolvedValue({
                count: 40,
                rows: mockPostList,
            } as any);
            vi.mocked(checkPostTagsByIds).mockResolvedValue([mockTag]);
            vi.mocked(toPostResponseDto).mockReturnValue(mockPostDto);
            vi.mocked(toPaginatedPostsResponseDto).mockReturnValue(
                mockPaginatedPostsDto,
            );

            // Act
            const result = await findAllPosts(1, "en", undefined, "typescript", true);

            // Assert
            expect(checkPostTagById).not.toHaveBeenCalled();
            expect(PostModel.findAndCountAll).toHaveBeenCalledWith({
                limit: 20,
                offset: 0,
                where: { title: { [Op.iLike]: "%typescript%" } },
                order: [["publishedAt", "DESC"]],
            });
            expect(result).toEqual(mockPaginatedPostsDto);
        });

        it("Should return empty data when no posts exist", async () => {
            // Arrange
            vi.mocked(PostModel.findAndCountAll).mockResolvedValue({
                count: 0,
                rows: [],
            } as any);
            vi.mocked(checkPostTagsByIds).mockResolvedValue([]);
            vi.mocked(toPaginatedPostsResponseDto).mockReturnValue({
                data: [],
                meta: {
                    total: 0,
                    page: 1,
                    totalPages: 0,
                    hasNextPage: false,
                    hasPrevPage: false,
                },
            });

            // Act
            const result = await findAllPosts(1, "en", undefined, undefined, true);

            // Assert
            expect(checkPostTagsByIds).toHaveBeenCalledWith([]);
            expect(toPostResponseDto).not.toHaveBeenCalled();
            expect(result.data).toHaveLength(0);
        });

        it("Should throw NotFoundException when tagId filter is provided but tag does not exist", async () => {
            // Arrange
            vi.mocked(checkPostTagById).mockRejectedValue(
                new NotFoundException(`Tag with id 999 not found`),
            );

            // Act
            const result = findAllPosts(1, "en", 999, undefined);

            // Assert
            await expect(result).rejects.toThrow(NotFoundException);
            await expect(result).rejects.toThrow("Tag with id 999 not found");
            expect(PostModel.findAndCountAll).not.toHaveBeenCalled();
            expect(checkPostTagsByIds).not.toHaveBeenCalled();
        });

        it("Should throw InternalServerException when an unexpected error occurs", async () => {
            // Arrange
            vi.mocked(PostModel.findAndCountAll).mockRejectedValue(
                new Error("Database crashed"),
            );

            // Act
            const result = findAllPosts(1, "en", undefined, undefined);

            // Assert
            await expect(result).rejects.toThrow(InternalServerException);
            await expect(result).rejects.toThrow("Database crashed");
            expect(checkPostTagsByIds).not.toHaveBeenCalled();
            expect(toPostResponseDto).not.toHaveBeenCalled();
        });
    });

    describe("findPostById", () => {
        it("Should return post if a post exists", async () => {
            // Arrange
            vi.mocked(PostModel.findByPk).mockResolvedValue(mockPost);
            vi.mocked(checkPostTagById).mockResolvedValue(mockTag);
            vi.mocked(toPostResponseDto).mockReturnValue(mockPostDto);

            // Act
            const result = await findPostById(mockPost.postId);

            // Assert
            expect(PostModel.findByPk).toHaveBeenCalledWith(1);
            expect(checkPostTagById).toHaveBeenCalledOnce();
            expect(toPostResponseDto).toHaveBeenCalledOnce();
            expect(result).toEqual(mockPostDto);
        });

        it("Should throw NotFoundException when post does not exist", async () => {
            // Arrange
            vi.mocked(PostModel.findByPk).mockResolvedValue(null);

            // Act
            const result = findPostById(999);

            // Assert
            await expect(result).rejects.toThrow(NotFoundException);
            await expect(result).rejects.toThrow("Post with id 999 not found");
            expect(checkPostTagById).not.toHaveBeenCalled();
            expect(toPostResponseDto).not.toHaveBeenCalled();
        });

        it("Should throw InternalServerException when an enexpected error occurs", async () => {
            // Arrange
            vi.mocked(PostModel.findByPk).mockRejectedValue(
                new Error("Database crashed"),
            );

            // Act
            const result = findPostById(1);

            // Assert
            await expect(result).rejects.toThrow(InternalServerException);
            await expect(result).rejects.toThrow("Database crashed");
            expect(checkPostTagById).not.toHaveBeenCalled();
            expect(toPostResponseDto).not.toHaveBeenCalled();
        });
    });

    describe("findPostBySlug", () => {
        it("Should return post if the slug exists", async () => {
            // Arrange
            vi.mocked(PostModel.findOne).mockResolvedValue(publishedMockPost);
            vi.mocked(checkPostTagById).mockResolvedValue(mockTag);
            vi.mocked(mapPostToPublicDto).mockReturnValue(mockPublishedPostDto as any);

            // Act
            const result = await findPostBySlug(publishedMockPost.slug, "en");

            // Assert
            expect(PostModel.findOne).toHaveBeenCalledWith({
                where: {
                    slug: publishedMockPost.slug,
                },
            });
            expect(checkPostTagById).toHaveBeenCalledOnce();
            expect(mapPostToPublicDto).toHaveBeenCalledOnce();
            expect(result).toEqual(mockPublishedPostDto);
        });

        it("Should throw NotFoundException when post does not exist", async () => {
            // Arrange
            vi.mocked(PostModel.findOne).mockResolvedValue(null);

            // Act
            const result = findPostBySlug("without-title", "en");

            // Assert
            await expect(result).rejects.toThrow(NotFoundException);
            await expect(result).rejects.toThrow(
                `Post with slug: "without-title" does not found`,
            );
            expect(checkPostTagById).not.toHaveBeenCalled();
            expect(mapPostToPublicDto).not.toHaveBeenCalled();
        });

        it("Should throw InternalServerException when an enexpected error occurs", async () => {
            // Arrange
            vi.mocked(PostModel.findOne).mockRejectedValue(
                new Error("Database crashed"),
            );

            // Act
            const result = findPostBySlug("without-title", "en");

            // Assert
            await expect(result).rejects.toThrow(InternalServerException);
            await expect(result).rejects.toThrow("Database crashed");
            expect(checkPostTagById).not.toHaveBeenCalled();
            expect(mapPostToPublicDto).not.toHaveBeenCalled();
        });
    });

    describe("insertNewPost", () => {
        it("Should create and return a new post", async () => {
            // Arrange
            vi.mocked(findFirstTag).mockResolvedValue(mockTag);
            vi.mocked(PostModel.create).mockResolvedValue(emptyMockPost);
            vi.mocked(toPostResponseDto).mockReturnValue(emptyPostDto);

            // Act
            const result = await insertNewPost();

            // Assert
            expect(findFirstTag).toHaveBeenCalledOnce();
            expect(PostModel.create).toHaveBeenCalledWith({
                title: emptyPostDto.title,
                description: emptyPostDto.description,
                content: emptyPostDto.content,
                readingTime: emptyPostDto.readingTime,
                status: emptyPostDto.status,
                tagId: emptyPostDto.tag.tagId,
            });
            expect(toPostResponseDto).toHaveBeenCalledWith(
                emptyMockPost,
                mockTag,
            );
            expect(result).toEqual(emptyPostDto);
        });

        it("Should throw InternalServerException when an enexpected error occurs", async () => {
            // Arrange
            vi.mocked(checkPostTagById).mockResolvedValue(mockTag);
            vi.mocked(PostModel.create).mockRejectedValue(
                new Error("Database crashed"),
            );

            // Act
            const result = insertNewPost();

            // Assert
            await expect(result).rejects.toThrow(InternalServerException);
            await expect(result).rejects.toThrow("Database crashed");
            expect(toPostResponseDto).not.toHaveBeenCalled();
        });
    });

    describe("changePostVisibility", () => {
        it("Should hide a post successfully", async () => {
            // Arrange
            const mockPostWithUpdate = {
                ...mockPublishedPost,
                update: vi.fn().mockResolvedValue(undefined),
                status: PostStatus.PUBLISHED,
            };
            vi.mocked(PostModel.findByPk).mockResolvedValue(
                mockPostWithUpdate as any,
            );
            vi.mocked(checkPostTagById).mockResolvedValue(mockTag);

            // Act
            await updatePostVisibility(mockPost.postId);

            // Assert
            expect(PostModel.findByPk).toHaveBeenCalledWith(
                mockPostWithUpdate.postId,
            );
            expect(mockPostWithUpdate.update).toHaveBeenCalledWith({
                status: PostStatus.HIDDEN,
            });
        });

        it("Should throw NotFoundException when post does not exist", async () => {
            // Arrange
            vi.mocked(PostModel.findByPk).mockResolvedValue(null);

            // Act
            const result = updatePostVisibility(999);

            // Assert
            await expect(result).rejects.toThrow(NotFoundException);
            await expect(result).rejects.toThrow("Post with id 999 not found");
            expect(checkPostTagById).not.toHaveBeenCalled();
            expect(toPostResponseDto).not.toHaveBeenCalled();
        });

        it("Should throw ConflictException when post is not published or hidden", async () => {
            // Arrange
            vi.mocked(PostModel.findByPk).mockResolvedValue(mockScheduledPost);

            // Act
            const result = updatePostVisibility(mockScheduledPost.postId);

            // Assert
            await expect(result).rejects.toThrow(ConflictException);
            await expect(result).rejects.toThrow(
                `Post with id ${mockScheduledPost.postId} cannot be hidden. Post needs to be published`,
            );
            expect(checkPostTagById).not.toHaveBeenCalled();
            expect(toPostResponseDto).not.toHaveBeenCalled();
        });

        it("Should throw InternalServerException when an unexpected error occurs", async () => {
            // Arrange
            vi.mocked(PostModel.findByPk).mockRejectedValue(
                new Error("Database crashed"),
            );

            // Act
            const result = updatePostVisibility(mockHiddenPost.postId);

            // Assert
            await expect(result).rejects.toThrow(InternalServerException);
            await expect(result).rejects.toThrow("Database crashed");
            expect(checkPostTagById).not.toHaveBeenCalled();
            expect(toPostResponseDto).not.toHaveBeenCalled();
        });
    });

    describe("deletePost", () => {
        it("Should delete a post successfully", async () => {
            // Arrange
            const mockPostWithDestroy = {
                ...mockPost,
                destroy: vi.fn().mockResolvedValue(undefined),
            };
            vi.mocked(PostModel.findByPk).mockResolvedValue(
                mockPostWithDestroy as any,
            );

            // Act
            await destroyPost(mockPost.postId);

            // Assert
            expect(PostModel.findByPk).toHaveBeenCalledWith(mockPost.postId);
            expect(mockPostWithDestroy.destroy).toHaveBeenCalled();
        });

        it("Should throw NotFoundException when post does not exist", async () => {
            // Arrange
            vi.mocked(PostModel.findByPk).mockResolvedValue(null);

            // Act
            const result = destroyPost(999);

            // Assert
            await expect(result).rejects.toThrow(NotFoundException);
            await expect(result).rejects.toThrow("Post with id 999 not found");
        });

        it("Should throw InternalServerException when an unexpected error occurs", async () => {
            // Arrange
            vi.mocked(PostModel.findByPk).mockRejectedValue(
                new Error("Database crashed"),
            );

            // Act
            const result = destroyPost(1);

            // Assert
            await expect(result).rejects.toThrow(InternalServerException);
            await expect(result).rejects.toThrow("Database crashed");
        });
    });

    describe("publishPost", () => {
        it("Should publish a post successfully", async () => {
            // Arrange
            const mockPostWithUpdate = {
                ...publishedMockPost,
                status: PostStatus.DRAFT,
                update: vi.fn().mockResolvedValue(undefined),
            };
            vi.mocked(PostModel.findByPk).mockResolvedValue(
                mockPostWithUpdate as any,
            );

            // Act
            await updatePostToPublished(publishedMockPost.postId);

            // Assert
            expect(PostModel.findByPk).toHaveBeenCalledWith(
                publishedMockPost.postId,
            );
            expect(mockPostWithUpdate.update).toHaveBeenCalledWith({
                status: PostStatus.PUBLISHED,
                publishedAt: expect.any(Date),
                slug: mockPostWithUpdate.slug,
            });
        });

        it("Should throw NotFoundException when post does not exist", async () => {
            // Arrange
            vi.mocked(PostModel.findByPk).mockResolvedValue(null);

            // Act
            const result = updatePostToPublished(999);

            // Assert
            await expect(result).rejects.toThrow(NotFoundException);
            await expect(result).rejects.toThrow("Post with id 999 not found");
        });

        it("Should throw ConflictException when post is already published", async () => {
            // Arrange
            vi.mocked(PostModel.findByPk).mockResolvedValue(mockPublishedPost);

            // Act
            const result = updatePostToPublished(mockPublishedPost.postId);

            // Assert
            await expect(result).rejects.toThrow(ConflictException);
            await expect(result).rejects.toThrow(
                `Post with id ${mockPublishedPost.postId} is already published`,
            );
        });

        it("Should throw InternalServerException when an unexpected error occurs", async () => {
            // Arrange
            vi.mocked(PostModel.findByPk).mockRejectedValue(
                new Error("Database crashed"),
            );

            // Act
            const result = updatePostToPublished(1);

            // Assert
            await expect(result).rejects.toThrow(InternalServerException);
            await expect(result).rejects.toThrow("Database crashed");
        });
    });

    describe("schedulePost", () => {
        it("Should schedule a post successfully from DRAFT", async () => {
            // Arrange
            const mockPostWithUpdate = {
                ...mockPost,
                update: vi.fn().mockResolvedValue(undefined),
            };
            vi.mocked(PostModel.findByPk).mockResolvedValue(
                mockPostWithUpdate as any,
            );

            // Act
            await updatePostToScheduled(
                mockPost.postId,
                "2026-05-01T12:00:00+02:00",
            );

            // Assert
            expect(PostModel.findByPk).toHaveBeenCalledWith(mockPost.postId);
            expect(mockPostWithUpdate.update).toHaveBeenCalledWith({
                status: PostStatus.SCHEDULED,
                scheduledAt: new Date("2026-05-01T12:00:00+02:00"),
            });
        });

        it("Should reschedule a post successfully from SCHEDULED", async () => {
            // Arrange
            const mockPostWithUpdate = {
                ...mockScheduledPost,
                update: vi.fn().mockResolvedValue(undefined),
            };
            vi.mocked(PostModel.findByPk).mockResolvedValue(
                mockPostWithUpdate as any,
            );

            // Act
            await updatePostToScheduled(
                mockScheduledPost.postId,
                "2026-06-01T12:00:00+02:00",
            );

            // Assert
            expect(PostModel.findByPk).toHaveBeenCalledWith(
                mockScheduledPost.postId,
            );
            expect(mockPostWithUpdate.update).toHaveBeenCalledWith({
                status: PostStatus.SCHEDULED,
                scheduledAt: new Date("2026-06-01T12:00:00+02:00"),
            });
        });

        it("Should throw NotFoundException when post does not exist", async () => {
            // Arrange
            vi.mocked(PostModel.findByPk).mockResolvedValue(null);

            // Act
            const result = updatePostToScheduled(
                999,
                "2026-05-01T12:00:00+02:00",
            );

            // Assert
            await expect(result).rejects.toThrow(NotFoundException);
            await expect(result).rejects.toThrow("Post with id 999 not found");
        });

        it("Should throw ConflictException when post is hidden", async () => {
            // Arrange
            vi.mocked(PostModel.findByPk).mockResolvedValue(mockHiddenPost);

            // Act
            const result = updatePostToScheduled(
                mockHiddenPost.postId,
                "2026-05-01T12:00:00+02:00",
            );

            // Assert
            await expect(result).rejects.toThrow(ConflictException);
            await expect(result).rejects.toThrow(
                `Post with id ${mockHiddenPost.postId} cannot be scheduled`,
            );
        });

        it("Should throw InternalServerException when an unexpected error occurs", async () => {
            // Arrange
            vi.mocked(PostModel.findByPk).mockRejectedValue(
                new Error("Database crashed"),
            );

            // Act
            const result = updatePostToScheduled(
                1,
                "2026-05-01T12:00:00+02:00",
            );

            // Assert
            await expect(result).rejects.toThrow(InternalServerException);
            await expect(result).rejects.toThrow("Database crashed");
        });
    });

    describe("updatePostEditableFields", async () => {
        it("Should update post succesfully without publishing", async () => {
            // Arrange
            const mockPostWithUpdate = {
                ...mockPost,
                update: vi.fn().mockResolvedValue(undefined),
            };

            vi.mocked(PostModel.findByPk).mockResolvedValue(
                mockPostWithUpdate as any,
            );
            vi.mocked(checkPostTagById).mockResolvedValue(mockTag);

            // Act
            await updatePostEditableFieldsAndOptionallyPublish(
                mockPost.postId,
                updatePostDto,
            );

            // Assert
            expect(PostModel.findByPk).toHaveBeenCalledWith(mockPost.postId);
            expect(checkPostTagById).toHaveBeenCalledWith(updatePostDto.tagId);
            expect(mockPostWithUpdate.update).toHaveBeenCalledWith({
                title: updatePostDto.title,
                titleEs: updatePostDto.titleEs,
                description: updatePostDto.description,
                descriptionEs: updatePostDto.descriptionEs,
                content: updatePostDto.content,
                contentEs: updatePostDto.contentEs,
                readingTime: updatePostDto.readingTime,
                status: updatePostDto.status,
                slug: null,
                tagId: updatePostDto.tagId,
                publishedAt: null,
            });
        });

        it("Should update post successfully publishing it", async () => {});

        it("Should throw NotFoundException when post does not exists in database", async () => {
            // Arrange
            vi.mocked(PostModel.findByPk).mockResolvedValue(null);

            // Act
            const result = updatePostEditableFieldsAndOptionallyPublish(
                999,
                updatePostDto,
            );

            // Assert
            await expect(result).rejects.toThrow(NotFoundException);
            await expect(result).rejects.toThrow("Post with id 999 not found");
            expect(checkPostTagById).not.toHaveBeenCalled();
        });

        it("Should throw NotFoundException when tag does not exist", async () => {
            // Arrange
            vi.mocked(PostModel.findByPk).mockResolvedValue(mockPost);
            vi.mocked(checkPostTagById).mockRejectedValue(
                new NotFoundException(
                    `Post tag with id: ${updatePostDto.tagId}, not found.`,
                ),
            );

            // Act
            const result = updatePostEditableFieldsAndOptionallyPublish(
                mockPost.postId,
                updatePostDto,
            );

            // Assert
            await expect(result).rejects.toThrow(NotFoundException);
            await expect(result).rejects.toThrow(
                `Post tag with id: ${updatePostDto.tagId}, not found.`,
            );
        });

        it("Should throw InternalServerException when an unexpected error occurs", async () => {
            // Arrange
            vi.mocked(PostModel.findByPk).mockRejectedValue(
                new Error("Database crashed"),
            );

            // Act
            const result = updatePostEditableFieldsAndOptionallyPublish(
                1,
                updatePostDto,
            );

            // Assert
            await expect(result).rejects.toThrow(InternalServerException);
            await expect(result).rejects.toThrow("Database crashed");
            expect(checkPostTagById).not.toHaveBeenCalled();
        });
    });
});
