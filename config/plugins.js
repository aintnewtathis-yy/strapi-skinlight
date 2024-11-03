module.exports = {
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
        },
    },
};
