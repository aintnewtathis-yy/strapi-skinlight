const controller = ({ strapi }) => ({
  products(ctx) {
    ctx.body = strapi
      .plugin('import-data')
      .service('service')
      .products(ctx);
  },
  categories(ctx) {
    ctx.body = strapi
      .plugin('import-data')
      .service('service')
      .categories(ctx);
  },
  lines(ctx) {
    ctx.body = strapi
      .plugin('import-data')
      .service('service')
      .lines(ctx);
  },
  updateThumbnails(ctx) {
    ctx.body = strapi
      .plugin('import-data')
      .service('service')
      .updateThumbnails(ctx);
  },
  updateLines(ctx) {
    ctx.body = strapi
      .plugin('import-data')
      .service('service')
      .updateLines(ctx);
  },
  updateStatus(ctx) {
    ctx.body = strapi
      .plugin('import-data')
      .service('service')
      .updateStatus(ctx);
  },
});

export default controller;
