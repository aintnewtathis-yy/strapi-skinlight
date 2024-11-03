const service = ({ strapi }) => ({
    async initialPayment(ctx) {
        const authorization = `Basic ${strapi.config.get('server.app.API_YOOKASSA_URL')}`;
        const paymentMessage = 'Списываем оплату за заказ';
        const successUrl = '/success';

        const { paymentData } = ctx.request.body;
        try {
            const url = 'https://api.yookassa.ru/v3/payments';

            const total = paymentData.total;

            // параметры для запроса
            const headers = {
                Authorization: authorization,
                'Idempotence-Key': crypto.randomUUID(),
                'Content-Type': 'application/json',
            };

            const params = {
                amount: {
                    value: total.toString(),
                    currency: 'RUB',
                },
                payment_method_data: {
                    type: 'bank_card',
                },
                confirmation: {
                    type: 'redirect',
                    return_url: successUrl,
                },
                description: paymentMessage,
                save_payment_method: 'false',
            };

            const response = await fetch(url, {
                method: 'POST',
                headers: headers,
                body: JSON.stringify(params),
            });

            if (!response.ok) {
                throw new Error(`HTTP error: ${response.status}`);
            }

            const res = await response.json();

            console.log({ url: res.confirmation.confirmation_url, id: res.id });

            return {
                url: res.confirmation.confirmation_url,
                id: res.id,
            };
        } catch (err) {
            console.warn('ERROR', err);

            throw error(400, {
                message: 'Error in making order',
                details: err.message,
            });
        }
    },
    async confirmPayment(orderId) {
        const authorization = `Basic ${strapi.config.get('server.app.API_YOOKASSA_URL')}`;
        console.log(orderId, 'id');
        console.log(authorization, 'authorization');
        try {
            const responsePayment = await fetch(
                `https://api.yookassa.ru/v3/payments/${orderId}/capture`,
                {
                    method: 'POST',
                    headers: {
                        Authorization: authorization,
                        'Idempotence-Key': crypto.randomUUID(),
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({}),
                }
            );

            const responsePaymentData = await responsePayment.json();
            console.log('Payment confirmed:', responsePaymentData.id);

            return {
                message: 'Payment confirmed and order status updated',
                order: responseOrderData,
                payment: responsePaymentData,
            };
        } catch (err) {
            throw new Error(400, {
                message: 'Error in confirming payment',
                details: err.message,
            });
        }
    },
    async cancelPayment(order_id) {
        const authorization = `Basic ${strapi.config.get('server.app.API_YOOKASSA_URL')}`;
        try {
            const responsePayment = await fetch(
                `https://api.yookassa.ru/v3/payments/${order_id}/cancel`,
                {
                    method: 'POST',
                    headers: {
                        Authorization: authorization,
                        'Idempotence-Key': crypto.randomUUID(),
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({}),
                }
            );

            if (!responsePayment.ok) {
                throw new Error('Failed to confirm payment in YooKassa');
            }

            const responsePaymentData = await responsePayment.json();
            console.log('Payment cancelled:', responsePaymentData);

            return {
                message: 'Payment cancelled',
                order: responseOrderData,
                payment: responsePaymentData,
            };
        } catch (err) {
            console.warn(`Error confirming payment: ${err.message}`);
            throw error(400, {
                message: 'Error in confirming payment',
                details: err.message,
            });
        }
    },
});

export default service;
