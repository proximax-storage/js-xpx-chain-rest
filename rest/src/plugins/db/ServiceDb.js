/**
 *** Copyright 2019 ProximaX Limited. All rights reserved.
 *** Use of this source code is governed by the Apache 2.0
 *** license that can be found in the LICENSE file.
 * */

const AccountType = require('../AccountType');

const driveRoles = ['owner', 'replicator'];

class ServiceDb {
	/**
	 * Creates ServiceDb around CatapultDb.
	 * @param {module:db/CatapultDb} db Catapult db instance.
	 */
	constructor(db) {
		this.catapultDb = db;
	}

	// region service retrieval

	/**
	 * Retrieves the drive entry by account id.
	 * @param {module:db/AccountType} type Type of account id.
	 * @param {array<object>} accountId Account id.
	 * @returns {Promise.<object>} The drive entry.
	 */
	getDriveByAccountId(type, accountId) {
		const buffer = Buffer.from(accountId);
		const fieldName = (AccountType.publicKey === type) ? 'drive.multisig' : 'drive.multisigAddress';
		return this.catapultDb.queryDocuments('drives', { [fieldName]: buffer });
	}

	/**
	 * Retrieves the drive entries by account and role.
	 * @param {object} publicKey The account public key.
	 * @param {array<string>} roles The role of account in the drive.
	 * If filter is null or empty, returns all drives which contains public key of account.
	 * @returns {Promise.<array>} The drive entries for account.
	 */
	getDrivesByPublicKeyAndRole(publicKey, roles) {
		const buffer = Buffer.from(publicKey);

		if (!roles || !roles.length)
			roles = driveRoles;

		const query = [];
		for (let i = 0; i < roles.length; ++i) {
			let field = "drive.";
			switch(roles[i]) {
				case 'owner':
					field += "owner";
					break;
				case 'replicator':
					field += "replicators.replicator";
					break;
				default:
					throw errors.createInvalidArgumentError(`Role '${roles[i]}' is not supported`);
			}

			query.push({ [field]: buffer });
		}

		return this.catapultDb.queryDocuments('drives', {
			$or: query
		});
	}

	/**
	 * Retrieves the file downloads by drive id.
	 * @param {module:db/AccountType} type Type of drive id.
	 * @param {array<object>} driveId Drive id.
	 * @param {string} id Paging id.
	 * @param {int} pageSize Page size.
	 * @returns {Promise.<array>} File download info.
	 */
	getDownloadsByDriveId(type, driveId, pagingId, pageSize, options) {
		const buffer = Buffer.from(driveId);
		const fieldName = (AccountType.publicKey === type) ? 'downloadInfo.driveKey' : 'downloadInfo.driveAddress';
		const conditions = { $and: [ { [fieldName]: buffer } ] };
		return this.catapultDb.queryPagedDocuments('downloads', conditions, pagingId, pageSize, options).then(this.catapultDb.sanitizer.deleteIds);
	}

	/**
	 * Retrieves the file downloads by file recipient.
	 * @param {array<object>} fileRecipient Public key of file recipient.
	 * @param {string} id Paging id.
	 * @param {int} pageSize Page size.
	 * @returns {Promise.<array>} File download info.
	 */
	getDownloadsByFileRecipient(fileRecipient, pagingId, pageSize, options) {
		const key = Buffer.from(fileRecipient);
		const conditions = { $and: [ { ['downloadInfo.fileRecipient']: key } ] };
		return this.catapultDb.queryPagedDocuments('downloads', conditions, pagingId, pageSize, options).then(this.catapultDb.sanitizer.deleteIds);;
	}

	/**
	 * Retrieves the file download by operation token.
	 * @param {array<object>} operationToken File download operation token.
	 * @returns {Promise.<array>} File download info.
	 */
	getDownloadsByOperationToken(operationToken) {
		const buffer = Buffer.from(operationToken);
		return this.catapultDb.queryDocuments('downloads', { ['downloadInfo.operationToken']: buffer });
	}

	// endregion
}

module.exports = ServiceDb;
