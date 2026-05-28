import { NotFoundException } from "#exceptions/not-found.exception.js";
import path from "node:path";
import fs from "node:fs";
import { Lang } from "#types/api.types.js";
import { handleServiceError } from "#helpers/error.helper.js";
import { CV_FILENAMES } from "#utils/constants.utils.js";

export const resolveLang = (acceptLanguage?: string): Lang => {
    const header = (acceptLanguage || "").toLowerCase();

    if (header.startsWith("es")) return "es";

    return "en";
};

export const findCvPdfByLanguage = async (acceptLanguage?: string) => {
    try {
        const language = resolveLang(acceptLanguage);

        const filename = language === "es" ? CV_FILENAMES.es : CV_FILENAMES.en;

        const assestBase =
            process.env.ASSETS_PATH ?? path.resolve(process.cwd(), "assets");

        const absolutePath = path.resolve(assestBase, filename);

        if (!fs.existsSync(absolutePath)) {
            throw new NotFoundException(`CV file not found: ${filename}`);
        }

        return absolutePath;
    } catch (error) {
        return handleServiceError(error);
    }
};
