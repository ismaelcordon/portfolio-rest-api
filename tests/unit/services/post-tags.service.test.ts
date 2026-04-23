import { InternalServerException } from "#exceptions/internal-server.exception.js";
import { NotFoundException } from "#exceptions/not-found.exception.js";
import { TagModel } from "#models/sequelize/post-tag.sequelize.js";
import {
    checkPostTagById,
    checkPostTagsByIds,
} from "#services/post-tags.service.js";
import { describe } from "node:test";
import { expect, it, vi } from "vitest";
import { mockTag, mockTags } from "../../fixtures/post-tags.fixtures.js";

vi.mock("#models/sequelize/post-tag.sequelize.js", () => {
    return {
        TagModel: {
            findByPk: vi.fn(),
            findAll: vi.fn(),
        },
    };
});

describe("post-tags.service", () => {
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
