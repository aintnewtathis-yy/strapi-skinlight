"use strict";

const { createCoreController } = require("@strapi/strapi").factories;

module.exports = createCoreController("api::order.order", ({ strapi }) => ({
    async getOrderRequest(ctx) {
        try {
            let { data } = ctx.request.body;

            //создаем заказ с данными из корзины
            const order = await strapi.documents("api::order.order").create({
                data: {
                    orderStatus: data.orderStatus,
                    total: data.total,
                    orderId: data.orderId,
                    products: data.products,
                    address: data.userData.address,
                    user: data.userDocumentId,
                },
                status: "published",
            });

            //получаем ссылку на оплату и id заказа от юкассы
            const paymentDetails = await strapi
                .plugin("yookassa-payment")
                .service("service")
                .initialPayment({
                    request: {
                        body: {
                            paymentData: {
                                total: order.total,
                            },
                        },
                    },
                });

            if (!paymentDetails.url) {
                ctx.throw(500, "Ошибка в оформлении оплаты");
            }

            //обновляем orderId в страпи
            const updatedOrder = await strapi
                .documents("api::order.order")
                .update({
                    documentId: order.documentId,
                    data: { orderId: paymentDetails.id },
                    status: "published",
                });

            return {
                url: paymentDetails.url,
            };
        } catch (err) {
            console.log(err);
            ctx.throw(500, err);
        }
    },
    async handleNotifications(ctx) {
        let notificationInfo = ctx.request.body;

        console.log(notificationInfo.event, "yookassa webhook notification");
        console.log(notificationInfo.object.paid, "paid");

        if (notificationInfo.event === "payment.waiting_for_capture") {
            try {
                const order = await strapi
                    .documents("api::order.order")
                    .findFirst({
                        filters: {
                            orderId: {
                                $eq: notificationInfo.object.id,
                            },
                        },
                    });

                const updatedOrder = await strapi
                    .documents("api::order.order")
                    .update({
                        documentId: order.documentId,
                        data: {
                            orderStatus: "Оплачен",
                        },
                    });

                const req = await strapi
                    .plugin("yookassa-payment")
                    .service("service")
                    .confirmPayment(notificationInfo.object.id);

                // Устанавливаем статус ответа HTTP 200
                ctx.status = 200;
                ctx.body = ""; // Пустое тело
                return;
            } catch (err) {
                console.log(err);
                ctx.throw(500, err);
            }
        } else if (notificationInfo.event === "payment.canceled") {
            try {
                const order = await strapi
                    .documents("api::order.order")
                    .findFirst({
                        filters: {
                            orderId: {
                                $eq: notificationInfo.object.id,
                            },
                        },
                    });

                const updatedOrder = await strapi
                    .documents("api::order.order")
                    .update({
                        documentId: order.documentId,
                        data: {
                            orderStatus: "Отменен",
                        },
                    });

                const req = await strapi
                    .plugin("yookassa-payment")
                    .service("service")
                    .cancelPayment(notificationInfo.object.id);

                ctx.status = 200;
                ctx.body = "";
                return;
            } catch (err) {
                console.log(err);
                ctx.throw(500, err);
            }
        } else if (notificationInfo.event === "payment.succeeded") {
            console.log("PAYMENT RECEIVED", notificationInfo.object.id);
            ctx.status = 200;
            ctx.body = "";
            return;
        }

        // Обработка неизвестных событий с кодом 200, если нужно
        ctx.status = 200;
        ctx.body = "";
    },
}));
