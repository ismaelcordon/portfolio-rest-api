import { PostStatus } from "#types/post.types";

export class CreatePostResponseDto {
    postId!: number;
    title!: string;
    description!: string | null;
    content!: string | null;
    readingTime!: number;
    status!: PostStatus;
    scheduledAt!: Date | null;
    publishedAt!: Date | null;
    createdAt!: Date;
    updatedAt!: Date;
    tag!: { tagId: number; description: string } | null;
}
