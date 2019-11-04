/**
 *** Copyright 2019 ProximaX Limited. All rights reserved.
 *** Use of this source code is governed by the Apache 2.0
 *** license that can be found in the LICENSE file.
 * */

const { convertToLong } = require('../../db/dbUtils');

class UpgradeDb {
	/**
	 * Creates UpgradeDb around CatapultDb.
	 * @param {module:db/CatapultDb} db Catapult db instance.
	 */
	constructor(db) {
		this.catapultDb = db;
	}

	// region upgrade retrieval

	/**
	 * Retrieves the upgrade entries <= height.
	 * @param {module:catapult.utils/uint64~uint64} height of upgrade.
	 * @param {number} limit the query
	 * @returns {Promise.<array>} The upgrade entries.
	 */
	upgradesLessOrEqualThanHeight(height, limit = 0) {
		return this.catapultDb.queryDocuments(
			'blockchainUpgrades',
			{
				'blockchainUpgrade.height': {
					$lte: convertToLong(height)
				}
			},
			{
				sort: {
					'blockchainUpgrade.height': -1
				},
				limit
			}
		);
	}

	// endregion
}

module.exports = UpgradeDb;
