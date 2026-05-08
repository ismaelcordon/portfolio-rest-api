import { getTransporter } from "#config/email.config.js";
import { InternalServerException } from "#exceptions/internal-server.exception.js";
import { CustomException } from "#exceptions/custom.exception.js";
import { buildContactEmail } from "#helpers/email-template.helper.js";

export const sendContactEmail = async (
    name: string,
    senderEmail: string,
    message: string,
) => {
    try {
        const to = process.env.CONTACT_TO;
        const from = process.env.CONTACT_FROM || process.env.SMTP_USER;

        if (!to || !from) {
            throw new InternalServerException(
                "Missing CONTACT_TO or CONTACT_FROM env vars.",
            );
        }

        const subject = `${name} contacted you from your website`;

        const text = `Nuevo mensaje desde el formulario del portfolio:
            Nombre: ${name}
            Correo: ${from}
            Mensaje: ${message}`;

        const html = buildContactEmail(name, senderEmail, message);

        return await getTransporter().sendMail({
            to,
            from,
            replyTo: senderEmail,
            subject,
            text,
            html,
        });
    } catch (error) {
        if (error instanceof CustomException) throw error;
        throw new InternalServerException(
            error instanceof Error ? error.message : "Unexpected error",
        );
    }
};
