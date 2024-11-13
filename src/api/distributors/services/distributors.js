'use strict';

/**
 * distributors service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::distributors.distributors');
