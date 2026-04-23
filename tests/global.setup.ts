import { sequelize } from "#config/database.config.js";

import "#models/sequelize/associations.js";

export default async function () {
    await sequelize.authenticate();

    await sequelize.query('DROP SCHEMA IF EXISTS "dbo" CASCADE;');
    await sequelize.query('CREATE SCHEMA "dbo";');

    await sequelize.sync({ force: true });

    return async () => {
        await sequelize.close();
    };
}
