/**
 *** Copyright 2019 ProximaX Limited. All rights reserved.
 *** Use of this source code is governed by the Apache 2.0
 *** license that can be found in the LICENSE file.
 **/

/** @module plugins/receipts */
const RichlistDb = require('./db/RichlistDb');
const richlistRoutes = require('./routes/richlistRoutes');

/**
 * Creates a receipts plugin.
 * @type {module:plugins/CatapultRestPlugin}
 */
module.exports = {
	createDb: db => new RichlistDb(db),

	registerTransactionStates: () => {},

	registerMessageChannels: () => {},

	registerRoutes: (...args) => {
		richlistRoutes.register(...args);
	}
};
