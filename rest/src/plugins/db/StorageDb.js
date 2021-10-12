/**
 *** Copyright 2021 ProximaX Limited. All rights reserved.
 *** Use of this source code is governed by the Apache 2.0
 *** license that can be found in the LICENSE file.
 * */

const AccountType = require('../AccountType');
const { convertToLong } = require('../../db/dbUtils');
const MongoDb = require('mongodb');
const { ObjectId } = MongoDb;

const driveRoles = ['owner', 'replicator'];

class StorageDb {
    /**
	 * Creates StorageDb around CatapultDb.
	 * @param {module:db/CatapultDb} db Catapult db instance.
	 */
	constructor(db) {
		this.catapultDb = db;
	}

    /**
	 * Retrieves the bcdrive entry by account id.
	 * @param {module:db/AccountType} type Type of account id.
	 * @param {array<object>} accountId Account id.
	 * @returns {Promise.<object>} The drive entry.
	 */
	getBcDriveByAccountId(type, accountId) {
		const buffer = Buffer.from(accountId);
		const fieldName = (AccountType.publicKey === type) ? 'bcdrive.multisig' : 'bcdrive.multisigAddress';
		return this.catapultDb.queryDocuments('bcdrives', { [fieldName]: buffer });
	}

    /**
	* Retrieves all the paginated bc drives.
    * @param {string} bcDrivesCollection bc drives collection.
	*/
    drives() {
        return this.catapultDb.queryDocuments(bcDrivessCollection);
    }

    /**
	 * Retrieves the bc drive entries by account.
	 * @param {object} publicKey The account public key.
	 * If filter is null or empty, returns all bc drives which contains public key of account.
	 * @returns {Promise.<array>} The bc drive entries for account.
	 */
	getBcDriveByPublicKey(publicKey) {
		const buffer = Buffer.from(publicKey);

		const query = [];
		let field = "bcdrive.owner";

		query.push({ [field]: buffer });

		return this.catapultDb.queryDocuments('bcdrives', {
			$or: query
		});
	}

     /**
	 * Retrieves the replicator entry by account id.
	 * @param {module:db/AccountType} type Type of account id.
	 * @param {array<object>} accountId Account id.
	 * @returns {Promise.<object>} The replicator entry.
	 */
	getReplicatorByAccountId(type, accountId) {
		const buffer = Buffer.from(accountId);
		const fieldName = (AccountType.publicKey === type) ? 'replicator.multisig' : 'replicator.multisigAddress';
		return this.catapultDb.queryDocuments('replicators', { [fieldName]: buffer });
	}

    /**
	* Retrieves all the paginated replicators.
    * @param {string} replicatorsCollection replicators collection.
	*/
    replicators() {
        return this.catapultDb.queryDocuments(replicatorsCollection);
    }

    /**
	 * Retrieves the replicator entries by account.
	 * @param {object} publicKey The account public key.
	 * @returns {Promise.<array>} The replicator entries for account.
	 */
    getReplicatorByPublicKey(publicKey) {
        const buffer = Buffer.from(publicKey);

        const query = [];
        let field = "replicator.replicator";

        query.push({ [field]: buffer });

        return this.catapultDb.queryDocuments('replicators', {
            $or: query
        });
    }

}

module.exports = StorageDb;
