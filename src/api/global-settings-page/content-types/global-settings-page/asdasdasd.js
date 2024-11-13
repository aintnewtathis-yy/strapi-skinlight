module.exports = {
    async afterUpdate(event) {
        const { data } = event.params;
        const allProducts = await strapi
            .documents("api::product.product")
            .findMany({
                populate: ["brand"],
            });

        console.log(
            data.exchangeRate_ella,
            data.exchangeRate_perron,
            data.exchangeRate_pandhys,
            data.exchangeRate_valmi,
            data.exchangeRateOpt_ella,
            data.exchangeRateOpt_perron,
            data.exchangeRateOpt_pandhys,
            data.exchangeRateOpt_valmi,
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

        async function changePrices(products, dataExchange) {
            if (products && allFilled) {
                let i = 0;
                const updatePromises = products.map(async (product, index) => {
                    console.log(
                        `Processing product ${index + 1} of ${products.length}`,
                    );

                    // First, check if the product exists in the database
                    const existingProduct = await strapi.db
                        .query("api::product.product")
                        .findOne({
                            where: { id: product.id },
                        });

                    if (!existingProduct) {
                        console.log(
                            `Product with id ${product.id} not found in database. Skipping.`,
                        );
                        return;
                    }

                    console.log(parseInt(product.priceEUR) * parseInt(data.exchangeRateOpt_pandhys));
                    if (
                        product.priceEUR &&
                        product.brand &&
                        product.brand.name
                    ) {
                        let data = {};
                        switch (product.brand.name) {
                            case "Pandhy`s":
                                data = {
                                    priceRUB:
                                        parseInt(product.priceEUR) *
                                        parseInt(dataExchange.exchangeRate_pandhys),
                                    priceRUBOpt:
                                        parseInt(product.priceEUR) *
                                        parseInt(dataExchange.exchangeRateOpt_pandhys),
                                };
                                break;
                            case "Ella Bache":
                                data = {
                                    priceRUB:
                                        parseInt(product.priceEUR) *
                                        parseInt(dataExchange.exchangeRate_ella),
                                    priceRUBOpt:
                                        parseInt(product.priceEUR) *
                                        parseInt(dataExchange.exchangeRateOpt_ella),
                                };
                                break;
                            case "VAL MI":
                                data = {
                                    priceRUB:
                                        parseInt(product.priceEUR) *
                                        parseInt(dataExchange.exchangeRate_valmi),
                                    priceRUBOpt:
                                        parseInt(product.priceEUR) *
                                        parseInt(dataExchange.exchangeRateOpt_valmi),
                                };
                                break;
                            case "Perron Rigot":
                                data = {
                                    priceRUB:
                                        parseInt(product.priceEUR) *
                                        parseInt(dataExchange.exchangeRate_perron),
                                    priceRUBOpt:
                                        parseInt(product.priceEUR) *
                                        parseInt(dataExchange.exchangeRateOpt_perron),
                                };
                                break;
                        }

                        console.log(data);
                        const updatedProduct = await strapi.db
                            .query("api::product.product")
                            .update({
                                where: { id: product.id },
                                data: data,
                            });
                        return updatedProduct;
                    }
                });

                console.log(updatePromises);
                await Promise.all(updatePromises);
            }
        }

        try {
            await changePrices(allProducts, data);
            console.log("prices updated!");
        } catch (error) {
            console.log(error);
        }
    },
};
