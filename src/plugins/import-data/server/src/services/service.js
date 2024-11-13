async function getImage(thumbnailName) {
    let images;
    try {
        let response = await fetch(
            `http://localhost:1337/api/upload/files?filters[name][$eq]=${thumbnailName}`,
            {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            }
        );
        images = await response.json();

        if (images.length < 1) {
            let response1 = await fetch(
                `http://localhost:1337/api/upload/files?filters[name][$eq]=${thumbnailName.replace('png', 'jpg')}`,
                {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                }
            );

            images = await response1.json();
        }

        return images[0]?.id;
    } catch (error) {
        console.error('Failed to fetch image:', error);
    }
}
async function getCategory(categories) {
    const categoriesArr = [];
    await Promise.all(
        categories.map(async (category) => {
            const categoryDocument = await strapi.documents('api::category.category').findFirst({
                filters: {
                    name: category,
                },
            });
            if (categoryDocument) {
                categoriesArr.push(categoryDocument);
            }
        })
    );
    return categoriesArr;
}
async function getLine(line) {
    const lineDocument = await strapi.documents('api::line.line').findFirst({
        filters: {
            name: line,
        },
    });
    return lineDocument;
}
async function getBrand(brand) {
    const brandDocument = await strapi.documents('api::brand.brand').findFirst({
        filters: {
            name: brand,
        },
    });
    return brandDocument;
}
function createSlug(title) {
    const cyrillicToLatinMap = {
        а: 'a',
        б: 'b',
        в: 'v',
        г: 'g',
        д: 'd',
        е: 'e',
        ё: 'e',
        ж: 'zh',
        з: 'z',
        и: 'i',
        й: 'y',
        к: 'k',
        л: 'l',
        м: 'm',
        н: 'n',
        о: 'o',
        п: 'p',
        р: 'r',
        с: 's',
        т: 't',
        у: 'u',
        ф: 'f',
        х: 'kh',
        ц: 'ts',
        ч: 'ch',
        ш: 'sh',
        щ: 'shch',
        ы: 'y',
        э: 'e',
        ю: 'yu',
        я: 'ya',
        ь: '',
        ъ: '',
    };

    return title
        .toLowerCase()
        .split('')
        .map((char) => cyrillicToLatinMap[char] || char) // Transliterate
        .join('')
        .replace(/[^\w\s]/g, '') // Remove punctuation
        .replace(/\s+/g, '-') // Replace spaces with hyphens
        .replace(/-+/g, '-') // Remove multiple consecutive hyphens
        .trim(); // Trim any trailing spaces or hyphens
}

