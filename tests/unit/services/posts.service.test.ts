import { describe, it, expect, vi, beforeEach } from "vitest";
import { PostModel } from "#models/sequelize/post.sequelize";
import {
    checkPostTagById,
    checkPostTagsByIds,
} from "#services/post-tags.service.js";
import {
    findAllPosts,
    findPostById,
    insertNewPost,
} from "#services/posts.service.js";
import {
    toPaginatedPostsResponseDto,
    toPostResponseDto,
} from "#mappers/post.mappers.js";
import { NotFoundException } from "#exceptions/not-found.exception";
import { InternalServerException } from "#exceptions/internal-server.exception.js";
import {
    mockCreatePostDto,
    mockPaginatedPostsDto,
    mockPost,
    mockPostDto,
    mockPostList,
} from "../../fixtures/post.fixtures.js";
import { mockTag } from "../../fixtures/post-tags.fixtures.js";
import { Op, where } from "sequelize";

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

    describe("findPostById", () => {
        it("Should return a post if exists", async () => {
            // Arrange
            vi.mocked(PostModel.findByPk).mockResolvedValue(mockPost);
            vi.mocked(checkPostTagById).mockResolvedValue(mockTag);
            vi.mocked(toPostResponseDto).mockReturnValue(mockPostDto);

            // Act
            const result = await findPostById(mockPost.postId);

            // Assert
            expect(PostModel.findByPk).toHaveBeenCalledWith(1);
            expect(checkPostTagById).toHaveBeenCalledWith(1);
            expect(toPostResponseDto).toHaveBeenCalledWith(mockPost, mockTag);
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

    describe("findAllPosts", () => {
        it("Should return paginated posts without tagId filter", async () => {
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
            const result = await findAllPosts(1, undefined, undefined);

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

        it("Should calculate offset correctly for page 2 without tagId filter", async () => {
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
            await findAllPosts(2, undefined, undefined);

            // Assert
            expect(checkPostTagById).not.toHaveBeenCalled();
            expect(PostModel.findAndCountAll).toHaveBeenCalledWith({
                limit: 20,
                offset: 20,
                where: {},
                order: [["publishedAt", "DESC"]],
            });
        });

        it("Should return paginated posts filtered by tagId", async () => {
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
            const result = await findAllPosts(1, 1, undefined);

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

        it("Should return paginated posts filtered by search query", async () => {
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
            const result = await findAllPosts(1, undefined, "typescript");

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
            const result = await findAllPosts(1, undefined, undefined);

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
});
