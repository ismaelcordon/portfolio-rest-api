import { createPost, getPostById } from "#controllers/posts.controller.js";
import { NotFoundException } from "#exceptions/not-found.exception.js";
import { sendError, sendSuccess } from "#helpers/response.helper.js";
import { findPostById, insertNewPost } from "#services/posts.service.js";
import { HTTP_STATUSES } from "#utils/constants.utils";
import { Request, Response } from "express";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { mockCreatePostDto, mockPostDto } from "../../fixtures/post.fixtures";

vi.mock("#services/posts.service.js", () => ({
    insertNewPost: vi.fn(),
    findPostById: vi.fn(),
}));

vi.mock("#helpers/response.helper.js", () => ({
    sendSuccess: vi.fn(),
    sendError: vi.fn(),
}));

describe("post.controller", () => {
    let req: Request;
    let res: Response;

    beforeEach(() => {
        vi.clearAllMocks();

        req = {
            body: mockCreatePostDto,
        } as Request;

        res = {} as Response;
    });

    describe("createPost", () => {
        it("Should create a new post and return success response", async () => {
            // Arrange
            vi.mocked(insertNewPost).mockResolvedValue(mockPostDto);

            // Act
            await createPost(req, res);

            // Assert
            expect(insertNewPost).toHaveBeenCalledWith(mockCreatePostDto);
            expect(sendSuccess).toHaveBeenCalledWith(
                res,
                "Post created successfully",
                mockPostDto,
                HTTP_STATUSES.CREATED,
            );
            expect(sendError).not.toHaveBeenCalled();
        });

        it("Should return controlled error response when service throws CustomException", async () => {
            // Arrange
            const notFoundException = new NotFoundException(
                `Post tag with id ${mockCreatePostDto.tagId} not found`,
            );
            vi.mocked(insertNewPost).mockRejectedValue(notFoundException);

            // Act
            await createPost(req, res);

            // Assert
            expect(insertNewPost).toHaveBeenCalledWith(mockCreatePostDto);
            expect(sendSuccess).not.toHaveBeenCalled();
            expect(sendError).toHaveBeenCalledWith(
                res,
                notFoundException.message,
                notFoundException.code,
                null,
                notFoundException.statusCode,
            );
        });

        it("Should return internal server error response when service throws unexpected error", async () => {
            // Arrange
            vi.mocked(insertNewPost).mockRejectedValue(
                new Error("Database crashed"),
            );

            // Act
            await createPost(req, res);

            // Assert
            expect(insertNewPost).toHaveBeenCalledWith(mockCreatePostDto);
            expect(sendSuccess).not.toHaveBeenCalled();
            expect(sendError).toHaveBeenCalledWith(
                res,
                "Unexpected error",
                "UNKNOWN_ERROR",
            );
        });
    });

    describe("getPostById", () => {
        it("Should return the post with the specified id", async () => {
            // Arrange
            req.params = { id: "1" };
            vi.mocked(findPostById).mockResolvedValue(mockPostDto);

            // Act
            await getPostById(req, res);

            // Assert
            expect(findPostById).toHaveBeenCalledWith(mockPostDto.postId);
            expect(sendSuccess).toHaveBeenCalledWith(
                res,
                "Post successfully retrieved",
                mockPostDto,
            );
            expect(sendError).not.toHaveBeenCalled();
        });

        it("Should return controlled error response when service throws CustomException", async () => {
            // Arrange
            const notFoundException = new NotFoundException(
                `Post tag with id ${mockCreatePostDto.tagId} not found`,
            );
            req.params = { id: "999" };
            vi.mocked(findPostById).mockRejectedValue(notFoundException);

            // Act
            await getPostById(req, res);

            // Assert
            expect(findPostById).toHaveBeenCalledWith(999);
            expect(sendSuccess).not.toHaveBeenCalled();
            expect(sendError).toHaveBeenCalledWith(
                res,
                notFoundException.message,
                notFoundException.code,
                null,
                notFoundException.statusCode,
            );
        });

        it("Should return internal server error response when service throws unexpected error", async () => {
            // Arrange
            vi.mocked(findPostById).mockRejectedValue(
                new Error("Database crashed"),
            );
            req.params = { id: "1" };

            // Act
            await getPostById(req, res);

            // Assert
            expect(findPostById).toHaveBeenCalledWith(1);
            expect(sendSuccess).not.toHaveBeenCalled();
            expect(sendError).toHaveBeenCalledWith(
                res,
                "Unexpected error",
                "UNKNOWN_ERROR",
            );
        });
    });
});
