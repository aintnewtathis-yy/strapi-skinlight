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
                    orderId: data.orderId,
                    products: data.products,
                    address: data.userData.address,
                    user: data.userDocumentId,
                    firstName: data.userData.firstName,
                    secondName: data.userData.secondName,
                    email: data.userData.email,
                    phone: data.userData.phone,
                },
                status: "published",
            });

            console.log(order);

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
                            to: "vyshyvanovilya@gmail.com",
                            from: "1loso@mail.ru",
                            subject: "Новый заказ",
                            text: "Новый заказ",
                            html: `
                    <div style="font-family: Arial, sans-serif; color: #333; padding: 20px; max-width: 800px; margin: auto;">
                        <h4 style="font-size: 18px; color: #555; margin-bottom: 20px;">Новое обращение:</h4>
                        <table style="width: 100%; border-collapse: collapse; border: 1px solid #ddd; background-color: #f9f9f9;">
                            <tr>
                                <td style="padding: 10px; font-size: 16px; border-bottom: 1px solid #ddd;"><strong>Номер заказа:</strong></td>
                                <td style="padding: 10px; font-size: 16px; border-bottom: 1px solid #ddd;">${updatedOrder.orderId}</td>
                            </tr>
                            <tr>
                                <td style="padding: 10px; font-size: 16px; border-bottom: 1px solid #ddd;"><strong>Имя и телефон покупателя:</strong></td>
                                <td style="padding: 10px; font-size: 16px; border-bottom: 1px solid #ddd;">${updatedOrder.firstName.length === 0 ? "Имя" : updatedOrder.firstName} x ${updatedOrder.phone.length === 0 ? "Телефон" : updatedOrder.phone}</td>
                            </tr>
                            <tr>
                                <td style="padding: 10px; font-size: 16px; border-bottom: 1px solid #ddd;"><strong>Заказ:</strong></td>
                                <td style="padding: 10px; font-size: 16px; border-bottom: 1px solid #ddd;">
                                ${updatedOrder.products?.map((item) => `${item.product.name} x ${item.quantity}`).join("<br>")}
                                </td>
                            </tr>
                            <tr>
                                <td style="padding: 10px; font-size: 16px; border-bottom: 1px solid #ddd;"><strong>Сумма заказа:</strong></td>
                                <td style="padding: 10px; font-size: 16px; border-bottom: 1px solid #ddd;">${updatedOrder.total} руб</td>
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
                            from: "1loso@mail.ru",
                            subject: "Ваш заказ на skinlight.ru",
                            text: "Ваш заказ на skinlight.ru",
                            html: `
                <div style="font-family: Arial, sans-serif; color: #333; padding: 20px; max-width: 800px; margin: auto; background-color: #fff; box-shadow: 0px 4px 8px rgba(0,0,0,0.1);">
    <h4 style="font-size: 24px; color: #444; margin-bottom: 20px; text-align: center;">Ваш заказ</h4>
    <table style="width: 100%; border-collapse: collapse; border: 1px solid #e0e0e0; background-color: #f9f9f9; border-radius: 8px; overflow: hidden;">
        <tr>
            <td style="padding: 15px; font-size: 16px; border-bottom: 1px solid #ddd; background-color: #f0f0f0;"><strong>Заказ:</strong></td>
            <td style="padding: 15px; font-size: 16px; border-bottom: 1px solid #ddd;">
                ${updatedOrder.products?.map((item) => `<div>${item.product.name} x ${item.quantity}</div>`).join("")}
            </td>
        </tr>
        <tr>
            <td style="padding: 15px; font-size: 16px; border-bottom: 1px solid #ddd; background-color: #f0f0f0;"><strong>Статус заказа:</strong></td>
            <td style="padding: 15px; font-size: 16px; border-bottom: 1px solid #ddd;">
                ${updatedOrder.orderStatus}
            </td>
        </tr>
        <tr>
            <td style="padding: 15px; font-size: 16px; background-color: #f0f0f0;"><strong>Сумма заказа:</strong></td>
            <td style="padding: 15px; font-size: 16px;">${updatedOrder.total} руб</td>
        </tr>
    </table>
    <p style="text-align: center; margin-top: 20px; font-size: 16px;">Спасибо за заказ! Менеджер свяжется с вами в ближайшее время.</p>
    <div style="text-align: center; margin-top: 20px;">
        <a href="https://sveltekit-app.cr.ylean.ru/order/${updatedOrder.documentId}" style="display: inline-block; padding: 10px 20px; font-size: 16px; color: #fff; background-color: #4CAF50; text-decoration: none; border-radius: 5px;">Ссылка на страницу заказа</a>
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
                    to: "vyshyvanovilya@gmail.com",
                    from: "1loso@mail.ru",
                    subject: "Новое обращение",
                    text: "Новое обращение",
                    html: `
            <div style="font-family: Arial, sans-serif; color: #333; padding: 20px; max-width: 600px; margin: auto;">
                <h4 style="font-size: 18px; color: #555; margin-bottom: 20px;">Новое обращение:</h4>
                <table style="width: 100%; border-collapse: collapse; border: 1px solid #ddd; background-color: #f9f9f9;">
                    <tr>
                        <td style="padding: 10px; font-size: 16px; border-bottom: 1px solid #ddd;"><strong>Имя:</strong></td>
                        <td style="padding: 10px; font-size: 16px; border-bottom: 1px solid #ddd;">${name}</td>
                    </tr>
                    <tr>
                        <td style="padding: 10px; font-size: 16px; border-bottom: 1px solid #ddd;"><strong>Телефон:</strong></td>
                        <td style="padding: 10px; font-size: 16px; border-bottom: 1px solid #ddd;">${phone}</td>
                    </tr>
                    <tr>
                        <td style="padding: 10px; font-size: 16px; border-bottom: 1px solid #ddd;"><strong>Сообщение:</strong></td>
                        <td style="padding: 10px; font-size: 14px; color: #666;">${message}</td>
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
