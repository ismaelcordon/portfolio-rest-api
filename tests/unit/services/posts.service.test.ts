import { describe, it, expect, vi, beforeEach } from "vitest";
import { PostModel } from "#models/sequelize/post.sequelize";
import { checkPostTagById } from "#services/post-tags.service.js";
import { findPostById, insertNewPost } from "#services/posts.service.js";
import { toPostResponseDto } from "#mappers/post.mappers.js";
import { NotFoundException } from "#exceptions/not-found.exception";
import { InternalServerException } from "#exceptions/internal-server.exception.js";
import {
    mockCreatePostDto,
    mockPost,
    mockPostDto,
} from "../../fixtures/post.fixtures.js";
import { mockTag } from "../../fixtures/post-tags.fixtures.js";

vi.mock("#models/sequelize/post.sequelize.js", () => {
    return {
        PostModel: {
            findByPk: vi.fn(),
            create: vi.fn(),
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
    };
});

vi.mock("#mappers/post.mappers.js", () => {
    return {
        toPostResponseDto: vi.fn(),
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
});
