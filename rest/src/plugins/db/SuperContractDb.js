/**
 *** Copyright 2020 ProximaX Limited. All rights reserved.
 *** Use of this source code is governed by the Apache 2.0
 *** license that can be found in the LICENSE file.
 * */

const AccountType = require('../AccountType');

class SuperContractDb {
	/**
	 * Creates SuperContractDb around CatapultDb.
	 * @param {module:db/CatapultDb} db Catapult db instance.
	 */
	constructor(db) {
		this.catapultDb = db;
	}

	// region super contract retrieval

	/**
	 * Retrieves super contract entry by account id.
	 * @param {module:db/AccountType} type Type of account id.
	 * @param {array<object>} accountId Account id.
	 * @returns {Promise.<object>} The super contract entry.
	 */
	getSuperContractByAccountId(type, accountId) {
		const buffer = Buffer.from(accountId);
		const fieldName = (AccountType.publicKey === type) ? 'supercontract.multisig' : 'supercontract.multisigAddress';
		return this.catapultDb.queryDocuments('supercontracts', { [fieldName]: buffer });
	}

	/**
	 * Retrieves super contract entries by drive.
	 * @param {object} publicKey The drive public key.
	 * @returns {Promise.<array>} The super contract entries for drive.
	 */
	getSuperContractsByDrivePublicKey(publicKey) {
		const buffer = Buffer.from(publicKey);
		const fieldName = 'supercontract.mainDriveKey';
		return this.catapultDb.queryDocuments('supercontracts', { [fieldName]: buffer });
	}

	/**
	 * Retrieves super contract entries by owner.
	 * @param {object} publicKey The owner public key.
	 * @param {string} id Paging id.
	 * @param {int} pageSize Page size.
	 * @param {object} options Additional options.
	 * @returns {Promise.<array>} The super contract entries owner.
	 */
	getSuperContractsByOwnerPublicKey(publicKey, pagingId, pageSize, options) {
		const buffer = Buffer.from(publicKey);
		const fieldName = 'supercontract.owner';
		const conditions = { $and: [ { [fieldName]: buffer } ] };
		return this.catapultDb.queryPagedDocuments('supercontracts', conditions, pagingId, pageSize, options).then(this.catapultDb.sanitizer.deleteIds);
	}

	// endregion
}

module.exports = SuperContractDb;
