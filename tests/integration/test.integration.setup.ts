import { afterEach } from "vitest";
import { sequelize } from "#config/database.config.js";

afterEach(async () => {
    await sequelize.truncate({ cascade: true, restartIdentity: true });
});
