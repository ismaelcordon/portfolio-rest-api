import { defineConfig } from "vitest/config";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
    test: {
        globals: true,
        include: ["tests/unit/**/*.test.ts"],
        coverage: {
            provider: "v8",
            reporter: ["text", "html", "lcov"],
            reportsDirectory: "coverage/unit",
            thresholds: {
                lines: 80,
                functions: 80,
                branches: 80,
                statements: 80,
            },
            exclude: ["node_modules/", "tests/", "**/*.config.ts", "dist/"],
        },
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
