import { PostStatus } from "#types/post.types";

export const mockPost = {
    postId: 1,
    title: "Mi primer post",
    description: "Descripción del post",
    content: "Contenido del post",
    readingTime: 5,
    status: PostStatus.DRAFT,
    scheduledAt: null,
    publishedAt: null,
    tagId: 1,
    createdAt: new Date("2026-04-21T10:00:00Z"),
    updatedAt: new Date("2026-04-21T10:00:00Z"),
} as any;

export const mockPostDto = {
    postId: 1,
    title: "Mi primer post",
    description: "Descripción del post",
    content: "Contenido del post",
    readingTime: 5,
    status: PostStatus.DRAFT,
    scheduledAt: null,
    publishedAt: null,
    createdAt: new Date("2026-04-21T10:00:00Z"),
    updatedAt: new Date("2026-04-21T10:00:00Z"),
    tag: {
        tagId: 1,
        description: "TypeScript",
    },
};

export const mockCreatePostDto = {
    title: "Mi primer post",
    description: "Descripción del post",
    content: "Contenido del post",
    readingTime: 5,
    status: PostStatus.DRAFT,
    tagId: 1,
};

export const createPostDto = {
    title: "Mi primer post",
    description: "Descripción del post",
    content: "Contenido del post",
    reading_time: 5,
    tag_id: 1,
};

export const createPostDtoWithInvalidTagId = {
    title: "Mi primer post",
    description: "Descripción del post",
    content: "Contenido del post",
    reading_time: 5,
    tag_id: 999,
};

export const createTagDTO = {
    description: "TypeScript",
};
