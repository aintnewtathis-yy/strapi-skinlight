const controller = ({ strapi }) => ({
  initialPayment(ctx) {
    ctx.body = strapi
      .plugin('yookassa-payment')
      .service('service')
      .initialPayment(ctx);
  },
});

export default controller;
