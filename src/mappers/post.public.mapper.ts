import { PublicPostDto } from "#dtos/PublicPost.dto.js";
import { TagModel } from "#models/sequelize/post-tag.sequelize.js";
import { PostModel } from "#models/sequelize/post.sequelize.js";

export function mapPostToPublicDto(
    post: PostModel,
    language: string,
    tag: TagModel,
): PublicPostDto {
    return {
        slug: post.slug,
        title: language === "es" && post.titleEs ? post.titleEs : post.title,
        description:
            language === "es" && post.descriptionEs
                ? post.descriptionEs
                : post.description,
        content:
            language === "es" && post.contentEs ? post.contentEs : post.content,
        readingTime: post.readingTime,
        publishedAt: post.publishedAt!,
        tag: tag.description,
    };
}
