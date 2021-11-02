/**
 *** Copyright 2021 ProximaX Limited. All rights reserved.
 *** Use of this source code is governed by the Apache 2.0
 *** license that can be found in the LICENSE file.
 * */

const AccountType = require('../AccountType');
const { convertToLong } = require('../../db/dbUtils');
const MongoDb = require('mongodb');
const { ObjectId } = MongoDb;

class StorageDb {
    /**
	 * Creates StorageDb around CatapultDb.
	 * @param {module:db/CatapultDb} db Catapult db instance.
	 */
	constructor(db) {
		this.catapultDb = db;
	}

	// region storage retrieval

    /**
	 * Retrieves the bcdrive entry by account id.
	 * @param {module:db/AccountType} type Type of account id.
	 * @param {array<object>} accountId Account id.
	 * @returns {Promise.<object>} The bcdrive entry.
	 */
	getBcDriveByAccountId(type, accountId) {
		const buffer = Buffer.from(accountId);
		const fieldName = (AccountType.publicKey === type) ? 'drive.multisig' : 'drive.multisigAddress';
		return this.catapultDb.queryDocuments('bcdrives', { [fieldName]: buffer });
	}

	/**
	 * Retrieves the bcdrive entries by account.
	 * @param {object} publicKey The account public key.
	 * @returns {Promise.<array>} The bcdrive entries for account.
	 */
	getBcDriveByOwnerPublicKey(publicKey) {
		const buffer = Buffer.from(publicKey);
		const fieldName = "drive.owner";
		return this.catapultDb.queryDocuments('bcdrives', { [fieldName]: buffer });
	}

    /**
	* Retrieves filtered and paginated bcdrives.
	* @param {object} filters Filters to be applied: 'size', 'used size', 'metafiles size', 'replicator count' 
	* @param {object} options Options for ordering and pagination. Can have an `offset`, and must contain the `sortField`, `sortDirection`,
	* `pageSize`.
	* and `pageNumber`.
    * @returns {Promise.<object>} Bc Drives page.
	*/
    bcdrives(filters, options) {
		const buildConditions = () => {
			const conditions = [];

			// it is assumed that sortField will always be an `id` for now - this will need to be redesigned when it gets upgraded
			// in fact, offset logic should be moved to `queryPagedDocuments`
			if (options.offset !== undefined)
				conditions.push({[options.sortField]: {[1 === options.sortDirection ? '$gt' : '$lt']: new ObjectId(options.offset)}});

			if (filters.fromSize !== undefined)
				conditions.push({'drive.size': {$gte: convertToLong(filters.fromSize)}});
			
			if (filters.fromUsedSize !== undefined)
				conditions.push({'drive.usedSize': {$gte: convertToLong(filters.fromUsedSize)}});
			
			if (filters.fromMetaFilesSize !== undefined)
				conditions.push({'drive.metaFilesSize': {$gte: convertToLong(filters.fromMetaFilesSize)}});
			
			if (filters.fromReplicatorCount !== undefined)
				conditions.push({'drive.replicatorCount': {$gte: convertToLong(filters.fromReplicatorCount)}});

			return conditions;
		}

		const sortConditions = {$sort: {[options.sortField]: options.sortDirection}};
		const conditions = buildConditions();

        return this.catapultDb.queryPagedDocuments_2(conditions, [], sortConditions, "bcdrives", options);
    }

	/**
	 * Retrieves the replicator entries by account.
	 * @param {object} publicKey The replicator public key.
	 * @returns {Promise.<object>} The replicator entry.
	 */
	 getReplicatorByPublicKey(publicKey) {
        const buffer = Buffer.from(publicKey);
        const fieldName = "replicator.key";
        return this.catapultDb.queryDocuments('replicators', { [fieldName]: buffer });
    }

	/**
	 * Retrieves the replicator entries by account.
	 * @param {object} blsKey The replicator bls key.
	 * @returns {Promise.<object>} The replicator entry.
	 */
	getReplicatorByBlsKey(blsKey) {
		const buffer = Buffer.from(blsKey);
		const fieldName = "replicator.blsKey";
		return this.catapultDb.queryDocuments('replicators', { [fieldName]: buffer });
	}
	

