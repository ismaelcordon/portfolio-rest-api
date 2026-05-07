import { describe, it, expect, vi, beforeEach } from "vitest";
import { PostModel } from "#models/sequelize/post.sequelize.js";
import {
    checkPostTagById,
    checkPostTagsByIds,
} from "#services/post-tags.service.js";
import {
    destroyPost,
    findAllPosts,
    findPostById,
    insertNewPost,
    updatePostToHidden,
    updatePostToPublished,
} from "#services/posts.service.js";
import {
    toPaginatedPostsResponseDto,
    toPostResponseDto,
} from "#mappers/post.mappers.js";
import { NotFoundException } from "#exceptions/not-found.exception.js";
import { InternalServerException } from "#exceptions/internal-server.exception.js";
import {
    mockCreatePostDto,
    mockHiddenPost,
    mockPaginatedPostsDto,
    mockPost,
    mockPostDto,
    mockPostList,
    mockPublishedPost,
    mockPublishedPostDto,
    publishedMockPost,
} from "../../fixtures/post.fixtures.js";
import { mockTag } from "../../fixtures/post-tags.fixtures.js";
import { Op } from "sequelize";
import { ConflictException } from "#exceptions/conflict.exception.js";
import { PostStatus } from "#types/post.types.js";

vi.mock("#models/sequelize/post.sequelize.js", () => {
    return {
        PostModel: {
            findByPk: vi.fn(),
            create: vi.fn(),
            findAndCountAll: vi.fn(),
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
    };
});

vi.mock("#mappers/post.mappers.js", () => {
    return {
        toPostResponseDto: vi.fn(),
        toPaginatedPostsResponseDto: vi.fn(),
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
            vi.mocked(toPostResponseDto).mockReturnValue(mockPostDto);
            vi.mocked(toPaginatedPostsResponseDto).mockReturnValue(
                mockPaginatedPostsDto,
            );

            // Act
            const result = await findAllPosts(1, undefined, undefined, false);

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
            expect(toPostResponseDto).toHaveBeenCalledTimes(20);
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
            const result = await findAllPosts(1, undefined, undefined, true);

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
            await findAllPosts(2, undefined, undefined, true);

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
            const result = await findAllPosts(1, 1, undefined, true);

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
            const result = await findAllPosts(1, undefined, "typescript", true);

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
            const result = await findAllPosts(1, undefined, undefined, true);

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
            const result = findAllPosts(1, 999, undefined);

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
            const result = findAllPosts(1, undefined, undefined);

            // Assert
            await expect(result).rejects.toThrow(InternalServerException);
            await expect(result).rejects.toThrow("Database crashed");
            expect(checkPostTagsByIds).not.toHaveBeenCalled();
            expect(toPostResponseDto).not.toHaveBeenCalled();
        });
    });

    describe("findPostById", () => {
        it("Should return Not Found exception if a post exists but status is not published and user is not an admin", async () => {
            // Arrange
            vi.mocked(PostModel.findByPk).mockResolvedValue(mockPost);
            vi.mocked(checkPostTagById).mockResolvedValue(mockTag);
            vi.mocked(toPostResponseDto).mockReturnValue(mockPostDto);

            // Act
            const result = findPostById(mockPost.postId, false);

            // Assert
            await expect(result).rejects.toThrow(NotFoundException);
            expect(PostModel.findByPk).toHaveBeenCalledWith(1);
            expect(checkPostTagById).not.toHaveBeenCalled();
            expect(toPostResponseDto).not.toHaveBeenCalled();
        });

        it("Should return post if a post exists tatus is not published and user is an admin", async () => {
            // Arrange
            vi.mocked(PostModel.findByPk).mockResolvedValue(mockPost);
            vi.mocked(checkPostTagById).mockResolvedValue(mockTag);
            vi.mocked(toPostResponseDto).mockReturnValue(mockPostDto);

            // Act
            const result = await findPostById(mockPost.postId, true);

            // Assert
            expect(PostModel.findByPk).toHaveBeenCalledWith(1);
            expect(checkPostTagById).toHaveBeenCalledOnce();
            expect(toPostResponseDto).toHaveBeenCalledOnce();
            expect(result).toEqual(mockPostDto);
        });

        it("Should return post if a post exists status is published and user is not an admin", async () => {
            // Arrange
            vi.mocked(PostModel.findByPk).mockResolvedValue(publishedMockPost);
            vi.mocked(checkPostTagById).mockResolvedValue(mockTag);
            vi.mocked(toPostResponseDto).mockReturnValue(mockPublishedPostDto);

            // Act
            const result = await findPostById(mockPost.postId, false);

            // Assert
            expect(PostModel.findByPk).toHaveBeenCalledWith(1);
            expect(checkPostTagById).toHaveBeenCalledOnce();
            expect(toPostResponseDto).toHaveBeenCalledOnce();
            expect(result).toEqual(mockPublishedPostDto);
        });

        it("Should throw NotFoundException when post does not exist", async () => {
            // Arrange
            vi.mocked(PostModel.findByPk).mockResolvedValue(null);

            // Act
            const result = findPostById(999, false);

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
            const result = findPostById(1, false);

            // Assert
            await expect(result).rejects.toThrow(InternalServerException);
            await expect(result).rejects.toThrow("Database crashed");
            expect(checkPostTagById).not.toHaveBeenCalled();
            expect(toPostResponseDto).not.toHaveBeenCalled();
        });
    });

    describe("insertNewPost", () => {
        it("Should create and return a new post", async () => {
            // Arrange
            vi.mocked(checkPostTagById).mockResolvedValue(mockTag);
            vi.mocked(PostModel.create).mockResolvedValue(mockPost);
            vi.mocked(toPostResponseDto).mockReturnValue(mockPostDto);

            // Act
            const result = await insertNewPost(mockCreatePostDto);

            // Assert
            expect(checkPostTagById).toHaveBeenCalledWith(
                mockCreatePostDto.tagId,
            );
            expect(PostModel.create).toHaveBeenCalledWith({
                title: mockCreatePostDto.title,
                description: mockCreatePostDto.description,
                content: mockCreatePostDto.content,
                readingTime: mockCreatePostDto.readingTime,
                status: mockCreatePostDto.status,
                tagId: mockCreatePostDto.tagId,
            });
            expect(toPostResponseDto).toHaveBeenCalledWith(mockPost, mockTag);
            expect(result).toEqual(mockPostDto);
        });

        it("Should throw NotFoundException when post does not exist", async () => {
            // Arrange
            vi.mocked(checkPostTagById).mockRejectedValue(
                new NotFoundException(
                    `Post tag with id: ${mockCreatePostDto.tagId}, not found.`,
                ),
            );

            const result = insertNewPost(mockCreatePostDto);

            // Act
            await expect(result).rejects.toThrow(NotFoundException);
            await expect(result).rejects.toThrow(
                `Post tag with id: ${mockCreatePostDto.tagId}, not found.`,
            );

            // Assert
            expect(PostModel.create).not.toHaveBeenCalled();
            expect(toPostResponseDto).not.toHaveBeenCalled();
        });

        it("Should throw InternalServerException when an enexpected error occurs", async () => {
            // Arrange
            vi.mocked(checkPostTagById).mockResolvedValue(mockTag);
            vi.mocked(PostModel.create).mockRejectedValue(
                new Error("Database crashed"),
            );

            // Act
            const result = insertNewPost(mockCreatePostDto);

            // Assert
            await expect(result).rejects.toThrow(InternalServerException);
            await expect(result).rejects.toThrow("Database crashed");
            expect(toPostResponseDto).not.toHaveBeenCalled();
        });
    });

    describe("hidePost", () => {
        it("Should hide a post successfully", async () => {
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
            await updatePostToHidden(mockPost.postId);

            // Assert
            expect(PostModel.findByPk).toHaveBeenCalledWith(mockPost.postId);
            expect(mockPostWithUpdate.update).toHaveBeenCalledWith({
                status: PostStatus.HIDDEN,
            });
        });

        it("Should throw NotFoundException when post does not exist", async () => {
            // Arrange
            vi.mocked(PostModel.findByPk).mockResolvedValue(null);

            // Act
            const result = updatePostToHidden(999);

            // Assert
            await expect(result).rejects.toThrow(NotFoundException);
            await expect(result).rejects.toThrow("Post with id 999 not found");
            expect(checkPostTagById).not.toHaveBeenCalled();
            expect(toPostResponseDto).not.toHaveBeenCalled();
        });

        it("Should throw ConflictException when post is already hidden", async () => {
            // Arrange
            vi.mocked(PostModel.findByPk).mockResolvedValue(mockHiddenPost);

            // Act
            const result = updatePostToHidden(mockHiddenPost.postId);

            // Assert
            await expect(result).rejects.toThrow(ConflictException);
            await expect(result).rejects.toThrow(
                `Post with id ${mockHiddenPost.postId} is already hidden`,
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
            const result = destroyPost(1);

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
                ...mockPost,
                update: vi.fn().mockResolvedValue(undefined),
            };
            vi.mocked(PostModel.findByPk).mockResolvedValue(
                mockPostWithUpdate as any,
            );

            // Act
            await updatePostToPublished(mockPost.postId);

            // Assert
            expect(PostModel.findByPk).toHaveBeenCalledWith(mockPost.postId);
            expect(mockPostWithUpdate.update).toHaveBeenCalledWith({
                status: PostStatus.PUBLISHED,
                publishedAt: expect.any(Date),
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
});
