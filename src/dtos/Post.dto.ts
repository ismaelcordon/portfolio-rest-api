import { PostStatus } from "#types/post.types";

export class CreatePostResponseDto {
    postId!: number;
    title!: string;
    description!: string;
    content!: string;
    readingTime!: number;
    status!: PostStatus;
    scheduledAt!: Date | null;
    publishedAt!: Date | null;
    createdAt!: Date;
    updatedAt!: Date;
    tag!: {
        tagId: number;
        description: string;
    };
}
