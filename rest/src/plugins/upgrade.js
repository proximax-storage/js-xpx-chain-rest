/**
 *** Copyright 2019 ProximaX Limited. All rights reserved.
 *** Use of this source code is governed by the Apache 2.0
 *** license that can be found in the LICENSE file.
 **/

/** @module plugins/upgrade */
const UpgradeDb = require('./db/UpgradeDb');
const upgradeRoutes = require('./routes/upgradeRoutes');

/**
 * Creates a upgrade plugin.
 * @type {module:plugins/CatapultRestPlugin}
 */

module.exports = {
	createDb: db => new UpgradeDb(db),

	registerTransactionStates: () => {},

	registerMessageChannels: () => {},

	registerRoutes: (...args) => {
		upgradeRoutes.register(...args);
	}
};
