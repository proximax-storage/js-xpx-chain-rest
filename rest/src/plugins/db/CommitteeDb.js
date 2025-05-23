/**
 *** Copyright 2020 ProximaX Limited. All rights reserved.
 *** Use of this source code is governed by the Apache 2.0
 *** license that can be found in the LICENSE file.
 * */

const AccountType = require('../AccountType');

class CommitteeDb {
	/**
	 * Creates CommitteeDb around CatapultDb.
	 * @param {module:db/CatapultDb} db Catapult db instance.
	 */
	constructor(db) {
		this.catapultDb = db;
	}

	// region harvester retrieval

    /**
     * Retrieves the committee entry by account id.
     * @param {module:db/AccountType} type Type of account id.
     * @param {array<object>} accountId Account id.
     * @returns {Promise.<object>} The committee entry.
     */
    getHarvesterByAccountId(type, accountId) {
        const buffer = Buffer.from(accountId);
        const fieldName = (AccountType.publicKey === type) ? 'harvester.key' : 'harvester.address';
        return this.catapultDb.queryDocuments('harvesters', { [fieldName]: buffer });
    }

    /**
	 * Retrieves paginated harvesters.
	 * @param {object} options Options for ordering and pagination. Can have the `sortField`, `sortDirection`,
	 * `pageSize`.
	 * and `pageNumber`.
	 * @returns {Promise.<object>} Harvesters page.
	 */
     harvesters(options) {
		const sortConditions = {$sort: {[options.sortField]: options.sortDirection}};
		return this.catapultDb.queryPagedDocuments_2([], [], sortConditions, "harvesters", options);
    }

	// endregion
}

module.exports = CommitteeDb;
