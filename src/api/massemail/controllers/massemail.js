"use strict";

const { createCoreController } = require("@strapi/strapi").factories;

module.exports = createCoreController(
    "api::massemail.massemail",
    ({ strapi }) => ({
        async updateEmailsList(ctx) {
            let { data } = ctx.request.body;
            try {
                // Fetch the single type entry
                const email = await strapi.documents("api::massemail.massemail").findFirst();

                const newList = `${email.emails_richtext || ''} 
                 ${data.email}`;

                const updatedEmail = await strapi.documents("api::massemail.massemail").update({
                    documentId: email.documentId,
                    data: {
                        emails_richtext: newList,
                    },
                    status: 'published'
                });

                ctx.body = updatedEmail;
                ctx.status = 200;
            } catch (err) {
                console.error(err);
                ctx.throw(500, err);
            }
        },
    })
);