/**
 *** Copyright 2021 ProximaX Limited. All rights reserved.
 *** Use of this source code is governed by the Apache 2.0
 *** license that can be found in the LICENSE file.
 **/

/** @module plugins/storage */
const StorageDb = require('./db/StorageDb');
const storageRoutes = require('./routes/storageRoutes');

/**
 * Creates a storage plugin.
 * @type {module:plugins/CatapultRestPlugin}
 */

module.exports = {
	createDb: db => new StorageDb(db),

	registerTransactionStates: () => {},

	registerMessageChannels: () => {},

	registerRoutes: (...args) => {
		storageRoutes.register(...args);
	}
};
