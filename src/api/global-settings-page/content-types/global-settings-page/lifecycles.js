module.exports = {
  async afterUpdate(event) {
    const { data } = event.params;
    const products = await strapi.documents("api::product.product").findMany();

    console.log(products, 'aa')
    if (products && data.exchangeRate) {
      await Promise.all(
        products.map(async (product) => {
          if (product.priceEUR) {
            return strapi.documents("api::product.product").update({
              documentId: product.documentId,
              data: { priceRUB: product.priceEUR * data.exchangeRate },
              status: "published",
            });
          }
        })
      );
    }
  },
};
