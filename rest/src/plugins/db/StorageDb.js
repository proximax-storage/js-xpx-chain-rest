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
	 * @param {object} publicKey The owner's public key.
	 * @param {string} id Paging id.
	 * @param {int} pageSize Page size.
	 * @returns {Promise.<array>} The bcdrive entries for account.
	 */
	getBcDrivesByOwnerPublicKey(publicKey, pagingId, pageSize, options) {
		const buffer = Buffer.from(publicKey);
		const fieldName = "drive.owner";
		const conditions = { $and: [ { [fieldName]: buffer } ] };
		return this.catapultDb.queryDocuments('bcdrives', conditions, pagingId, pageSize, options).then(this.catapultDb.sanitizer.deleteIds);
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

			if (filters.size !== undefined)
				conditions.push({'drive.size': convertToLong(filters.size)});
			else if (filters.fromSize !== undefined)
				conditions.push({'drive.size': {$gte: convertToLong(filters.fromSize)}});
			else if (filters.toSize !== undefined)
				conditions.push({'drive.size': {$lte: convertToLong(filters.toSize)}});
			
			if (filters.usedSize !== undefined)
				conditions.push({'drive.usedSize': convertToLong(filters.usedSize)});
			else if (filters.fromUsedSize !== undefined)
				conditions.push({'drive.usedSize': {$gte: convertToLong(filters.fromUsedSize)}});
			else if (filters.toUsedSize !== undefined)
				conditions.push({'drive.usedSize': {$lte: convertToLong(filters.toUsedSize)}});
			
			if (filters.metaFilesSize !== undefined)
				conditions.push({'drive.metaFilesSize': convertToLong(filters.metaFilesSize)});
			else if (filters.fromMetaFilesSize !== undefined)
				conditions.push({'drive.metaFilesSize': {$gte: convertToLong(filters.fromMetaFilesSize)}});
			else if (filters.toMetaFilesSize !== undefined)
				conditions.push({'drive.metaFilesSize': {$lte: convertToLong(filters.toMetaFilesSize)}});
			
			if (filters.replicatorCount !== undefined)
				conditions.push({'drive.replicatorCount': convertToLong(filters.replicatorCount)});
			else if (filters.fromReplicatorCount !== undefined)
				conditions.push({'drive.replicatorCount': {$gte: convertToLong(filters.fromReplicatorCount)}});
			else if (filters.toReplicatorCount !== undefined)
				conditions.push({'drive.replicatorCount': {$lte: convertToLong(filters.toReplicatorCount)}});

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
			
			if (filters.version !== undefined)
				conditions.push({'replicator.version': convertToLong(filters.version)});
			else if (filters.fromVersion !== undefined)
				conditions.push({'replicator.version': {$gte: convertToLong(filters.fromVersion)}});
			else if (filters.toVersion !== undefined)
				conditions.push({'replicator.version': {$lte: convertToLong(filters.toVersion)}});


			if (filters.capacity !== undefined)
				conditions.push({'replicator.capacity': convertToLong(filters.capacity)});
			else if (filters.fromCapacity !== undefined)
				conditions.push({'replicator.capacity': {$gte: convertToLong(filters.fromCapacity)}});
			else if (filters.toCapacity !== undefined)
				conditions.push({'replicator.capacity': {$lte: convertToLong(filters.toCapacity)}});

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

			if (filters.downloadSize !== undefined)
				conditions.push({'downloadChannelInfo.downloadSize': convertToLong(filters.downloadSize)});
			else if (filters.fromDownloadSize !== undefined)
				conditions.push({'downloadChannelInfo.downloadSize': {$gte: convertToLong(filters.fromDownloadSize)}});
			else if (filters.toDownloadSize !== undefined)
				conditions.push({'downloadChannelInfo.downloadSize': {$lte: convertToLong(filters.toDownloadSize)}});
			
			if (filters.downloadApprovalCount !== undefined)
				conditions.push({'downloadChannelInfo.downloadApprovalCount': convertToLong(filters.downloadApprovalCount)});
			else if (filters.fromDownloadApprovalCount !== undefined)
				conditions.push({'downloadChannelInfo.downloadApprovalCount': {$gte: convertToLong(filters.fromDownloadApprovalCount)}});
			else if (filters.toDownloadApprovalCount !== undefined)
				conditions.push({'downloadChannelInfo.downloadApprovalCount': {$lte: convertToLong(filters.toDownloadApprovalCount)}});

			if (filters.consumerKey !== undefined)
				conditions.push({'downloadChannelInfo.consumer': filters.consumerKey});

			return conditions;
		}

		const sortConditions = {$sort: {[options.sortField]: options.sortDirection}};
		const conditions = buildConditions();

        return this.catapultDb.queryPagedDocuments_2(conditions, [], sortConditions, "downloadChannels", options);
    }

	// endregion

}

module.exports = StorageDb;
