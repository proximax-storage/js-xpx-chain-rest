/**
 *** Copyright 2019 ProximaX Limited. All rights reserved.
 *** Use of this source code is governed by the Apache 2.0
 *** license that can be found in the LICENSE file.
 **/

/** @module plugins/service */
const ServiceDb = require('./db/ServiceDb');
const serviceRoutes = require('./routes/serviceRoutes');

/**
 * Creates a service plugin.
 * @type {module:plugins/CatapultRestPlugin}
 */

module.exports = {
	createDb: db => new ServiceDb(db),

	registerTransactionStates: () => {},

	registerMessageChannels: () => {},

	registerRoutes: (...args) => {
		serviceRoutes.register(...args);
	}
};
