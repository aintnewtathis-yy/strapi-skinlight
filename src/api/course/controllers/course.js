"use strict";

/**
 * course controller
 */

const { createCoreController } = require("@strapi/strapi").factories;

module.exports = createCoreController("api::course.course", ({ strapi }) => ({
    async getCourseData(ctx) {
        const { slug } = ctx.query;

        try {
            const course = await strapi
                .documents("api::course.course")
                .findFirst({
                    filters: {
                        seo: {
                            slug: {
                                $eq: slug,
                            },
                        },
                    },
                    populate: [
                        "heroCourses",
                        "heroCourses.image",
                        "blockCourses",
                        "blockCourses.image",
                        "seo",
                        "seo.image",
                    ],
                    status: "published",
                });

            return course;
        } catch (err) {
            console.log(err);
            ctx.throw(500, err);
        }
    },
    async getAllCourses(ctx) {
        try {
            const courses = await strapi
                .documents("api::course.course")
                .findMany({
                    populate: [
                        "heroCourses",
                        "heroCourses.image",
                        "seo",
                        "category",
                        "category.seo",
                    ],
                    status: "published",
                });

            const categories = await strapi
                .documents("api::course-category.course-category")
                .findMany({
                    populate: ["courses", "seo"],
                    status: "published",
                });

            return {
                courses,
                categories,
            };
        } catch (err) {
            console.log(err);
            ctx.throw(500, err);
        }
    },
    async sendCourseAttendantToAdmin(ctx) {
        const { name, phone, course } = ctx.request.body;
        try {
            await strapi
                .plugin("email")
                .service("email")
                .send({
                    to: "vyshyvanovilya@gmail.com",
                    from: "1loso@mail.ru",
                    subject: "Новая заявка на курс",
                    text: "Новая заявка на курс",
                    html: `
            <div style="font-family: Arial, sans-serif; color: #4A3931; padding: 20px; max-width: 800px; margin: auto; border-radius: 0.125rem;">
        <h4 style="font-size: 24px; color: #4A3931; margin-bottom: 20px; text-align: center;">Новая заявка на курс</h4>
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
                    <strong>Курс:</strong>
                </td>
                <td style="width: 100%; padding: 15px; font-size: 16px; border: 1px solid #EAE9E5;">
                    ${course}
                </td>
            </tr>
        </table>
    </div>
        `,
                });

            return ctx.send("", 200);
        } catch (err) {
            console.warn("Ошибка в отправке email", err);
        }
    },
}));
