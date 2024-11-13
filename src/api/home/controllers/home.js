"use strict";

/**
 * home controller
 */

const { createCoreController } = require("@strapi/strapi").factories;

module.exports = createCoreController("api::home.home", ({ strapi }) => ({
    async getHomeData(ctx) {
        try {
            const products = await strapi
                .documents("api::product.product")
                .findMany({
                    populate: [
                        "thumbnail",
                        "seo",
                        "seo.image",
                        "brand",
                        "brand.seo",
                    ],
                    limit: 15,
                    status: "published",
                });

            const homeData = await strapi
                .documents("api::home.home")
                .findFirst({
                    populate: [
                        "shownLine",
                        "shownLine.image",
                        "shownLine.seo",
                        "shownLine.seo.image",
                        "shownLine.products",
                        "shownLine.products.thumbnail",
                        "shownLine.products.seo",
                        "shownLine.products.brand",
                        "shownLine.products.brand.seo",
                        "shownLine.shownOnBrand",
                        "shownLine.shownOnBrand.seo",
                        "heroSlider",
                        "heroSlider.image",
                        "heroSlider.imageMobile",
                        "heroAbout",
                        "heroAbout.image",
                        "homeBrands",
                        "homeBrands.image",
                    ],
                    status: "published",
                });

            return {
                homeData,
                products,
            };
        } catch (err) {
            console.log(err);
            ctx.throw(500, err);
        }
    },
}));