    /**
	* Retrieves filtered and paginated replicators.
	* @param {object} filters Filters to be applied: 'version', 'capacity'
	* @param {object} options Options for ordering and pagination. Can have an `offset`, and must contain the `sortField`, `sortDirection`,
	* `pageSize`.
	* and `pageNumber`.
    * @returns {Promise.<object>} Replicators page.
	*/
    replicators(filters, options) {
		const buildConditions = () => {
			const conditions = [];

			// it is assumed that sortField will always be an `id` for now - this will need to be redesigned when it gets upgraded
			// in fact, offset logic should be moved to `queryPagedDocuments`
			if (options.offset !== undefined)
				conditions.push({[options.sortField]: {[1 === options.sortDirection ? '$gt' : '$lt']: new ObjectId(options.offset)}});
			
			if (filters.fromVersion !== undefined)
				conditions.push({'replicator.version': {$gte: convertToLong(filters.fromVersion)}});

			if (filters.fromCapacity !== undefined)
				conditions.push({'replicator.capacity': {$gte: convertToLong(filters.fromCapacity)}});

			return conditions;
		}

		const sortConditions = {$sort: {[options.sortField]: options.sortDirection}};
		const conditions = buildConditions();

        return this.catapultDb.queryPagedDocuments_2(conditions, [], sortConditions, "replicators", options);
    }

	/**
	 * Retrieves the file downloads by download channel id.
	 * @param {array<object>} downloadChannelId Download channel id.
	 * @param {string} pagingId Paging id.
	 * @param {int} pageSize Page size.
	 * @returns {Promise.<array>} File download info.
	 */
	 getDownloadsByDownloadChannelId(downloadChannelId, pagingId, pageSize, options) {
		const buffer = Buffer.from(downloadChannelId);
		const fieldName = "downloadChannelInfo.id";
		const conditions = { $and: [ { [fieldName]: buffer } ] };
		return this.catapultDb.queryPagedDocuments('downloadChannels', conditions, pagingId, pageSize, options).then(this.catapultDb.sanitizer.deleteIds);
	}

	/**
	 * Retrieves the file downloads by file recipient.
	 * @param {array<object>} publicKey Public key of file recipient.
	 * @param {string} pagingId Paging id.
	 * @param {int} pageSize Page size.
	 * @returns {Promise.<array>} File download info.
	 */
	getDownloadsByConsumerPublicKey(publicKey, pagingId, pageSize, options) {
		const buffer = Buffer.from(publicKey);
		const fieldName = "downloadChannelInfo.consumer";
		const conditions = { $and: [ { [fieldName]: buffer } ] };
		return this.catapultDb.queryPagedDocuments('downloadChannels', conditions, pagingId, pageSize, options).then(this.catapultDb.sanitizer.deleteIds);
	}

	/**
	* Retrieves filtered and paginated download channels.
	* @param {object} filters Filters to be applied: 'download size', 'download approval count'
	* @param {object} options Options for ordering and pagination. Can have an `offset`, and must contain the `sortField`, `sortDirection`,
	* `pageSize`.
	* and `pageNumber`.
    * @returns {Promise.<object>} Download Channels page.
	*/
    downloadChannels(filters, options) {
		const buildConditions = () => {
			const conditions = [];

			// it is assumed that sortField will always be an `id` for now - this will need to be redesigned when it gets upgraded
			// in fact, offset logic should be moved to `queryPagedDocuments`
			if (options.offset !== undefined)
				conditions.push({[options.sortField]: {[1 === options.sortDirection ? '$gt' : '$lt']: new ObjectId(options.offset)}});

			if (filters.fromDownloadSize !== undefined)
				conditions.push({'downloadChannelInfo.downloadSize': {$gte: convertToLong(filters.fromDownloadSize)}});
			
			if (filters.fromDownloadApprovalCount !== undefined)
				conditions.push({'downloadChannelInfo.downloadApprovalCount': {$gte: convertToLong(filters.fromDownloadApprovalCount)}});

			return conditions;
		}

		const sortConditions = {$sort: {[options.sortField]: options.sortDirection}};
		const conditions = buildConditions();

        return this.catapultDb.queryPagedDocuments_2(conditions, [], sortConditions, "downloadChannels", options);
    }

	// endregion

}

module.exports = StorageDb;
