/**
 *** Copyright 2019 ProximaX Limited. All rights reserved.
 *** Use of this source code is governed by the Apache 2.0
 *** license that can be found in the LICENSE file.
 **/


/** @module plugins/metadata */
const MetadataDb = require('./db/MetadataDb');
const metadataRoutes = require('./routes/metadataRoutes');

/**
 * Creates a metadata plugin.
 * @type {module:plugins/CatapultRestPlugin}
 */

module.exports = {
	createDb: db => new MetadataDb(db),

	registerTransactionStates: () => {},

	registerMessageChannels: () => {},

	registerRoutes: (...args) => {
		metadataRoutes.register(...args);
	}
};
