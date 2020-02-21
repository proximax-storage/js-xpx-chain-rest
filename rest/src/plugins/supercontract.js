/**
 *** Copyright 2020 ProximaX Limited. All rights reserved.
 *** Use of this source code is governed by the Apache 2.0
 *** license that can be found in the LICENSE file.
 **/

/** @module plugins/supercontract */
const SuperContractDb = require('./db/SuperContractDb');
const superContractRoutes = require('./routes/supercontractRoutes');

/**
 * Creates a super contract plugin.
 * @type {module:plugins/CatapultRestPlugin}
 */
module.exports = {
	createDb: db => new SuperContractDb(db),

	registerTransactionStates: () => {},

	registerMessageChannels: () => {},

	registerRoutes: (...args) => {
		superContractRoutes.register(...args);
	}
};
