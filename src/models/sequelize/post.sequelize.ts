import {
    CreationOptional,
    DataTypes,
    ForeignKey,
    InferAttributes,
    InferCreationAttributes,
    Model,
} from "sequelize";
import { sequelize } from "#config/database.config.js";
import { TagModel } from "#models/sequelize/post-tag.sequelize.js";
import { PostStatus } from "#types/post.types";

export class PostModel extends Model<
    InferAttributes<PostModel>,
    InferCreationAttributes<PostModel>
> {
    declare postId: CreationOptional<number>;

    declare title: string;
    declare description: CreationOptional<string | null>;
    declare content: CreationOptional<string | null>;
    declare readingTime: number;

    declare status: PostStatus;

    declare scheduledAt: CreationOptional<Date | null>;
    declare publishedAt: CreationOptional<Date | null>;

    declare createdAt: CreationOptional<Date>;
    declare updatedAt: CreationOptional<Date>;

    declare tagId: ForeignKey<TagModel["tagId"]>;
}

PostModel.init(
    {
        postId: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            field: "post_id",
        },
        title: {
            type: DataTypes.STRING,
            allowNull: false,
            field: "title",
        },
        description: {
            type: DataTypes.STRING,
            allowNull: true,
            field: "description",
        },
        content: {
            type: DataTypes.STRING,
            allowNull: true,
            field: "content",
        },
        readingTime: {
            type: DataTypes.INTEGER,
            allowNull: false,
            field: "reading_time",
        },
        status: {
            type: DataTypes.ENUM(...Object.values(PostStatus)),
            allowNull: false,
            field: "status",
        },
        scheduledAt: {
            type: DataTypes.DATE,
            allowNull: true,
            field: "scheduled_at",
        },
        publishedAt: {
            type: DataTypes.DATE,
            allowNull: true,
            field: "published_at",
        },
        tagId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            field: "tag_id",
        },
        createdAt: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW,
            field: "created_at",
        },
        updatedAt: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW,
            field: "updated_at",
        },
    },
    {
        sequelize,
        schema: "dbo",
        tableName: "posts",
        timestamps: true,
        underscored: false,
        modelName: "Post",
    },
);
