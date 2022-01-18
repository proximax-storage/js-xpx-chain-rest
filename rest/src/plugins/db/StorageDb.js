/**
 *** Copyright 2021 ProximaX Limited. All rights reserved.
 *** Use of this source code is governed by the Apache 2.0
 *** license that can be found in the LICENSE file.
 * */

const AccountType = require('../AccountType');

class StorageDb {
	/**
	 * Creates StorageDb around CatapultDb.
	 * @param {module:db/CatapultDb} db Catapult db instance.
	 */
	constructor(db) {
		this.catapultDb = db;
	}

	/**
	 * Retrieves the drive entry by account id.
	 * @param {module:db/AccountType} type Type of account id.
	 * @param {array<object>} accountId Account id.
	 * @returns {Promise.<object>} The drive entry.
	 */
	getDriveByAccountId(type, accountId) {
		const buffer = Buffer.from(accountId);
		const fieldName = (AccountType.publicKey === type) ? 'drive.multisig' : 'drive.multisigAddress';
		return this.catapultDb.queryDocuments('bcdrives', { [fieldName]: buffer });
	}

	/**
	 * Retrieves all drive entries.
	 * @returns {Promise.<array>} The drive entries.
	 */
	getDrives() {
		return this.catapultDb.queryDocuments('bcdrives');
	}
}

module.exports = StorageDb;
