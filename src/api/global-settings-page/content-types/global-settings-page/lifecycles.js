module.exports = {
    async afterUpdate(event) {
        const { data } = event.params;
        const allProducts = await strapi
            .documents("api::product.product")
            .findMany({
                populate: ["brand"],
                filters: {
                    brand: {
                        $notNull: true,
                    },
                },
            });
        const publishedProducts = await strapi
            .documents("api::product.product")
            .findMany({
                populate: ["brand"],
                filters: {
                    brand: {
                        $notNull: true,
                    },
                },
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
                try {
                    for (const product of products) {
                        if (!product.priceEUR) continue; // Skip products without priceEUR
                        if (!product.brand || !product.brand.name) {
                            console.warn(
                                `Product ${product.id} has no brand, skipping.`,
                            );
                            continue;
                        }

                        let exchangeRate, exchangeRateOpt;
                        switch (product.brand.name) {
                            case "Pandhy's":
                                exchangeRate = data.exchangeRate_pandhys;
                                exchangeRateOpt = data.exchangeRateOpt_pandhys;
                                break;
                            case "Ella Bache":
                                exchangeRate = data.exchangeRate_ella;
                                exchangeRateOpt = data.exchangeRateOpt_ella;
                                break;
                            case "VAL MI":
                                exchangeRate = data.exchangeRate_valmi;
                                exchangeRateOpt = data.exchangeRateOpt_valmi;
                                break;
                            case "Perron Rigot":
                                exchangeRate = data.exchangeRate_perron;
                                exchangeRateOpt = data.exchangeRateOpt_perron;
                                break;
                            default:
                                console.warn(
                                    `Unknown brand: ${product.brand.name}, skipping.`,
                                );
                                continue;
                        }

                        await strapi.entityService.update(
                            "api::product.product",
                            product.id,
                            {
                                data: {
                                    priceRUB: product.priceEUR * exchangeRate,
                                    priceRUBOpt:
                                        product.priceEUR * exchangeRateOpt,
                                },
                                status: statusTag, // Ensure this is a valid field in Strapi
                            },
                        );

                    }
                } catch (error) {
                    console.log(error, "promise all error");
                }
            }
        }

        try {
            await changePrices(publishedProducts, "published");
            await changePrices(draftProducts, "draft");
            console.log("prices updated!");
        } catch (error) {
            console.log(error, "end error");
        }
    },
};
