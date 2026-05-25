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
import { PostStatus } from "#types/post.types.js";

export class PostModel extends Model<
    InferAttributes<PostModel>,
    InferCreationAttributes<PostModel>
> {
    declare postId: CreationOptional<number>;
    declare title: string;
    declare titleEs: CreationOptional<string | null>;
    declare description: CreationOptional<string | null>;
    declare descriptionEs: CreationOptional<string | null>;
    declare content: CreationOptional<string | null>;
    declare contentEs: CreationOptional<string | null>;
    declare readingTime: number;
    declare status: PostStatus;
    declare scheduledAt: CreationOptional<Date | null>;
    declare publishedAt: CreationOptional<Date | null>;
    declare createdAt: CreationOptional<Date>;
    declare updatedAt: CreationOptional<Date>;
    declare slug: CreationOptional<string | null>;
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
        titleEs: {
            type: DataTypes.STRING,
            allowNull: true,
            field: "title_es",
        },
        description: {
            type: DataTypes.STRING,
            allowNull: true,
            field: "description",
        },
        descriptionEs: {
            type: DataTypes.STRING,
            allowNull: true,
            field: "description_es",
        },
        content: {
            type: DataTypes.TEXT,
            allowNull: true,
            field: "content",
        },
        contentEs: {
            type: DataTypes.TEXT,
            allowNull: true,
            field: "content_es",
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
        slug: {
            type: DataTypes.STRING,
            allowNull: true,
            field: "slug",
        },
        tagId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            field: "tag_id",
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
