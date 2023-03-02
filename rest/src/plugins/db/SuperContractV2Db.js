/**
 *** Copyright 2023 ProximaX Limited. All rights reserved.
 *** Use of this source code is governed by the Apache 2.0
 *** license that can be found in the LICENSE file.
 **/

const AccountType = require('../AccountType');

class SuperContractV2Db {
    /**
	 * Creates SuperContractV2Db around CatapultDb.
	 * @param {module:db/CatapultDb} db Catapult db instance.
	 */
	constructor(db) {
		this.catapultDb = db;
	}

    // region supercontract retrieval

	/**
	* Retrieves filtered and paginated bcdrives.
	* @param {object} filters Filters to be applied: 'driveKey', 'creator'
	* @param {object} options Options for ordering and pagination. Can have an `offset`, and must contain the `sortField`, `sortDirection`,
	* `pageSize`.
	* and `pageNumber`.
    * @returns {Promise.<object>} Supercontract page.
	*/
	supercontracts(filters, options) {
		const buildConditions = () => {
			const conditions = [];

			// it is assumed that sortField will always be an `id` for now - this will need to be redesigned when it gets upgraded
			// in fact, offset logic should be moved to `queryPagedDocuments`
			if (options.offset !== undefined)
				conditions.push({[options.sortField]: {[1 === options.sortDirection ? '$gt' : '$lt']: new ObjectId(options.offset)}});

			if (filters.driveKey !== undefined) {
				const buffer = Buffer.from(filters.driveKey);
				conditions.push({'supercontract.driveKey': buffer});
			}

			if (filters.creator !== undefined) {
				const buffer = Buffer.from(filters.creator);
				conditions.push({'supercontract.creator': buffer});
			}

			return conditions;
		}

		const sortConditions = {$sort: {[options.sortField]: options.sortDirection}};
		const conditions = buildConditions();

		return this.catapultDb.queryPagedDocuments_2(conditions, [], sortConditions, "supercontracts", options);
	}

	
	/**
	 * Retrieves super contract entry by account id.
	 * @param {module:db/AccountType} type Type of account id.
	 * @param {array<object>} accountId Account id.
	 * @returns {Promise.<object>} The super contract entry.
	 */
	getSuperContractByAccountId(type, accountId) {
		const buffer = Buffer.from(accountId);
		const fieldName = (AccountType.publicKey === type) ? 'supercontract.contractKey' : 'supercontract.contractAddress';
		return this.catapultDb.queryDocuments('supercontracts', { [fieldName]: buffer });
	}

	// endregion
}

module.exports = SuperContractV2Db;
