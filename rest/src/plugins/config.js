/**
 *** Copyright 2019 ProximaX Limited. All rights reserved.
 *** Use of this source code is governed by the Apache 2.0
 *** license that can be found in the LICENSE file.
 **/

/** @module plugins/config */
const ConfigDb = require('./db/ConfigDb');
const configRoutes = require('./routes/configRoutes');

/**
 * Creates a config plugin.
 * @type {module:plugins/CatapultRestPlugin}
 */

module.exports = {
	createDb: db => new ConfigDb(db),

	registerTransactionStates: () => {},

	registerMessageChannels: () => {},

	registerRoutes: (...args) => {
		configRoutes.register(...args);
	}
};
