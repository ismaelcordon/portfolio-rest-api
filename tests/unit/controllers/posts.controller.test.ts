import {
    createPost,
    deletePost,
    getAllPosts,
    getPostById,
    hidePost,
    publishPost,
    schedulePost,
} from "#controllers/posts.controller.js";
import { NotFoundException } from "#exceptions/not-found.exception.js";
import { sendError, sendSuccess } from "#helpers/response.helper.js";
import {
    destroyPost,
    findAllPosts,
    findPostById,
    insertNewPost,
    updatePostToHidden,
    updatePostToPublished,
    updatePostToScheduled,
} from "#services/posts.service.js";
import { HTTP_STATUSES } from "#utils/constants.utils.js";
import { Request, Response } from "express";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
    mockCreatePostDto,
    mockPaginatedPostsDto,
    mockPostDto,
} from "../../fixtures/post.fixtures";
import { ConflictException } from "#exceptions/conflict.exception.js";

vi.mock("#services/posts.service.js", () => ({
    insertNewPost: vi.fn(),
    findPostById: vi.fn(),
    findAllPosts: vi.fn(),
    updatePostToHidden: vi.fn(),
    destroyPost: vi.fn(),
    updatePostToPublished: vi.fn(),
    updatePostToScheduled: vi.fn(),
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

        res = {
            locals: {
                isAdmin: false,
            },
        } as unknown as Response;
    });

    describe("getAllPosts", () => {
        it("Should return paginated posts successfully with isAdmin is false when not admin", async () => {
            // Arrange
            req.query = { page: "1", tag_id: "2" };
            vi.mocked(findAllPosts).mockResolvedValue(mockPaginatedPostsDto);

            // Act
            await getAllPosts(req, res);

            // Assert
            expect(findAllPosts).toHaveBeenCalledWith(1, 2, undefined, false);
            expect(sendSuccess).toHaveBeenCalledWith(
                res,
                "Posts successfully retrieved",
                mockPaginatedPostsDto,
            );
            expect(sendError).not.toHaveBeenCalled();
        });

        it("Should return paginated posts successfully with isAdmin is true when admin", async () => {
            // Arrange
            req.query = { page: "1", tag_id: "2" };
            res.locals.isAdmin = true;
            vi.mocked(findAllPosts).mockResolvedValue(mockPaginatedPostsDto);

            // Act
            await getAllPosts(req, res);

            // Assert
            expect(findAllPosts).toHaveBeenCalledWith(1, 2, undefined, true);
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
            expect(findAllPosts).toHaveBeenCalledWith(
                1,
                undefined,
                undefined,
                false,
            );
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
                false,
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
            expect(findAllPosts).toHaveBeenCalledWith(
                1,
                undefined,
                undefined,
                false,
            );
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
        it("Should return the post with the specified id with isAdmin false when not admin", async () => {
            // Arrange
            req.params = { id: "1" };
            vi.mocked(findPostById).mockResolvedValue(mockPostDto);

            // Act
            await getPostById(req, res);

            // Assert
            expect(findPostById).toHaveBeenCalledWith(
                mockPostDto.postId,
                false,
            );
            expect(sendSuccess).toHaveBeenCalledWith(
                res,
                "Post successfully retrieved",
                mockPostDto,
            );
            expect(sendError).not.toHaveBeenCalled();
        });

        it("Should return the post with the specified id with isAdmin true when admin", async () => {
            // Arrange
            req.params = { id: "1" };
            res.locals.isAdmin = true;
            vi.mocked(findPostById).mockResolvedValue(mockPostDto);

            // Act
            await getPostById(req, res);

            // Assert
            expect(findPostById).toHaveBeenCalledWith(mockPostDto.postId, true);
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
            expect(findPostById).toHaveBeenCalledWith(999, false);
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
            expect(findPostById).toHaveBeenCalledWith(1, false);
            expect(sendSuccess).not.toHaveBeenCalled();
            expect(sendError).toHaveBeenCalledWith(
                res,
                "Unexpected error",
                "UNKNOWN_ERROR",
            );
        });
    });

    describe("hidePost", () => {
        it("Should hide a post successfully", async () => {
            // Arrange
            req.params = { id: "1" };
            vi.mocked(updatePostToHidden).mockResolvedValue();

            // Act
            await hidePost(req, res);

            // Assert
            expect(updatePostToHidden).toHaveBeenCalledWith(1);
            expect(sendSuccess).toHaveBeenCalledWith(
                res,
                "Post hidden successfully",
            );
            expect(sendError).not.toHaveBeenCalled();
        });

        it("Should return controlled error response when service throws CustomException", async () => {
            // Arrange
            req.params = { id: "1" };
            const conflictException = new ConflictException(
                "Post with id 1 is already hidden",
            );
            vi.mocked(updatePostToHidden).mockRejectedValue(conflictException);

            // Act
            await hidePost(req, res);

            // Assert
            expect(sendSuccess).not.toHaveBeenCalled();
            expect(sendError).toHaveBeenCalledWith(
                res,
                conflictException.message,
                conflictException.code,
                null,
                conflictException.statusCode,
            );
        });

        it("Should return internal server error response when service throws unexpected error", async () => {
            // Arrange
            req.params = { id: "1" };
            vi.mocked(updatePostToHidden).mockRejectedValue(
                new Error("Database crashed"),
            );

            // Act
            await hidePost(req, res);

            // Assert
            expect(sendSuccess).not.toHaveBeenCalled();
            expect(sendError).toHaveBeenCalledWith(
                res,
                "Unexpected error",
                "UNKNOWN_ERROR",
            );
        });
    });

    describe("deletePost", () => {
        it("Should delete a post successfully and return 204", async () => {
            // Arrange
            req.params = { id: "1" };
            const statusMock = { send: vi.fn() };
            (res as any).status = vi.fn().mockReturnValue(statusMock);
            vi.mocked(destroyPost).mockResolvedValue();

            // Act
            await deletePost(req, res);

            // Assert
            expect(destroyPost).toHaveBeenCalledWith(1);
            expect(res.status).toHaveBeenCalledWith(HTTP_STATUSES.NO_CONTENT);
            expect(statusMock.send).toHaveBeenCalled();
            expect(sendError).not.toHaveBeenCalled();
        });

        it("Should return controlled error response when service throws CustomException", async () => {
            // Arrange
            req.params = { id: "999" };
            const notFoundException = new NotFoundException(
                "Post with id 999 not found",
            );
            vi.mocked(destroyPost).mockRejectedValue(notFoundException);

            // Act
            await deletePost(req, res);

            // Assert
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
            req.params = { id: "1" };
            vi.mocked(destroyPost).mockRejectedValue(
                new Error("Database crashed"),
            );

            // Act
            await deletePost(req, res);

            // Assert
            expect(sendSuccess).not.toHaveBeenCalled();
            expect(sendError).toHaveBeenCalledWith(
                res,
                "Unexpected error",
                "UNKNOWN_ERROR",
            );
        });
    });

    describe("publishPost", () => {
        it("Should publish a post successfully", async () => {
            // Arrange
            req.params = { id: "1" };
            vi.mocked(updatePostToPublished).mockResolvedValue(undefined);

            // Act
            await publishPost(req, res);

            // Assert
            expect(updatePostToPublished).toHaveBeenCalledWith(1);
            expect(sendSuccess).toHaveBeenCalledWith(
                res,
                "Post published successfully",
            );
            expect(sendError).not.toHaveBeenCalled();
        });

        it("Should return controlled error response when service throws ConflictException", async () => {
            // Arrange
            req.params = { id: "1" };
            const conflictException = new ConflictException(
                "Post with id 1 is already published",
            );
            vi.mocked(updatePostToPublished).mockRejectedValue(
                conflictException,
            );

            // Act
            await publishPost(req, res);

            // Assert
            expect(sendSuccess).not.toHaveBeenCalled();
            expect(sendError).toHaveBeenCalledWith(
                res,
                conflictException.message,
                conflictException.code,
                null,
                conflictException.statusCode,
            );
        });

        it("Should return controlled error response when service throws NotFoundException", async () => {
            // Arrange
            req.params = { id: "999" };
            const notFoundException = new NotFoundException(
                "Post with id 999 not found",
            );
            vi.mocked(updatePostToPublished).mockRejectedValue(
                notFoundException,
            );

            // Act
            await publishPost(req, res);

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
            req.params = { id: "1" };
            vi.mocked(updatePostToPublished).mockRejectedValue(
                new Error("Database crashed"),
            );

            // Act
            await publishPost(req, res);

            // Assert
            expect(sendSuccess).not.toHaveBeenCalled();
            expect(sendError).toHaveBeenCalledWith(
                res,
                "Unexpected error",
                "UNKNOWN_ERROR",
            );
        });
    });

    describe("schedulePost", () => {
        it("Should schedule a post successfully", async () => {
            // Arrange
            req.params = { id: "1" };
            req.body = { scheduledAt: "2026-05-01T12:00:00+02:00" };
            vi.mocked(updatePostToScheduled).mockResolvedValue(undefined);

            // Act
            await schedulePost(req, res);

            // Assert
            expect(updatePostToScheduled).toHaveBeenCalledWith(
                1,
                "2026-05-01T12:00:00+02:00",
            );
            expect(sendSuccess).toHaveBeenCalledWith(
                res,
                "Post scheduled successfully",
            );
            expect(sendError).not.toHaveBeenCalled();
        });

        it("Should return controlled error response when service throws ConflictException", async () => {
            // Arrange
            req.params = { id: "1" };
            req.body = { scheduledAt: "2026-05-01T12:00:00+02:00" };
            const conflictException = new ConflictException(
                "Post with id 1 cannot be scheduled",
            );
            vi.mocked(updatePostToScheduled).mockRejectedValue(
                conflictException,
            );

            // Act
            await schedulePost(req, res);

            // Assert
            expect(sendSuccess).not.toHaveBeenCalled();
            expect(sendError).toHaveBeenCalledWith(
                res,
                conflictException.message,
                conflictException.code,
                null,
                conflictException.statusCode,
            );
        });

        it("Should return controlled error response when service throws NotFoundException", async () => {
            // Arrange
            req.params = { id: "999" };
            req.body = { scheduledAt: "2026-05-01T12:00:00+02:00" };
            const notFoundException = new NotFoundException(
                "Post with id 999 not found",
            );
            vi.mocked(updatePostToScheduled).mockRejectedValue(
                notFoundException,
            );

            // Act
            await schedulePost(req, res);

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
            req.params = { id: "1" };
            req.body = { scheduledAt: "2026-05-01T12:00:00+02:00" };
            vi.mocked(updatePostToScheduled).mockRejectedValue(
                new Error("Database crashed"),
            );

            // Act
            await schedulePost(req, res);

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
