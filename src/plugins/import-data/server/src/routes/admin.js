export default [
  {
    method: 'POST',
    path: '/products',
    handler: 'controller.products',
    config: {
      policies: [],
    },
  },
  {
    method: 'POST',
    path: '/categories',
    handler: 'controller.categories',
    config: {
      policies: [],
    },
  },
  {
    method: 'POST',
    path: '/lines',
    handler: 'controller.lines',
    config: {
      policies: [],
    },
  },
  {
    method: 'POST',
    path: '/updateThumbnails',
    handler: 'controller.updateThumbnails',
    config: {
      policies: [],
    },
  },
  {
    method: 'POST',
    path: '/updateLines',
    handler: 'controller.updateLines',
    config: {
      policies: [],
    },
  },
  {
    method: 'POST',
    path: '/updateStatus',
    handler: 'controller.updateStatus',
    config: {
      policies: [],
    },
  },
];
