import { PostModel } from "#models/sequelize/post.sequelize.js";
import { TagModel } from "#models/sequelize/post-tag.sequelize.js";

PostModel.belongsTo(TagModel, {
    foreignKey: "tagId",
    as: "tag",
});

TagModel.hasMany(PostModel, {
    foreignKey: "tagId",
    as: "posts",
});
