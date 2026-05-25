export class PublicPostDto {
    title!: string;
    description!: string | null;
    content!: string | null;
    slug!: string | null;
    readingTime!: number;
    publishedAt!: Date;
    tag!: string;
}
