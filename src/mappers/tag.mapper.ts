import { TagDto } from "#dtos/Tag.dto.js";
import { TagModel } from "#models/sequelize/post-tag.sequelize.js";

export const toTagDto = (tagModel: TagModel): TagDto => ({
    tagId: tagModel.tagId,
    description: tagModel.description,
});
