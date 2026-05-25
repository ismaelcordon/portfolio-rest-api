import { PostModel } from "#models/sequelize/post.sequelize.js";
import { PostStatus } from "#types/post.types.js";
import { DEFAULT_POST_TITLE } from "#utils/constants.utils";

const DEFAULT_POST_TITLE_SLUG = "without-title";

export const emptyMockPost = {
    postId: 1,
    title: DEFAULT_POST_TITLE,
    titleEs: "",
    description: "",
    descriptionEs: "",
    content: "",
    contentEs: "",
    readingTime: 1,
    slug: "",
    status: PostStatus.DRAFT,
    scheduledAt: null,
    publishedAt: null,
    tagId: 1,
    createdAt: new Date("2026-04-21T10:00:00Z"),
    updatedAt: new Date("2026-04-21T10:00:00Z"),
} as any;

export const mockPost = {
    postId: 1,
    title: DEFAULT_POST_TITLE,
    titleEs: "Sin título",
    description: "Content description",
    descriptionEs: "Descripción del post",
    content: "Post content",
    contentEs: "Contenido del post",
    readingTime: 5,
    status: PostStatus.DRAFT,
    scheduledAt: null,
    publishedAt: null,
    tagId: 1,
    slug: null,
    createdAt: new Date("2026-04-21T10:00:00Z"),
    updatedAt: new Date("2026-04-21T10:00:00Z"),
} as any;

export const publishedMockPost = {
    ...mockPost,
    status: PostStatus.PUBLISHED,
    slug: DEFAULT_POST_TITLE_SLUG,
} as any;

export const emptyPostDto = {
    postId: 1,
    title: DEFAULT_POST_TITLE,
    titleEs: "",
    description: "",
    descriptionEs: "",
    content: "",
    contentEs: "",
    readingTime: 1,
    status: PostStatus.DRAFT,
    scheduledAt: null,
    publishedAt: null,
    slug: null,
    createdAt: new Date("2026-04-21T10:00:00Z"),
    updatedAt: new Date("2026-04-21T10:00:00Z"),
    tag: {
        tagId: 1,
        description: "TypeScript",
    },
};
export const mockPostDto = {
    postId: 1,
    title: "My first post",
    titleEs: "Mi primer post",
    description: "Post description",
    descriptionEs: "Descripción del post",
    content: "Post content",
    contentEs: "Contenido del post",
    readingTime: 5,
    status: PostStatus.DRAFT,
    scheduledAt: null,
    publishedAt: null,
    slug: "my-first-post",
    createdAt: new Date("2026-04-21T10:00:00Z"),
    updatedAt: new Date("2026-04-21T10:00:00Z"),
    tag: {
        tagId: 1,
        description: "TypeScript",
    },
};

export const mockPublishedPostDto = {
    ...mockPostDto,
    status: PostStatus.PUBLISHED,
};

export const mockScheduledPostDto = {
    ...mockPostDto,
    status: PostStatus.SCHEDULED,
} as any;

export const mockCreatePostDto = {
    title: "Mi primer post",
    description: "Descripción del post",
    content: "Contenido del post",
    readingTime: 5,
    status: PostStatus.DRAFT,
    tagId: 1,
};

export const createPostDto = {
    title: "My first post",
    title_es: "Mi primer post",
    description: "Post description",
    description_es: "Descripción del post",
    content: "Post content in english",
    content_es: "Contenido del post",
    reading_time: 5,
    tag_id: 1,
};

export const createTagDTO = {
    description: "TypeScript",
};

export const mockPostList = Array.from({ length: 20 }, (_, i) => ({
    ...mockPost,
    postId: i + 1,
    tagId: i % 2 === 0 ? 1 : 2,
}));

export const mockPaginatedPostsDto = {
    data: Array.from({ length: 20 }, () => ({ ...mockPostDto })),
    meta: {
        total: 40,
        page: 1,
        totalPages: 2,
        hasNextPage: true,
        hasPrevPage: false,
    },
};

export const mockHiddenPost = {
    ...mockPost,
    status: PostStatus.HIDDEN,
} as any;

export const postModelArray = () => [
    PostModel.create({
        title: "Published post 1",
        description: createPostDto.description,
        content: createPostDto.content,
        readingTime: createPostDto.reading_time,
        status: PostStatus.PUBLISHED,
        tagId: 1,
    }),
    PostModel.create({
        title: "Published post 2",
        description: createPostDto.description,
        content: createPostDto.content,
        readingTime: createPostDto.reading_time,
        status: PostStatus.PUBLISHED,
        tagId: 1,
    }),
    PostModel.create({
        title: "Draft post",
        description: createPostDto.description,
        content: createPostDto.content,
        readingTime: createPostDto.reading_time,
        status: PostStatus.DRAFT,
        tagId: 1,
    }),
    PostModel.create({
        title: "Hidden post",
        description: createPostDto.description,
        content: createPostDto.content,
        readingTime: createPostDto.reading_time,
        status: PostStatus.HIDDEN,
        tagId: 1,
    }),
];

export const mockPublishedPost = {
    postId: 1,
    title: "Mi primer post",
    description: "Descripción del post",
    content: "Contenido del post",
    readingTime: 5,
    status: PostStatus.PUBLISHED,
    scheduledAt: null,
    publishedAt: new Date("2026-04-21T10:00:00Z"),
    tagId: 1,
    createdAt: new Date("2026-04-21T10:00:00Z"),
    updatedAt: new Date("2026-04-21T10:00:00Z"),
} as any;

export const mockScheduledPost = {
    ...mockPost,
    status: PostStatus.SCHEDULED,
    scheduledAt: new Date("2026-05-01T10:00:00Z"),
} as any;

export const currentDatePlus3Hours = new Date(
    new Date().getTime() + 3 * 60 * 60 * 1000,
).toISOString();

export const mockDraftPost = {
    ...mockPost,
    status: PostStatus.DRAFT,
};

export const updatePostDto = {
    title: "Updated post title",
    titleEs: "Título de post actualizado",
    description: "Updated post description",
    descriptionEs: "Descripción de post actualizado",
    content: "Updated post content",
    contentEs: "Contenido de post actualizado",
    readingTime: 8,
    status: PostStatus.DRAFT,
    tagId: 1,
} as any;

export const updatePostRequestDto = {
    title: "Updated post title",
    title_es: "Título del post actualizado",
    description: "Updated post description",
    description_es: "Descripcion del post actualizada",
    content: "Updated post content",
    content_es: "Contenido del post actualizado",
    reading_time: 8,
    tag_id: 1,
};

export const mockPublicPostDto = {
    slug: "my-first-post",
    title: "My first post",
    description: "Post description",
    content: "Post content",
    readingTime: 5,
    publishedAt: new Date("2026-04-21T10:00:00Z"),
    tag: "TypeScript",
};
