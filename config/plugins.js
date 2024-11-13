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
                    user: env("SMTP_USERNAME", "1loso@mail.ru"),
                    pass: env("SMTP_PASSWORD", "rrmtdN7vtvyEgfHt1Hja"),
                },
            },
            settings: {
                defaultFrom: "noreply@mail.ru",
                defaultReplyTo: "noreply@mail.ru",
            },
        },
    },
});
