/**
 *** Copyright 2020 ProximaX Limited. All rights reserved.
 *** Use of this source code is governed by the Apache 2.0
 *** license that can be found in the LICENSE file.
 **/

/** @module plugins/committee */
const CommitteeDb = require('./db/CommitteeDb');
const committeeRoutes = require('./routes/committeeRoutes');

/**
 * Creates a committee plugin.
 * @type {module:plugins/CatapultRestPlugin}
 */
module.exports = {
	createDb: db => new CommitteeDb(db),

	registerTransactionStates: () => {},

	registerMessageChannels: () => {},

	registerRoutes: (...args) => {
		committeeRoutes.register(...args);
	}
};
