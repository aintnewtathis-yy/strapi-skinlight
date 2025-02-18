"use strict";

/**
 * promocode controller
 */

const { createCoreController } = require("@strapi/strapi").factories;

module.exports = createCoreController(
    "api::promocode.promocode",
    ({ strapi }) => ({
        async getDiscount(ctx) {
            const { promocodeName } = ctx.query;

            if (!promocodeName) {
                return ctx.badRequest("Promocode name is required");
            }

            const promocode = await strapi
                .documents("api::promocode.promocode")
                .findFirst({
                    filters: {
                        promocode: {
                            $eq: promocodeName,
                        },
                    },
                    status: "published",
                });

            if (!promocode) {
                return ctx.notFound("Promocode not found");
            }

            return promocode;
        },
    }),
);