const service = ({ strapi }) => ({
    async products(ctx) {
        const { data } = ctx.request.body;
        try {
            data.forEach(async (row) => {
                const imageId = await getImage(row.thumbnail.slice(4));
                const categories = await getCategory(row.category);
                const line = await getLine(row.line);
                const brand = await getBrand(row.brand);
                const product = await strapi.documents('api::product.product').create({
                    data: {
                        name: row.name,
                        shortDesc: row.shortDesc,
                        thumbnail: imageId,
                        fullDesc: row.fullDesc,
                        weight: row.weight,
                        ingredients: row.compound,
                        categories: categories,
                        line: line,
                        brand: brand,
                        usage: row.usage,
                        SKU: row.SKU,
                        priceEUR: row.priceEUR,
                        seo: {
                            title: row.name,
                            description: row.shortDesc,
                            image: imageId,
                            slug: createSlug(row.name),
                        },
                    },
                    status: row.active === 'Y' ? 'published' : 'draft',
                });
            });
            return ctx.send('', 200);
        } catch (err) {
            strapi.log.error(`Ошибка при обработке Линеек: ${err.message}`);
            return ctx.internalServerError('Внутренняя ошибка сервера при обработке уведомления');
        }
    },
    async categories(ctx) {
        const { data } = ctx.request.body;

        try {
            data.forEach(async (row) => {
                console.log(row);
                const category = await strapi.documents('api::category.category').create({
                    data: {
                        name: row.name,
                        seo: {
                            title: row.title,
                            description: row.description,
                            slug: row.slug,
                        },
                    },
                    status: 'published',
                });
            });
            return ctx.send('', 200);
        } catch (err) {
            strapi.log.error(`Ошибка при обработке Категорий: ${err.message}`);
            return ctx.internalServerError('Внутренняя ошибка сервера при обработке уведомления');
        }
    },
    async lines(ctx) {
        const { data } = ctx.request.body;
        try {
            data.forEach(async (row) => {
                console.log(row);

                const line = await strapi.documents('api::line.line').create({
                    data: {
                        name: row.name,
                        seo: {
                            title: row.title,
                            description: row.description,
                            slug: row.slug,
                        },
                    },
                    status: 'published',
                });
            });

            return ctx.send('', 200);
        } catch (err) {
            strapi.log.error(`Ошибка при обработке Линеек: ${err.message}`);
            return ctx.internalServerError('Внутренняя ошибка сервера при обработке уведомления');
        }
    },
    async updateThumbnails(ctx) {
        const { data } = ctx.request.body;
        try {
            data.forEach(async (row) => {
                const product = await strapi.documents('api::product.product').findFirst({
                    filters: {
                        name: row.name,
                    },
                    populate: '*',
                });

                if (!product.thumbnail) {
                    const imageId = await getImage(row.thumbnail.slice(4));
                    const updatedProduct = await strapi.documents('api::product.product').update({
                        documentId: product.documentId,
                        data: {
                            name: product.name,
                            shortDesc: product.shortDesc,
                            thumbnail: imageId,
                            fullDesc: product.fullDesc,
                            weight: product.weight,
                            ingredients: product.compound,
                            categories: product.categories,
                            line: product.line,
                            brand: product.brand,
                            usage: product.usage,
                            SKU: product.SKU,
                            priceEUR: product.priceEUR,
                            seo: {
                                title: product.name,
                                description: product.shortDesc,
                                image: imageId,
                                slug: product.seo.slug,
                            },
                        },
                        status: row.active === 'Y' ? 'published' : 'draft',
                    });

                    return updatedProduct;
                }
            });
            return ctx.send('', 200);
        } catch (err) {
            strapi.log.error(`Ошибка при обработке Линеек: ${err.message}`);
            return ctx.internalServerError('Внутренняя ошибка сервера при обработке уведомления');
        }

        return 'success';
    },
    async updateStatus(ctx) {
        const { data } = ctx.request.body;
        data.forEach(async (row) => {
            try {
                const product = await strapi.documents('api::product.product').findFirst({
                    filters: {
                        name: row.name,
                    },
                });

                if (row.active === 'Y') {
                    const updatedProduct = await strapi.documents('api::product.product').update({
                        documentId: product.documentId,
                        status: 'published',
                    });
                    return updatedProduct;
                } else {
                    const updatedProduct = await strapi.documents('api::product.product').update({
                        documentId: product.documentId,
                        status: 'draft',
                    });
                    return updatedProduct;
                }
            } catch (err) {
                console.warn(err, 'error');
            }
        });

        return 'success';
    },
    async updateLines(ctx) {
        const { data } = ctx.request.body;
        data.forEach(async (row) => {
            try {
                const product = await strapi.documents('api::product.product').findFirst({
                    filters: {
                        name: row.name,
                    },
                    populate: '*',
                });

                if (!product.line) {
                    const line = await getLine(row.line);
                    const array = [line];
                    console.log(array);
                    const updatedProduct = await strapi.documents('api::product.product').update({
                        documentId: product.documentId,
                        data: {
                            name: product.name,
                            shortDesc: product.shortDesc,
                            thumbnail: product.thumbnail,
                            fullDesc: product.fullDesc,
                            weight: product.weight,
                            ingredients: product.compound,
                            categories: product.categories,
                            line: line,
                            brand: product.brand,
                            usage: product.usage,
                            SKU: product.SKU,
                            priceRUB: product.priceRUB,
                            priceEUR: product.priceEUR,
                            seo: {
                                title: product.name,
                                description: product.shortDesc,
                                image: product.thumbnail,
                                slug: product.seo.slug,
                            },
                        },
                        status: 'published',
                    });
                    return updatedProduct;
                }
            } catch (err) {
                console.warn(err, 'error');
            }
        });

        return 'success';
    },
});

export default service;
