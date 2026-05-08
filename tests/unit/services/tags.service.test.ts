import { InternalServerException } from "#exceptions/internal-server.exception.js";
import { NotFoundException } from "#exceptions/not-found.exception.js";
import { TagModel } from "#models/sequelize/post-tag.sequelize.js";
import {
    checkPostTagById,
    checkPostTagsByIds,
    findAllTags,
    findFirstTag,
} from "#services/post-tags.service.js";
import { describe } from "node:test";
import { expect, it, vi } from "vitest";
import { mockTag, mockTags } from "../../fixtures/post-tags.fixtures.js";

vi.mock("#models/sequelize/post-tag.sequelize.js", () => {
    return {
        TagModel: {
            findAll: vi.fn(),
            findOne: vi.fn(),
            findByPk: vi.fn(),
        },
    };
});

vi.mock("#mappers/post-tags.mapper.js", () => ({
    toTagDto: vi.fn(),
}));

describe("post-tags.service", () => {
    beforeEach(() => {
        vi.resetAllMocks();
    });

    describe("findAllTags", () => {
        it("Should return all tags mapped to DTOs", async () => {
            // Arrange
            vi.mocked(TagModel.findAll).mockResolvedValue(mockTags);

            // Act
            const result = await findAllTags();

            // Assert
            expect(TagModel.findAll).toHaveBeenCalledOnce();
            expect(result).toHaveLength(2);
            expect(result[0]).toEqual(mockTags[0]);
            expect(result[1]).toEqual(mockTags[1]);
        });

        it("Should return empty array when no tags exist", async () => {
            // Arrange
            vi.mocked(TagModel.findAll).mockResolvedValue([]);

            // Act
            const result = await findAllTags();

            // Assert
            expect(TagModel.findAll).toHaveBeenCalledOnce();
            expect(result).toHaveLength(0);
        });

        it("Should throw InternalServerException when an unexpected error occurs", async () => {
            // Arrange
            vi.mocked(TagModel.findAll).mockRejectedValue(
                new Error("Database crashed"),
            );

            // Act
            const result = findAllTags();

            // Assert
            await expect(result).rejects.toThrow(InternalServerException);
            await expect(result).rejects.toThrow("Database crashed");
        });
    });

    describe("findFirstTag", () => {
        it("Should return the first tag ordered by tagId ASC", async () => {
            // Arrange
            vi.mocked(TagModel.findOne).mockResolvedValue(mockTag);

            // Act
            const result = await findFirstTag();

            // Assert
            expect(TagModel.findOne).toHaveBeenCalledWith({
                order: [["tagId", "ASC"]],
            });
            expect(result).toEqual(mockTag);
        });

        it("Should throw NotFoundException when no tags exist", async () => {
            // Arrange
            vi.mocked(TagModel.findOne).mockResolvedValue(null);

            // Act
            const result = findFirstTag();

            // Assert
            await expect(result).rejects.toThrow(NotFoundException);
            await expect(result).rejects.toThrow("No tags found");
        });

        it("Should throw InternalServerException when an unexpected error occurs", async () => {
            // Arrange
            vi.mocked(TagModel.findOne).mockRejectedValue(
                new Error("Database crashed"),
            );

            // Act
            const result = findFirstTag();

            // Assert
            await expect(result).rejects.toThrow(InternalServerException);
            await expect(result).rejects.toThrow("Database crashed");
        });
    });

    describe("checkPostTagById", () => {
        it("Should return a post if exists", async () => {
            // Arrange
            vi.mocked(TagModel.findByPk).mockResolvedValue(mockTag);

            // Act
            const result = await checkPostTagById(mockTag.tagId);

            // Assert
            expect(TagModel.findByPk).toHaveBeenCalledWith(mockTag.tagId);
            expect(result).toEqual(mockTag);
        });

        it("Should throw NotFoundException if post tag does not exist", async () => {
            // Arrange
            vi.mocked(TagModel.findByPk).mockResolvedValue(null);

            // Act
            const result = checkPostTagById(999);

            // Assert
            await expect(result).rejects.toThrow(NotFoundException);
            await expect(result).rejects.toThrow(
                "Post tag with id: 999, not found.",
            );
        });

        it("Should throw InternalServerException when an enexpected error occurs", async () => {
            // Arrange
            vi.mocked(TagModel.findByPk).mockRejectedValue(
                new Error("Database crashed"),
            );

            // Act
            const result = checkPostTagById(1);

            // Assert
            await expect(result).rejects.toThrow(InternalServerException);
            await expect(result).rejects.toThrow("Database crashed");
        });
    });

    describe("checkPostTagsByIds", () => {
        it("Should return an array of post tags", async () => {
            // Arrange
            vi.mocked(TagModel.findAll).mockResolvedValue(mockTags);

            // Act
            const result = await checkPostTagsByIds([1, 2]);

            // Assert
            expect(TagModel.findAll).toHaveBeenCalledWith({
                where: {
                    tagId: [1, 2],
                },
            });
            expect(result).toEqual(mockTags);
        });

        it("Should throw InternalServerException when an enexpected error occurs", async () => {
            // Arrange
            vi.mocked(TagModel.findAll).mockRejectedValue(
                new Error("Database crashed"),
            );

            // Act
            const result = checkPostTagsByIds([1, 2]);

            // Assert
            await expect(result).rejects.toThrow(InternalServerException);
            await expect(result).rejects.toThrow("Database crashed");
        });
    });
});
