"use strict";

/**
 * contact-page controller
 */

const { createCoreController } = require("@strapi/strapi").factories;

module.exports = createCoreController(
    "api::contact-page.contact-page",
    ({ strapi }) => ({
        async getContactsData(ctx) {
            try {
                const data = await strapi
                    .documents("api::contact-page.contact-page")
                    .findFirst({
                        populate: [
                            "contactsBlock",
                            "contactsBlock.contactsBlockContent",
                            "seo",
                            "seo.image",
                        ],
                    });

                return data;
            } catch (err) {
                console.log(err);
                ctx.throw(500, err);
            }
        },
    }),
);
