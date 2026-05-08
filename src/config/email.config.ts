import { InternalServerException } from "#exceptions/internal-server.exception.js";
import nodemailer from "nodemailer";

let _transporter: nodemailer.Transporter | null = null;

export const getTransporter = (): nodemailer.Transporter => {
    if (_transporter) return _transporter;

    const host = process.env.SMTP_HOST;
    const port = Number(process.env.SMTP_PORT || 587);
    const secure = String(process.env.SMTP_SECURE || "false") === "true";
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;

    if (!host || !user || !pass) {
        throw new InternalServerException(
            "Missing SMTP env vars (SMTP_HOST/SMTP_USER/SMTP_PASS).",
        );
    }

    _transporter = nodemailer.createTransport({
        host,
        port,
        secure,
        auth: { user, pass },
    });
    return _transporter;
};
