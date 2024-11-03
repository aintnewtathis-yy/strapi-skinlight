export default [
  {
    method: 'POST',
    path: '/initial-payment',
    handler: 'controller.initialPayment',
    config: {
      policies: [],
    },
  },
];
