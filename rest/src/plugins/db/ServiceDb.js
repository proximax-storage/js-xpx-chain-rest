/**
 *** Copyright 2019 ProximaX Limited. All rights reserved.
 *** Use of this source code is governed by the Apache 2.0
 *** license that can be found in the LICENSE file.
 * */

const AccountType = require('../AccountType');
const { longToUint64 } = require('../../db/dbUtils');

const fileActions = {
	add: 0,
	remove: 1,
};

// TODO: Remove removed replicators
const removeDeletedFiles = function(driveEntries) {
	driveEntries.forEach(driveEntry => {
		const files = [];
		driveEntry.drive.files.forEach(file => {
			if (file.actions[file.actions.length - 1].type != fileActions.remove && file.deposit == 0)
				files.push(file);
		});

		driveEntry.drive.files = files;
	});

	return driveEntries;
};

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
	 * @param {module:db/AccountType} type Type of account ids.
	 * @param {array<object>} accountIds Account ids.
	 * @returns {Promise.<object>} The drive entry.
	 */
	getDriveByAccountId(type, accountId) {
		const buffer = Buffer.from(accountId);
		const fieldName = (AccountType.publicKey === type) ? 'drive.multisig' : 'drive.multisigAddress';
		return this.catapultDb.queryDocuments('drives', { [fieldName]: buffer }).then(removeDeletedFiles);
	}

	/**
	 * Retrieves the drive entries for given account and role.
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
		}).then(removeDeletedFiles);
	}

	// endregion
}

module.exports = ServiceDb;
