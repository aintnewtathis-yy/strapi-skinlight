module.exports = {
    async afterUpdate(event) {
        const { data } = event.params;
        const allProducts = await strapi
            .documents("api::product.product")
            .findMany({
                populate: ["brand"],
            });
        const publishedProducts = await strapi
            .documents("api::product.product")
            .findMany({
                populate: ["brand"],
                status: "published",
            });

        const draftProducts = allProducts.filter(
            (draft) =>
                !publishedProducts.some(
                    (published) => published.documentId === draft.documentId,
                ),
        );

        const allFilled = Boolean(
            data.exchangeRate_ella &&
                data.exchangeRate_perron &&
                data.exchangeRate_pandhys &&
                data.exchangeRate_valmi &&
                data.exchangeRateOpt_ella &&
                data.exchangeRateOpt_perron &&
                data.exchangeRateOpt_pandhys &&
                data.exchangeRateOpt_valmi,
        );

        async function changePrices(products, statusTag) {
            if (products && allFilled) {
                await Promise.all(
                    products.map(async (product) => {
                        if (product.priceEUR) {
                            switch (product.brand.name) {
                                case "Pandhy`s":
                                    return strapi
                                        .documents("api::product.product")
                                        .update({
                                            documentId: product.documentId,
                                            data: {
                                                priceRUB:
                                                    product.priceEUR *
                                                    data.exchangeRate_pandhys,
                                                priceRUBOpt:
                                                    product.priceEUR *
                                                    data.exchangeRateOpt_pandhys,
                                            },
                                            status: statusTag,
                                        });
                                case "Ella Bache":
                                    return strapi
                                        .documents("api::product.product")
                                        .update({
                                            documentId: product.documentId,
                                            data: {
                                                priceRUB:
                                                    product.priceEUR *
                                                    data.exchangeRate_ella,
                                                priceRUBOpt:
                                                    product.priceEUR *
                                                    data.exchangeRateOpt_ella,
                                            },
                                            status: statusTag,
                                        });
                                case "VAL MI":
                                    return strapi
                                        .documents("api::product.product")
                                        .update({
                                            documentId: product.documentId,
                                            data: {
                                                priceRUB:
                                                    product.priceEUR *
                                                    data.exchangeRate_valmi,
                                                priceRUBOpt:
                                                    product.priceEUR *
                                                    data.exchangeRateOpt_valmi,
                                            },
                                            status: statusTag,
                                        });
                                case "Perron Rigot":
                                    return strapi
                                        .documents("api::product.product")
                                        .update({
                                            documentId: product.documentId,
                                            data: {
                                                priceRUB:
                                                    product.priceEUR *
                                                    data.exchangeRate_perron,
                                                priceRUBOpt:
                                                    product.priceEUR *
                                                    data.exchangeRateOpt_perron,
                                            },
                                            status: statusTag,
                                        });
                            }
                        }
                    }),
                );
            }
        }

        try {
            await changePrices(publishedProducts, "published");
            await changePrices(draftProducts, "draft");
            console.log("prices updated!");
        } catch (error) {
            console.log(error);
        }
    },
};
