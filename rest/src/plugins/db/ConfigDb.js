/**
 *** Copyright 2019 ProximaX Limited. All rights reserved.
 *** Use of this source code is governed by the Apache 2.0
 *** license that can be found in the LICENSE file.
 * */

const { convertToLong, buildOffsetCondition} = require('../../db/dbUtils');

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
	/**
	 * Retrieves filtered and paginated networkConfig configurations.
	 * @param {object} heightCondition Conditions that describes how to filter based on the height field
	 * @param {object} options Options for ordering and pagination. Can have an `offset`, and must contain the `sortField`, `sortDirection`,
	 * `pageSize` and `pageNumber`. 'sortField' must be within allowed 'sortingOptions'.
	 * @returns {Promise.<object>} Network configuration page.
	 */
	networkConfigurations(heightCondition, options) {
		const sortingOptions = { id: '_id' };

		let conditions = {};

		const offsetCondition = buildOffsetCondition(options, sortingOptions);
		if (offsetCondition)
			conditions = Object.assign(conditions, offsetCondition);

		if (undefined !== heightCondition)
			conditions['networkConfig.height'] = heightCondition;

		const sortConditions = { [sortingOptions[options.sortField]]: options.sortDirection };
		return this.catapultDb.queryPagedDocumentsExt(conditions, [], sortConditions, 'networkConfigs', options);
	}

	// endregion
}

module.exports = ConfigDb;
