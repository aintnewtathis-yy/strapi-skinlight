module.exports = {
  routes: [
    {
      method: "GET",
      path: "/products/getCatalogData", 
      handler: "product.getCatalogData",
    },
    {
      method: "GET",
      path: "/products/getBrandCatalog", 
      handler: "product.getBrandCatalog",
    },
    {
      method: "GET",
      path: "/products/getProduct", 
      handler: "product.getProduct",
    },
  ],
};
