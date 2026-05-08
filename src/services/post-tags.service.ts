import { toTagDto } from "#mappers/tag.mapper.js";
import { TagModel } from "#models/sequelize/post-tag.sequelize";
import { NotFoundException } from "#exceptions/not-found.exception";
import { handleServiceError } from "#helpers/error.helper.js";

export const findAllTags = async () => {
    try {
        const tags = await TagModel.findAll();
        return tags.map((tagModel) => toTagDto(tagModel));
    } catch (error) {
        return handleServiceError(error);
    }
};

export const findFirstTag = async () => {
    try {
        const tag = await TagModel.findOne({
            order: [["tagId", "ASC"]],
        });

        if (!tag) {
            throw new NotFoundException("No tags found");
        }

        return tag;
    } catch (error) {
        return handleServiceError(error);
    }
};

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
        return handleServiceError(error);
    }
};

export const checkPostTagsByIds = async (tagIds: number[]) => {
    try {
        const tags = await TagModel.findAll({
            where: { tagId: tagIds },
        });
        return tags;
    } catch (error) {
        return handleServiceError(error);
    }
};
