/**
 *** Copyright 2019 ProximaX Limited. All rights reserved.
 *** Use of this source code is governed by the Apache 2.0
 *** license that can be found in the LICENSE file.
 * */

const { convertToLong } = require('../../db/dbUtils');

class ConfigDb {
	/**
	 * Creates ConfigDb around CatapultDb.
	 * @param {module:db/CatapultDb} db Catapult db instance.
	 */
	constructor(db) {
		this.catapultDb = db;
	}

	// region config retrieval

	/**
	 * Retrieves the configs entries <= height.
	 * @param {module:catapult.utils/uint64~uint64} height of config.
	 * @param {number} limit the query
	 * @returns {Promise.<array>} The config entries.
	 */
	configsLessOrEqualThanHeight(height, limit = 0) {
		return this.catapultDb.queryDocuments(
			'networkConfigs',
			{
				'networkConfig.height': {
					$lte: convertToLong(height)
				}
			},
			{
				sort: {
					'networkConfig.height': -1
				},
				limit
			}
		);
	}

	// endregion
}

module.exports = ConfigDb;
