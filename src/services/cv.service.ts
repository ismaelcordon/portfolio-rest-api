import { CustomException } from "#exceptions/custom.exception.js";
import { InternalServerException } from "#exceptions/internal-server.exception.js";
import { NotFoundException } from "#exceptions/not-found.exception.js";
import path from "node:path";
import fs from "node:fs";
import { Lang } from "#types/api.types.js";
import { handleServiceError } from "#helpers/error.helper.js";

export const resolveLang = (acceptLanguage?: string): Lang => {
    const header = (acceptLanguage || "").toLowerCase();

    if (header.startsWith("es")) return "es";

    return "en";
};

export const findCvPdfByLanguage = async (acceptLanguage?: string) => {
    try {
        const language = resolveLang(acceptLanguage);

        const filename =
            language === "es"
                ? "CV_Ismael_Cordón_Domínguez_Spanish.pdf"
                : "CV_Ismael_Cordón_Domínguez_English.pdf";

        const absolutePath = path.resolve(process.cwd(), "assets", filename);

        if (!fs.existsSync(absolutePath)) {
            throw new NotFoundException(`CV file not found: ${filename}`);
        }

        return absolutePath;
    } catch (error) {
        return handleServiceError(error);
    }
};
