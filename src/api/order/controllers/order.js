"use strict";

async function processOrderStatus(paymentId, status) {
    const order = await strapi.documents("api::order.order").findFirst({
        filters: { orderId: paymentId },
    });

    if (order) {
        const updatedOrder = await strapi.documents("api::order.order").update({
            documentId: order.documentId,
            data: { orderStatus: status },
            status: "published",
            populate: ["products", "products.product"],
        });
        strapi.log.info(
            `Статус заказа обновлен на '${status}' для заказа с ID: ${order.orderId}`,
        );

        return updatedOrder;
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
                    orderStatus: "Ожидается оплата",
                    total: data.total,
                    discount: data.discount,
                    orderId: data.orderId,
                    products: data.products,
                    address: data.userData.address,
                    user: data.userDocumentId,
                    firstName: data.userData.firstName,
                    secondName: data.userData.secondName,
                    email: data.userData.email,
                    phone: data.userData.phone,
                    promocode: data.promocode,
                    isMaster: data.userData.isMaster,
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
                                documentId: order.documentId,
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
                    populate: ["products", "products.product"],
                });

            console.log(updatedOrder);

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
                    const updatedOrder = await processOrderStatus(
                        object.id,
                        "Оплачен",
                    );
                    console.log("payment.waiting_for_capture");
                    const adminEmail = await strapi
                        .plugin("email")
                        .service("email")
                        .send({
                            to: strapi.config.get(
                                "server.app.ADMIN_EMAIL",
                                "1loso@mail.ru",
                            ),
                            from: strapi.config.get(
                                "server.app.FROM_EMAIL",
                                "1loso@mail.ru",
                            ),
                            subject: "Новый заказ",
                            text: `Новый заказ - ${updatedOrder.orderId}`,
                            html: `
    <div style="font-family: Arial, sans-serif; color: #4A3931; padding: 20px; max-width: 800px; margin: auto; border-radius: 0.125rem;">
        <h4 style="font-size: 24px; color: #4A3931; margin-bottom: 20px; text-align: center;">Новый заказ</h4>
        <table style="width: 100%; border-collapse: collapse; background-color: #FAFAFA; border-radius: 0.25rem; overflow: hidden;">
            <tr>
                <td style="white-space: nowrap; padding: 15px; font-size: 16px; border: 1px solid #EAE9E5; background-color: #D3CAC0;">
                    <strong>Номер заказа:</strong>
                </td>
                <td style="width: 100%; padding: 15px; font-size: 16px; border: 1px solid #EAE9E5;">
                    ${updatedOrder.orderId}
                </td>
            </tr>
            <tr>
                <td style="white-space: nowrap;padding: 15px; font-size: 16px; border: 1px solid #EAE9E5; background-color: #D3CAC0;">
                    <strong>Имя и телефон покупателя:</strong>
                </td>
                <td style="width: 100%; padding: 15px; font-size: 16px; border: 1px solid #EAE9E5;">
                ${updatedOrder.firstName.length === 0 ? "Имя" : updatedOrder.firstName} x ${updatedOrder.phone.length === 0 ? "Телефон" : updatedOrder.phone}
                </td>
            </tr>
            <tr>
                <td style="white-space: nowrap; padding: 15px; font-size: 16px; border: 1px solid #EAE9E5;  background-color: #D3CAC0;">
                    <strong>Заказ:</strong>
                </td>
                <td style="width: 100%; padding: 15px; font-size: 16px; border: 1px solid #EAE9E5;">
                    ${updatedOrder.products?.map((item) => `<div style="margin-bottom:5px;">${item.product.name} x ${item.quantity}</div>`).join("")}
                </td>
            </tr>
            <tr>
                <td style="white-space: nowrap;padding: 15px; font-size: 16px; border: 1px solid #EAE9E5; background-color: #D3CAC0;">
                    <strong>Сумма заказа:</strong>
                </td>
                <td style="width: 100%; padding: 15px; font-size: 16px; border: 1px solid #EAE9E5;">${updatedOrder.total} руб</td>
            </tr>
        </table>
    </div>
                    `,
                        });

                    const emailUser = await strapi
                        .plugin("email")
                        .service("email")
                        .send({
                            to: updatedOrder.email,
                            from: strapi.config.get(
                                "server.app.FROM_EMAIL",
                                "1loso@mail.ru",
                            ),
                            subject: "Ваш заказ на skinlight.ru",
                            text: "Ваш заказ на skinlight.ru",
                            html: `
    <div style="font-family: Arial, sans-serif; color: #4A3931; padding: 20px; max-width: 800px; margin: auto; border-radius: 0.125rem;">
        <h4 style="font-size: 24px; color: #4A3931; margin-bottom: 20px; text-align: center;">Ваш заказ</h4>
        <table style="width: 100%; border-collapse: collapse; background-color: #FAFAFA; border-radius: 0.25rem; overflow: hidden;">
            <tr>
                <td style="white-space: nowrap; padding: 15px; font-size: 16px; border: 1px solid #EAE9E5;  background-color: #D3CAC0;">
                    <strong>Заказ:</strong>
                </td>
                <td style="width: 100%; padding: 15px; font-size: 16px; border: 1px solid #EAE9E5;">
                    ${updatedOrder.products?.map((item) => `<div style="margin-bottom:5px;">${item.product.name} x ${item.quantity}</div>`).join("")}
                </td>
            </tr>
            <tr>
                <td style="white-space: nowrap; padding: 15px; font-size: 16px; border: 1px solid #EAE9E5; background-color: #D3CAC0;">
                    <strong>Статус заказа:</strong>
                </td>
                <td style="width: 100%; padding: 15px; font-size: 16px; border: 1px solid #EAE9E5;">
                    ${updatedOrder.orderStatus}
                </td>
            </tr>
            <tr>
                <td style="white-space: nowrap;padding: 15px; font-size: 16px; border: 1px solid #EAE9E5; background-color: #D3CAC0;">
                    <strong>Сумма заказа:</strong>
                </td>
                <td style="width: 100%; padding: 15px; font-size: 16px; border: 1px solid #EAE9E5;">${updatedOrder.total} руб</td>
            </tr>
        </table>
        <p style="text-align: center; margin-top: 20px; font-size: 16px; color: #4A3931;">Спасибо за заказ! Менеджер свяжется с вами в ближайшее время.</p>
        <div style="text-align: center; margin-top: 20px;">
            <a href="https://skinlight.ru/order/${updatedOrder.documentId}" style="display: inline-block; padding: 12px 24px; font-size: 16px; color: #FFFFFF; background-color: #4A3931; border-radius: 4px; text-decoration: none; font-weight: bold; transition: background-color 0.3s;">
                Перейти к заказу
            </a>
        </div>
    </div>
                            `,
                        });

                    await strapi
                        .plugin("yookassa-payment")
                        .service("service")
                        .confirmPayment(object.id);
                    break;

                case "payment.canceled":
                    await processOrderStatus(object.id, "Отменен");
                    console.log("payment.canceled");
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
    async sendFormMessageToAdmin(ctx) {
        const { name, phone, message } = ctx.request.body;
        try {
            await strapi
                .plugin("email")
                .service("email")
                .send({
                    to: strapi.config.get(
                        "server.app.ADMIN_EMAIL",
                        "1loso@mail.ru",
                    ),
                    from: strapi.config.get(
                        "server.app.FROM_EMAIL",
                        "1loso@mail.ru",
                    ),
                    subject: "Новое обращение",
                    text: "Новое обращение",
                    html: `
    <div style="font-family: Arial, sans-serif; color: #4A3931; padding: 20px; max-width: 800px; margin: auto; border-radius: 0.125rem;">
        <h4 style="font-size: 24px; color: #4A3931; margin-bottom: 20px; text-align: center;">Новое обращение</h4>
        <table style="width: 100%; border-collapse: collapse; background-color: #FAFAFA; border-radius: 0.25rem; overflow: hidden;">
            <tr>
                <td style="white-space: nowrap; padding: 15px; font-size: 16px; border: 1px solid #EAE9E5; background-color: #D3CAC0;">
                    <strong>Имя:</strong>
                </td>
                <td style="width: 100%; padding: 15px; font-size: 16px; border: 1px solid #EAE9E5;">
                    ${name}
                </td>
            </tr>
            <tr>
                <td style="white-space: nowrap;padding: 15px; font-size: 16px; border: 1px solid #EAE9E5; background-color: #D3CAC0;">
                    <strong>Телефон:</strong>
                </td>
                <td style="width: 100%; padding: 15px; font-size: 16px; border: 1px solid #EAE9E5;">
                    ${phone}
                </td>
            </tr>
            <tr>
                <td style="white-space: nowrap; padding: 15px; font-size: 16px; border: 1px solid #EAE9E5;  background-color: #D3CAC0;">
                    <strong>Сообщение:</strong>
                </td>
                <td style="width: 100%; padding: 15px; font-size: 16px; border: 1px solid #EAE9E5;">
                    ${message}
                </td>
            </tr>
        </table>
    </div>
        `,
                });

            return ctx.send("", 200);
        } catch (err) {
            console.warn("Ошибка в отправке Уведомления", err);
        }
    },
}));
