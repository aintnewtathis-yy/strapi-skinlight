module.exports = {
  routes: [
    {
      method: "POST",
      path: "/getOrderRequest", 
      handler: "order.getOrderRequest",
    },
    {
      method: "POST",
      path: "/handleNotifications", 
      handler: "order.handleNotifications",
    },
    {
      method: "POST",
      path: "/sendFormMessageToAdmin", 
      handler: "order.sendFormMessageToAdmin",
    },
  ],
};
