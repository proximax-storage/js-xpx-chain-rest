/**
 *** Copyright 2022 ProximaX Limited. All rights reserved.
 *** Use of this source code is governed by the Apache 2.0
 *** license that can be found in the LICENSE file.
 **/

/** @module plugins/liquidityProvider */
const LiquidityProviderDb = require('./db/LiquidityProviderDb');
const liquidityProviderRoutes = require('./routes/liquidityProviderRoutes');

/**
 * Creates a liquidity provider plugin.
 * @type {module:plugins/CatapultRestPlugin}
 */

module.exports = {
	createDb: db => new LiquidityProviderDb(db),

	registerTransactionStates: () => {},

	registerMessageChannels: () => {},

	registerRoutes: (...args) => {
		liquidityProviderRoutes.register(...args);
	}
};
