/**
 *** Copyright 2019 ProximaX Limited. All rights reserved.
 *** Use of this source code is governed by the Apache 2.0
 *** license that can be found in the LICENSE file.
 **/

/** @module plugins/config */
const ExchangeDb = require('./db/ExchangeDb');
const exchangeRoutes = require('./routes/exchangeRoutes');

/**
 * Creates a exchange plugin.
 * @type {module:plugins/CatapultRestPlugin}
 */

module.exports = {
	createDb: db => new ExchangeDb(db),

	registerTransactionStates: () => {},

	registerMessageChannels: () => {},

	registerRoutes: (...args) => {
		exchangeRoutes.register(...args);
	}
};
