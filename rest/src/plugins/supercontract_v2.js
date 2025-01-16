/**
 *** Copyright 2023 ProximaX Limited. All rights reserved.
 *** Use of this source code is governed by the Apache 2.0
 *** license that can be found in the LICENSE file.
 **/

/** @module plugins/supercontract_v2 */
const SuperContractV2Db = require('./db/SuperContractV2Db');
const supercontractV2Routes = require('./routes/supercontractV2Routes');

/**
 * Creates a supercontract_v2 plugin.
 * @type {module:plugins/CatapultRestPlugin}
 */

module.exports = {
	createDb: db => new SuperContractV2Db(db),

	registerTransactionStates: () => {},

	registerMessageChannels: () => {},

	registerRoutes: (...args) => {
		supercontractV2Routes.register(...args);
	}
};
