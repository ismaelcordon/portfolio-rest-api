import { PostStatus } from "#types/post.types.js";

export class PostDto {
    postId!: number;
    title!: string;
    titleEs!: string | null;
    description!: string | null;
    descriptionEs!: string | null;
    content!: string | null;
    contentEs!: string | null;
    slug!: string | null;
    readingTime!: number;
    status!: PostStatus;
    scheduledAt!: Date | null;
    publishedAt!: Date | null;
    createdAt!: Date;
    updatedAt!: Date;
    tag!: { tagId: number; description: string } | null;
}
