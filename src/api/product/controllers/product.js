"use strict";

const { createCoreController } = require("@strapi/strapi").factories;

module.exports = createCoreController("api::product.product", ({ strapi }) => ({
    async getCatalogData(ctx) {
        const { sort, filters, start = 0, limit = 24 } = ctx.query;

        try {
            const brands = await strapi.documents("api::brand.brand").findMany({
                filters: {
                    products: {
                        $notNull: true
                    }
                },
                populate: ["seo"],
                status: "published",
            });

            const products = await strapi
                .documents("api::product.product")
                .findMany({
                    populate: [
                        "categories",
                        "line",
                        "brand",
                        "brand.seo",
                        "thumbnail",
                        "seo",
                    ],
                    sort: sort,
                    filters: filters,
                    start: parseInt(start),
                    limit: parseInt(limit),
                    status: "published",
                });

            const prices = products.map((product) => Number(product.priceRUB));
            const maxPrice = Math.max(...prices);
            const minPrice = Math.min(...prices);

            const pagination = {
                start: parseInt(start),
                limit: parseInt(limit),
                total: await strapi.documents("api::product.product").count({
                    sort: sort,
                    filters: filters,
                    start: parseInt(start),
                    limit: parseInt(limit),
                    status: "published",
                }),
            };

            return {
                products,
                brands,
                pagination,
                maxPrice,
                minPrice,
            };
        } catch (err) {
            console.warn(err);
            throw Error("Проблемы с поиском товаров");
        }
    },
    async getBrandCatalog(ctx) {
        const {
            brandSlug,
            categorySlug,
            lineSlug,
            sort,
            filters,
            start = 0,
            limit = 24,
        } = ctx.query;

        const categoriesSet = new Set();
        const linesSet = new Set();
        let currentCategory;

        const brand = await strapi.documents("api::brand.brand").findFirst({
            filters: {
                seo: {
                    slug: {
                        $eq: brandSlug,
                    },
                },
            },
            populate: ["seo"],
            status: "published",
        });

        let filtersObject = {};

        if (filters) {
            filtersObject["priceRUB"] = filters.priceRUB;
        }

        filtersObject["brand"] = {
            documentId: {
                $eq: brand.documentId,
            },
        };
        if (categorySlug) {
            currentCategory = await strapi
                .documents("api::category.category")
                .findFirst({
                    filters: {
                        seo: {
                            slug: {
                                $eq: categorySlug,
                            },
                        },
                    },
                    populate: ["seo"],
                    status: "published",
                });
            filtersObject["categories"] = {
                documentId: {
                    $eq: currentCategory.documentId,
                },
            };
        } else if (lineSlug) {
            currentCategory = await strapi
                .documents("api::line.line")
                .findFirst({
                    filters: {
                        seo: {
                            slug: {
                                $eq: lineSlug,
                            },
                        },
                    },
                    populate: ["seo"],
                    status: "published",
                });

            filtersObject["line"] = {
                documentId: {
                    $eq: currentCategory.documentId,
                },
            };
        }
        const productsForCategories = await strapi
            .documents("api::product.product")
            .findMany({
                populate: ["categories", "line", "categories.seo", "line.seo"],
                filters: {
                    brand: {
                        documentId: {
                            $eq: brand.documentId,
                        },
                    },
                },
                status: "published",
            });

        productsForCategories.forEach((product) => {
            if (product.categories) {
                product.categories.forEach((category) => {
                    const categoryKey = JSON.stringify({
                        id: category.id,
                        name: category.name,
                        seo: category.seo,
                    });
                    categoriesSet.add(categoryKey);
                });
            }
            if (product.line) {
                const lineKey = JSON.stringify({
                    id: product.line.id,
                    name: product.line.name,
                    seo: product.line.seo,
                });
                linesSet.add(lineKey);
            }
        });

        const categoriesArr = Array.from(categoriesSet)
            .map((cat) => JSON.parse(cat))
            .sort((a, b) => b.id - a.id);
        const linesArr = Array.from(linesSet)
            .map((line) => JSON.parse(line))
            .sort((a, b) => b.id - a.id);

        try {
            const products = await strapi
                .documents("api::product.product")
                .findMany({
                    filters: filtersObject,
                    populate: [
                        "categories",
                        "line",
                        "brand",
                        "brand.seo",
                        "thumbnail",
                        "seo",
                    ],
                    sort: sort,
                    start: parseInt(start),
                    limit: parseInt(limit),
                    status: "published",
                });

            const productPrices = await strapi
                .documents("api::product.product")
                .findMany({
                    filters: filtersObject,
                    fields: ["priceRUB"],
                    sort: sort,
                    status: "published",
                });

            const prices = productPrices.map((product) => product.priceRUB);
            const maxPrice = Math.max(...prices);
            const minPrice = Math.min(...prices);

            return {
                products,
                pagination: {
                    start: parseInt(start),
                    limit: parseInt(limit),
                    total: await strapi
                        .documents("api::product.product")
                        .count({
                            filters: filtersObject,
                            sort: sort,
                            start: parseInt(start),
                            limit: parseInt(limit),
                            status: "published",
                        }),
                },
                categories: categoriesArr,
                lines: linesArr,
                maxPrice,
                minPrice,
                currentBrand: brand,
            };
        } catch (err) {
            ctx.throw(500, err);
        }
    },
    async getProduct(ctx) {
        const { productSlug } = ctx.query;

        try {
            let crosssales;
            const product = await strapi
                .documents("api::product.product")
                .findFirst({
                    filters: {
                        seo: {
                            slug: {
                                $eq: productSlug,
                            },
                        },
                    },
                    populate: [
                        "brand",
                        "brand.seo",
                        "crosssales",
                        "seo",
                        "seo.image",
                        "thumbnail",
                    ],
                    status: "published",
                });

            if (product.crosssales.length === 0) {
                crosssales = await strapi
                    .documents("api::product.product")
                    .findMany({
                        filters: {
                            brand: {
                                documentId: {
                                    $eq: product.brand.documentId,
                                },
                            },
                        },
                        populate: ["seo", "thumbnail"],
                        limit: 8,
                        status: "published",
                    });
            }

            return {
                product,
                crosssales,
            };
        } catch (err) {
            ctx.throw(500, err);
        }
    },
}));
