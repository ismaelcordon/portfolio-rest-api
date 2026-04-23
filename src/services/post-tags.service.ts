import { TagModel } from "#models/sequelize/post-tag.sequelize";
import { CustomException } from "../exceptions/custom.exception";
import { InternalServerException } from "../exceptions/internal-server.exception";
import { NotFoundException } from "../exceptions/not-found.exception";

export const checkPostTagById = async (postTagId: number) => {
    try {
        const postTag = await TagModel.findByPk(postTagId);

        if (!postTag) {
            throw new NotFoundException(
                `Post tag with id: ${postTagId}, not found.`,
            );
        }

        return postTag;
    } catch (error) {
        if (error instanceof CustomException) throw error;
        throw new InternalServerException(
            error instanceof Error ? error.message : "Unexpected error",
        );
    }
};

export const checkPostTagsByIds = async (tagIds: number[]) => {
    try {
        const tags = await TagModel.findAll({
            where: { tagId: tagIds },
        });
        return tags;
    } catch (error) {
        throw new InternalServerException(
            error instanceof Error ? error.message : "Unexpected error",
        );
    }
};
