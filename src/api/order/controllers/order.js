"use strict";

async function processOrderStatus(paymentId, status) {
    const order = await strapi.documents("api::order.order").findFirst({
        filters: { orderId: paymentId },
    });

    if (order) {
        await strapi.documents("api::order.order").update({
            documentId: order.documentId,
            data: { orderStatus: status },
        });
        strapi.log.info(
            `Статус заказа обновлен на '${status}' для заказа с ID: ${order.orderId}`,
        );
    } else {
        throw new Error(`Заказ не найден для платежа с ID: ${paymentId}`);
    }
}

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
        const { event, object } = ctx.request.body;

        if (!event || !object || !object.id) {
            strapi.log.warn("Получен некорректный формат уведомления.");
            return ctx.badRequest("Некорректный формат уведомления");
        }

        strapi.log.info(
            `Получено событие Yookassa: ${event} для платежа с ID: ${object.id}`,
        );

        try {
            switch (event) {
                case "payment.waiting_for_capture":
                    await processOrderStatus(object.id, "Оплачен");
                    await strapi
                        .plugin("yookassa-payment")
                        .service("service")
                        .confirmPayment(object.id);
                    break;

                case "payment.canceled":
                    await processOrderStatus(object.id, "Отменен");
                    await strapi
                        .plugin("yookassa-payment")
                        .service("service")
                        .cancelPayment(object.id);
                    break;

                case "payment.succeeded":
                    strapi.log.info(
                        `Платеж успешно завершен для ID: ${object.id}`,
                    );
                    break;

                default:
                    strapi.log.warn(`Необработанный тип события: ${event}`);
                    break;
            }

            return ctx.send("", 200);
        } catch (err) {
            strapi.log.error(
                `Ошибка при обработке уведомления Yookassa: ${err.message}`,
            );
            return ctx.internalServerError(
                "Внутренняя ошибка сервера при обработке уведомления",
            );
        }
    },
}));
