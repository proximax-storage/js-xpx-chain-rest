/**
 *** Copyright 2020 ProximaX Limited. All rights reserved.
 *** Use of this source code is governed by the Apache 2.0
 *** license that can be found in the LICENSE file.
 * */

const AccountType = require('../AccountType');

class OperationDb {
	/**
	 * Creates OperationDb around CatapultDb.
	 * @param {module:db/CatapultDb} db Catapult db instance.
	 */
	constructor(db) {
		this.catapultDb = db;
	}

	// region super contract retrieval

	/**
	 * Retrieves the operation entries by account id.
	 * @param {module:db/AccountType} type Type of account id.
	 * @param {array<object>} accountId Account id.
	 * @returns {Promise.<array>} The operation entry.
	 */
	getOperationsByAccountId(type, accountId) {
		const buffer = Buffer.from(accountId);
		const fieldName = (AccountType.publicKey === type) ? 'operation.account' : 'operation.accountAddress';
		return this.catapultDb.queryDocuments('operations', { [fieldName]: buffer });
	}

	/**
	 * Retrieves the operation entry by token.
	 * @param {object} token The token of operation.
	 * @returns {Promise.<object>} The operation entries.
	 */
	getOperationByToken(token) {
		const buffer = Buffer.from(token);
		const fieldName = 'operation.token';
		return this.catapultDb.queryDocuments('operations', { [fieldName]: buffer });
	}

	// endregion
}

module.exports = OperationDb;
