const cronTasks = require("./cron-tasks");

module.exports = ({ env }) => ({
    host: env("HOST", "0.0.0.0"),
    port: env.int("PORT", 1337),
    app: {
        keys: env.array("APP_KEYS"),
        API_YOOKASSA_URL: env("API_YOOKASSA_URL"),
        ADMIN_EMAIL: env("ADMIN_EMAIL"),
        FROM_EMAIL: env("FROM_EMAIL"),
    },
    webhooks: {
        populateRelations: env.bool("WEBHOOKS_POPULATE_RELATIONS", false),
    },
    cron: {
        enabled: true,
        tasks: cronTasks,
    },
});
