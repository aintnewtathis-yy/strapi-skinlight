module.exports = ({ env }) => ({
    "import-data": {
        enabled: true,
        resolve: "./src/plugins/import-data",
    },
    "yookassa-payment": {
        enabled: true,
        resolve: "./src/plugins/yookassa-payment",
    },
    "users-permissions": {
        config: {
            jwt: {
                expiresIn: "30d",
            },
            register: {
                allowedFields: ["orders", "certificates", "masterStatus"],
            },
        },
    },
    email: {
        config: {
            provider: "nodemailer",
            providerOptions: {
                host: env("SMTP_HOST", "smtp.mail.ru"),
                port: env("SMTP_PORT", 465),
                auth: {
                    user: env("SMTP_USERNAME"),
                    pass: env("SMTP_PASSWORD"),
                },
            },
            settings: {
                defaultFrom: env("SMTP_HOST", "noreply@mail.ru"),
                defaultReplyTo: env("SMTP_HOST", "noreply@mail.ru"),
            },
        },
    },
});
