'use strict';

/**
 * massemail service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::massemail.massemail');
