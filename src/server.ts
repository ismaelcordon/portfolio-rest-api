import "dotenv/config";
import { createApp } from "./app.js";
import { sequelize } from "./config/database.config.js";

const PORT = process.env.PORT ?? 3000;

const createServer = async () => {
    try {
        await sequelize.authenticate();
        console.log("✅ Database connection established successfully.");

        const app = createApp();

        app.listen(PORT, () => {
            console.log(`🚀 Server running on PORT ${PORT}`);
        });
    } catch (error) {
        console.error("❌ Unable to start server:", error);
        process.exit(1);
    }
};

createServer();
