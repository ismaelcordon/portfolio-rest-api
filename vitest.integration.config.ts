import { defineConfig } from "vitest/config";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const envPath = path.resolve(__dirname, ".env.test");
console.log("📁 Loading env from:", envPath);

const result = dotenv.config({ path: envPath });

if (result.error) {
    console.error("❌ Error loading .env.test:", result.error);
} else {
    console.log("✅ Loaded env variables:", Object.keys(result.parsed || {}));
}

export default defineConfig({
    test: {
        globals: true,
        environment: "node",
        globalSetup: ["./tests/global.setup.ts"],
        setupFiles: ["./tests/integration/test.integration.setup.ts"],
        include: ["tests/integration/**/*.test.ts"],
        env: {
            DB_HOST: process.env.DB_HOST || "localhost",
            DB_PORT: process.env.DB_PORT || "5432",
            DB_NAME: process.env.DB_NAME || "myapp_test",
            DB_USER: process.env.DB_USER || "postgres",
            DB_PASSWORD: process.env.DB_PASSWORD || "postgres",
            NODE_ENV: "test",
            API_KEY: process.env.test || "test-api-key",
        },
        coverage: {
            provider: "v8",
            reporter: ["text", "json", "html", "lcov"],
            exclude: ["node_modules/", "tests/", "**/*.config.ts", "dist/"],
        },
        fileParallelism: false,
        maxWorkers: 1,
    },
    resolve: {
        alias: {
            "#config": path.resolve(__dirname, "./src/config"),
            "#controllers": path.resolve(__dirname, "./src/controllers"),
            "#dtos": path.resolve(__dirname, "./src/dtos"),
            "#exceptions": path.resolve(__dirname, "./src/exceptions"),
            "#helpers": path.resolve(__dirname, "./src/helpers"),
            "#mappers": path.resolve(__dirname, "./src/mappers"),
            "#middlewares": path.resolve(__dirname, "./src/middlewares"),
            "#models": path.resolve(__dirname, "./src/models"),
            "#routes": path.resolve(__dirname, "./src/routes"),
            "#services": path.resolve(__dirname, "./src/services"),
            "#types": path.resolve(__dirname, "./src/types"),
            "#utils": path.resolve(__dirname, "./src/utils"),
            "#validators": path.resolve(__dirname, "./src/validators"),
        },
    },
});
