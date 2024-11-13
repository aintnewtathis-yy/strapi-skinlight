"use strict";

/**
 * brand controller
 */

const { createCoreController } = require("@strapi/strapi").factories;

module.exports = createCoreController("api::brand.brand", ({ strapi }) => ({
    async getBrand(ctx) {
        const { brandSlug } = ctx.query;

        const brand = await strapi.documents("api::brand.brand").findFirst({
            filters: {
                seo: {
                    slug: {
                        $eq: brandSlug,
                    },
                },
            },
            populate: [
                "shownLine",
                "shownLine.image",
                "shownLine.products",
                "shownLine.products.brand",
                "shownLine.products.brand.seo",
                "shownLine.products.thumbnail",
                "shownLine.products.seo",
                "shownLine.seo",
                "shownLine.seo.image",
                "seo",
                "seo.image",
                "brandHero",
                "brandHero.image",
                "brandAbout",
                "brandAbout.image",
            ],
            status: "published",
        });
        const products = await strapi
            .documents("api::product.product")
            .findMany({
                filters: {
                    brand: {
                        documentId: {
                            $eq: brand.documentId,
                        },
                    },
                },
                populate: ["thumbnail", "seo", "brand", "brand.seo"],
                limit: 10,
                status: "published",
            });

        console.log(products);

        if (!brand) {
            return ctx.notFound("Brand not found");
        }

        return {
            brand: brand,
            products: products,
        };
    },
}));
