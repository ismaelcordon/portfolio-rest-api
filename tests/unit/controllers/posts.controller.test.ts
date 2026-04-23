import {
    createPost,
    getAllPosts,
    getPostById,
} from "#controllers/posts.controller.js";
import { NotFoundException } from "#exceptions/not-found.exception.js";
import { sendError, sendSuccess } from "#helpers/response.helper.js";
import {
    findAllPosts,
    findPostById,
    insertNewPost,
} from "#services/posts.service.js";
import { HTTP_STATUSES } from "#utils/constants.utils";
import { Request, Response } from "express";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
    mockCreatePostDto,
    mockPaginatedPostsDto,
    mockPostDto,
} from "../../fixtures/post.fixtures";

vi.mock("#services/posts.service.js", () => ({
    insertNewPost: vi.fn(),
    findPostById: vi.fn(),
    findAllPosts: vi.fn(),
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

    describe("getAllPosts", () => {
        it("Should return paginated posts successfully", async () => {
            // Arrange
            req.query = { page: "1", tag_id: "2" };
            vi.mocked(findAllPosts).mockResolvedValue(mockPaginatedPostsDto);

            // Act
            await getAllPosts(req, res);

            // Assert
            expect(findAllPosts).toHaveBeenCalledWith(1, 2, undefined);
            expect(sendSuccess).toHaveBeenCalledWith(
                res,
                "Posts successfully retrieved",
                mockPaginatedPostsDto,
            );
            expect(sendError).not.toHaveBeenCalled();
        });

        it("Should call findAllPosts without tagId when not provided", async () => {
            // Arrange
            req.query = { page: "1" };
            vi.mocked(findAllPosts).mockResolvedValue(mockPaginatedPostsDto);

            // Act
            await getAllPosts(req, res);

            // Assert
            expect(findAllPosts).toHaveBeenCalledWith(1, undefined, undefined);
            expect(sendSuccess).toHaveBeenCalledWith(
                res,
                "Posts successfully retrieved",
                mockPaginatedPostsDto,
            );
            expect(sendError).not.toHaveBeenCalled();
        });

        it("Should call findAllPosts with search query provided", async () => {
            // Arrange
            const searchQuery = "Ocult";
            req.query = { page: "1", search: searchQuery };
            vi.mocked(findAllPosts).mockResolvedValue(mockPaginatedPostsDto);

            // Act
            await getAllPosts(req, res);

            // Assert
            expect(findAllPosts).toHaveBeenCalledWith(
                1,
                undefined,
                searchQuery,
            );
            expect(sendSuccess).toHaveBeenCalledWith(
                res,
                "Posts successfully retrieved",
                mockPaginatedPostsDto,
            );
            expect(sendError).not.toHaveBeenCalled();
        });

        it("Should default to page 1 when page is not provided", async () => {
            // Arrange
            req.query = {};
            vi.mocked(findAllPosts).mockResolvedValue(mockPaginatedPostsDto);

            // Act
            await getAllPosts(req, res);

            // Assert
            expect(findAllPosts).toHaveBeenCalledWith(1, undefined, undefined);
        });

        it("Should return not found exception response when tagId does not exist", async () => {
            // Arrange
            req.query = { page: "1", tag_id: "999" };
            const notFoundException = new NotFoundException(
                "Tag with id 999 not found",
            );
            vi.mocked(findAllPosts).mockRejectedValue(notFoundException);

            // Act
            await getAllPosts(req, res);

            // Assert
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
            req.query = { page: "1" };
            vi.mocked(findAllPosts).mockRejectedValue(
                new Error("Database crashed"),
            );

            // Act
            await getAllPosts(req, res);

            // Assert
            expect(sendSuccess).not.toHaveBeenCalled();
            expect(sendError).toHaveBeenCalledWith(
                res,
                "Unexpected error",
                "UNKNOWN_ERROR",
            );
        });
    });
});
