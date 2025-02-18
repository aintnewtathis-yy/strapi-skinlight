module.exports = (plugin) => {
    plugin.controllers.user.updateMe = async (ctx) => {
        if (!ctx.state.user || !ctx.state.user.id) {
            return (ctx.response.status = 401);
        }
        await strapi
            .query("plugin::users-permissions.user")
            .update({
                where: { id: ctx.state.user.id },
                data: ctx.request.body,
            })
            .then((res) => {
                ctx.response.status = 200;
                ctx.body = { user: res };
            });
    };

    plugin.routes["content-api"].routes.push({
        method: "PUT",
        path: "/user/me",
        handler: "user.updateMe",
        config: {
            prefix: "",
            policies: [],
        },
    });

    plugin.controllers.user.uploadCertificates = async (ctx) => {
        try {
            const { id } = ctx.state.user;

            if (!ctx.state.user || !ctx.state.user.id) {
                return (ctx.response.status = 401);
            }

            // Upload files
            const uploadedFiles =
                await strapi.plugins.upload.services.upload.upload({
                    data: {
                        path: "certificates",
                    }, 
                    files: ctx.request.files.files,
                });

            // Update user with uploaded files
            const updatedUser = await strapi
                .query("plugin::users-permissions.user")
                .update({
                    where: { id: ctx.state.user.id },
                    data: {
                        certificates: uploadedFiles.map((file) => file.id),
                        masterStatus: "Ожидает проверки",
                    },
                });

            ctx.response.status = 200;
            ctx.body = updatedUser;
        } catch (err) {
            ctx.throw(500, err);
        }
    };

    plugin.routes["content-api"].routes.push({
        method: "POST",
        path: "/user/upload-certificates",
        handler: "user.uploadCertificates",
        config: {
            prefix: "",
            policies: [],
        },
    });

    return plugin;
};
