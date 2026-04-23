import {
    CreationOptional,
    DataTypes,
    InferAttributes,
    InferCreationAttributes,
    Model,
} from "sequelize";
import { sequelize } from "#config/database.config.js";

export class TagModel extends Model<
    InferAttributes<TagModel>,
    InferCreationAttributes<TagModel>
> {
    declare tagId: CreationOptional<number>;
    declare description: string;
    declare createdAt: CreationOptional<Date>;
}

TagModel.init(
    {
        tagId: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            field: "post_tag_id",
        },
        description: {
            type: DataTypes.STRING,
            allowNull: false,
            field: "description",
        },
        createdAt: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW,
            field: "created_at",
        },
    },
    {
        sequelize,
        schema: "dbo",
        tableName: "post_tags",
        timestamps: true,
        updatedAt: false,
        underscored: false,
        modelName: "Tag",
    },
);
