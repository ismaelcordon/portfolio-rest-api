export const buildContactEmail = (
    name: string,
    email: string,
    description: string,
) => `
<!DOCTYPE html>
            <html>
            <head>
                <meta name="color-scheme" content="light only">
                <meta name="supported-color-schemes" content="light">
                <style>
                    :root {
                        color-scheme: light only;
                        supported-color-schemes: light;
                    }
                    /* Forzar colores en Apple Mail modo oscuro */
                    @media (prefers-color-scheme: dark) {
                        .dark-safe {
                            color: #ffffff !important;
                        }
                    }
                </style>
            </head>
            <body style="margin: 0; padding: 0;">
                <div style="font-family: 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
                    <div style="background: rgb(248, 250, 252); padding: 40px 32px; text-align: center;">
                        <h1 style="color: rgb(51, 65, 85); font-size: 24px; font-weight: 300; letter-spacing: 2px; margin: 0px; text-transform: uppercase;">PORTFOLIO</h1>
                        <div style="width: 40px; height: 2px; background: rgb(59, 130, 246); margin: 16px auto 0px;"></div>
                    </div>
                    <div style="padding: 40px 32px;">
                        <p style="color: rgb(100, 116, 139); font-size: 14px; margin: 0px 0px 32px; line-height: 1.6;">You've received a new inquiry through your portfolio website.</p>
                        <div style="background: rgb(248, 250, 252); border-radius: 12px; padding: 28px; margin-bottom: 24px;">
                            <div style="margin-bottom: 20px;">
                                <p style="color: rgb(148, 163, 184); font-size: 11px; text-transform: uppercase; letter-spacing: 1px; margin: 0px 0px 6px; font-weight: 600;">From</p>
                                <p style="color: rgb(30, 41, 59); font-size: 18px; margin: 0px; font-weight: 500;">${name}</p>
                            </div>
                            <div>
                                <p style="color: rgb(148, 163, 184); font-size: 11px; text-transform: uppercase; letter-spacing: 1px; margin: 0px 0px 6px; font-weight: 600;">Email</p>
                                <p style="color: rgb(59, 130, 246); font-size: 15px; text-decoration: none; font-weight: 400;">${email}</p>
                            </div>
                        </div>
                        <div style="border-left: 3px solid rgb(59, 130, 246); padding-left: 24px; margin-bottom: 32px;">
                            <p style="color: rgb(148, 163, 184); font-size: 11px; text-transform: uppercase; letter-spacing: 1px; margin: 0px 0px 12px; font-weight: 600;">Message</p>
                            <p style="color: rgb(51, 65, 85); font-size: 15px; line-height: 1.8; margin: 0px; white-space: pre-wrap;">${description}</p>
                        </div>
                        <div style="border-top: 1px solid rgb(226, 232, 240); padding: 24px 32px; text-align: center;">
                            <p style="color: rgb(148, 163, 184); font-size: 12px; margin: 0px; line-height: 1.6;">Received on: ${new Date()}</p>
                            <p style="color: rgb(203, 213, 225); font-size: 11px; margin: 8px 0px 0px;">This email was sent from your portfolio contact form</p>
                        </div>
                    </div>
                </div>
            </body>
            </html>
`;
