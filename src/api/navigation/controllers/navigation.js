"use strict";

/**
 * navigation controller
 */

const { createCoreController } = require("@strapi/strapi").factories;

module.exports = createCoreController(
    "api::navigation.navigation",
    ({ strapi }) => ({
        async getNavigationData(ctx) {
            try {
                const brands = await strapi
                    .documents("api::brand.brand")
                    .findMany({
                        status: "published",
                        populate: [
                            "seo",
                            "lines",
                            "products",
                            "products.categories",
                            "products.categories.seo",
                        ],
                    });

                const transformedBrands = brands.reduce((acc, brand) => {
                    if (!brand.products || brand.products.length === 0) {
                        return acc; // Skip brands with empty products
                    }

                    const categoriesMap = new Map();

                    brand.products.forEach((product) => {
                        if (product.categories) {
                            product.categories.forEach((category) => {
                                if (!categoriesMap.has(category.id)) {
                                    categoriesMap.set(category.id, {
                                        label: category.name,
                                        href: category.seo.slug,
                                    });
                                }
                            });
                        }
                    });

                    acc.push({
                        label: brand.name,
                        href: brand.seo.slug,
                        secondLevel: Array.from(categoriesMap.values()),
                    });

                    return acc;
                }, []);

                const bottomNavigation = await strapi
                    .documents("api::navigation.navigation")
                    .findFirst({
                        status: "published",
                        populate: [
                            "headerLink",
                            "footerNavigation",
                            "footerNavigation.footerColumn",
                            "footerNavigation.footerColumn.link",
                            "footerNavigation.footerSocials",
                            "footerNavigation.footerSocials.link",
                        ],
                    });

                return {
                    topMenu: transformedBrands,
                    botMenu: bottomNavigation.headerLink,
                    footerNavigation: bottomNavigation.footerNavigation,
                };
            } catch (err) {
                ctx.throw(500, err);
            }
        },
    }),
);
