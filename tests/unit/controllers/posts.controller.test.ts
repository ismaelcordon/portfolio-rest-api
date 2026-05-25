import {
    createPost,
    deletePost,
    getAllPosts,
    getPostById,
    changePostVisibility,
    publishPost,
    schedulePost,
    updatePost,
    getPostBySlug,
} from "#controllers/posts.controller.js";
import { NotFoundException } from "#exceptions/not-found.exception.js";
import { sendSuccess, sendError } from "#helpers/response.helper.js";
import {
    destroyPost,
    findAllPosts,
    findPostById,
    insertNewPost,
    updatePostEditableFieldsAndOptionallyPublish,
    updatePostVisibility,
    updatePostToPublished,
    updatePostToScheduled,
    findPostBySlug,
} from "#services/posts.service.js";
import { HTTP_STATUSES } from "#utils/constants.utils.js";
import { Request, Response } from "express";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
    emptyPostDto,
    mockCreatePostDto,
    mockPaginatedPostsDto,
    mockPostDto,
    mockPublishedPost,
    mockPublishedPostDto,
    mockPublicPostDto,
    updatePostDto,
} from "../../fixtures/post.fixtures";
import { ConflictException } from "#exceptions/conflict.exception.js";

vi.mock("#services/posts.service.js", () => ({
    insertNewPost: vi.fn(),
    findPostById: vi.fn(),
    findPostBySlug: vi.fn(),
    findAllPosts: vi.fn(),
    updatePostVisibility: vi.fn(),
    destroyPost: vi.fn(),
    updatePostToPublished: vi.fn(),
    updatePostToScheduled: vi.fn(),
    updatePostEditableFieldsAndOptionallyPublish: vi.fn(),
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
            query: {},
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
            expect(findAllPosts).toHaveBeenCalledWith(1, "en", 2, undefined, false);
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
            expect(findAllPosts).toHaveBeenCalledWith(1, "en", 2, undefined, true);
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
                "en",
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
                "en",
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
                "en",
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
            vi.mocked(insertNewPost).mockResolvedValue(emptyPostDto);

            // Act
            await createPost(req, res);

            // Assert
            expect(insertNewPost).toHaveBeenCalledOnce();
            expect(sendSuccess).toHaveBeenCalledWith(
                res,
                "Post created successfully",
                emptyPostDto,
                HTTP_STATUSES.CREATED,
            );
            expect(sendError).not.toHaveBeenCalled();
        });

        it("Should return controlled error response when service throws CustomException", async () => {
            // Arrange
            const notFoundException = new NotFoundException(
                `Post tag with id ${emptyPostDto.tag.tagId} not found`,
            );
            vi.mocked(insertNewPost).mockRejectedValue(notFoundException);

            // Act
            await createPost(req, res);

            // Assert
            expect(insertNewPost).toHaveBeenCalled();
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
            expect(insertNewPost).toHaveBeenCalledOnce();
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

    describe("getPostBySlug", () => {
        it("Should return the post with the specified slug", async () => {
            // Arrange
            req.params = { slug: "without-title" };
            vi.mocked(findPostBySlug).mockResolvedValue(mockPublicPostDto as any);

            // Act
            await getPostBySlug(req, res);

            // Assert
            expect(findPostBySlug).toHaveBeenCalledWith("without-title", "en");
            expect(sendSuccess).toHaveBeenCalledWith(
                res,
                "Post successfully retrieved",
                mockPublicPostDto,
            );
            expect(sendError).not.toHaveBeenCalled();
        });

        it("Should return controlled error response when service throws CustomException", async () => {
            // Arrange
            const notFoundException = new NotFoundException(
                `Post with slug: "${mockPublishedPostDto.postId}" does not found`,
            );
            req.params = { slug: "XXXXXXXXXXXX" };
            vi.mocked(findPostBySlug).mockRejectedValue(notFoundException);

            // Act
            await getPostBySlug(req, res);

            // Assert
            expect(findPostBySlug).toHaveBeenCalledWith("XXXXXXXXXXXX", "en");
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
            vi.mocked(findPostBySlug).mockRejectedValue(
                new Error("Database crashed"),
            );
            req.params = { slug: "XXXXXXXXXXXX" };

            // Act
            await getPostBySlug(req, res);

            // Assert
            expect(findPostBySlug).toHaveBeenCalledWith("XXXXXXXXXXXX", "en");
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
            vi.mocked(updatePostVisibility).mockResolvedValue(
                mockPublishedPost,
            );

            // Act
            await changePostVisibility(req, res);

            // Assert
            expect(updatePostVisibility).toHaveBeenCalledWith(1);
            expect(sendSuccess).toHaveBeenCalledWith(
                res,
                "Post visibility successfully changed",
            );
            expect(sendError).not.toHaveBeenCalled();
        });

        it("Should return Conflict Extension when post has scheduled or draft status", async () => {
            // Arrange
            req.params = { id: "1" };
            const conflictException = new ConflictException(
                "Post with id 1 cannot be hidden. Post needs to be published",
            );
            vi.mocked(updatePostVisibility).mockRejectedValue(
                conflictException,
            );

            // Act
            await changePostVisibility(req, res);

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
            vi.mocked(updatePostVisibility).mockRejectedValue(
                new Error("Database crashed"),
            );

            // Act
            await changePostVisibility(req, res);

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

    describe("UpdatePost", async () => {
        it("Should return Not Found exception response when service does not found post in database", async () => {
            // Arrange
            req.params = { id: "999" };
            req.body = updatePostDto;
            req.query = {};

            const notFoundException = new NotFoundException(
                "Post with id 999 not found",
            );

            vi.mocked(
                updatePostEditableFieldsAndOptionallyPublish,
            ).mockRejectedValue(notFoundException);

            // Act
            await updatePost(req, res);

            // Assert
            expect(
                updatePostEditableFieldsAndOptionallyPublish,
            ).toHaveBeenCalledWith(999, updatePostDto, false);
            expect(sendSuccess).not.toHaveBeenCalled();
            expect(sendError).toHaveBeenCalledWith(
                res,
                notFoundException.message,
                notFoundException.code,
                null,
                notFoundException.statusCode,
            );
        });

        it("Should return Conflict exception response when service find an already published post", async () => {
            // Arrange
            req.params = { id: "1" };
            req.body = updatePostDto;
            req.query = {};

            const conflictException = new ConflictException(
                "Post with id 1 cannot be updated because it is already published",
            );

            vi.mocked(
                updatePostEditableFieldsAndOptionallyPublish,
            ).mockRejectedValue(conflictException);

            // Act
            await updatePost(req, res);

            // Assert
            expect(
                updatePostEditableFieldsAndOptionallyPublish,
            ).toHaveBeenCalledWith(1, updatePostDto, false);
            expect(sendSuccess).not.toHaveBeenCalled();
            expect(sendError).toHaveBeenCalledWith(
                res,
                conflictException.message,
                conflictException.code,
                null,
                conflictException.statusCode,
            );
        });

        it("Should update post successfully", async () => {
            // Arrange
            req.params = { id: "1" };
            req.body = updatePostDto;
            req.query = {};

            vi.mocked(
                updatePostEditableFieldsAndOptionallyPublish,
            ).mockResolvedValue(undefined);

            // Act
            await updatePost(req, res);

            // Assert
            expect(
                updatePostEditableFieldsAndOptionallyPublish,
            ).toHaveBeenCalledWith(1, updatePostDto, false);
            expect(sendSuccess).toHaveBeenCalledWith(
                res,
                "Post successfully updated",
            );
            expect(sendError).not.toHaveBeenCalled();
        });

        it("Should return internal server error response when service throws unexpected error", async () => {
            // Arrange
            req.params = { id: "1" };
            req.body = updatePostDto;
            req.query = {};

            vi.mocked(
                updatePostEditableFieldsAndOptionallyPublish,
            ).mockRejectedValue(new Error("Database crashed"));

            // Act
            await updatePost(req, res);

            // Assert
            expect(
                updatePostEditableFieldsAndOptionallyPublish,
            ).toHaveBeenCalledWith(1, updatePostDto, false);
            expect(sendSuccess).not.toHaveBeenCalled();
            expect(sendError).toHaveBeenCalledWith(
                res,
                "Unexpected error",
                "UNKNOWN_ERROR",
            );
        });
    });
});
