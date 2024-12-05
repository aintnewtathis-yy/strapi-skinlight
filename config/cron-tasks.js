module.exports = {
    cronTasks: {
        task: ({ strapi }) => {
            console.log('cron every 1 minute')
        },
        options: {
            rule: "1 * * * * *",
        },
    },
};
