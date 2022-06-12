/*
 * Copyright (c) 2016-present,
 * Jaguar0625, gimre, BloodyRookie, Tech Bureau, Corp. All rights reserved.
 *
 * This file is part of Catapult.
 *
 * Catapult is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Lesser General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * Catapult is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License
 * along with Catapult.  If not, see <http://www.gnu.org/licenses/>.
 */

/** @module db/CatapultDb */

const catapult = require('catapult-sdk');
const connector = require('./connector');
const MongoDb = require('mongodb');
const { convertToLong } = require('./dbUtils');

const { EntityType } = catapult.model;
const { ObjectId } = MongoDb;

const isAggregateType = document => EntityType.aggregateComplete === document.transaction.type
	|| EntityType.aggregateBonded === document.transaction.type;

const createAccountTransactionsAllConditions = (publicKey, networkId) => {
	const decodedAddress = address.publicKeyToAddress(publicKey, networkId);
	const bufferPublicKey = Buffer.from(publicKey);
	const bufferAddress = Buffer.from(decodedAddress);
	return {
		$or: [
			{ 'transaction.cosignatures.signer': bufferPublicKey },
			{ 'meta.addresses': bufferAddress }
		]
	};
};

const createSanitizer = () => ({
	sanitizerIds: function (dbObjects) {
		dbObjects.forEach(dbObject => {
			dbObject.id = dbObject._id;
			delete dbObject._id;
		});
		return dbObjects;
	},

	copyAndDeleteId: dbObject => {
		if (dbObject && dbObject._id) {
			Object.assign(dbObject.meta, { id: dbObject._id });
			delete dbObject._id;
		}
		if (dbObject && dbObject.id) {
			Object.assign(dbObject.meta, { id: dbObject.id });
			delete dbObject.id;
		}

		return dbObject;
	},

	copyAndDeleteIds: dbObjects => {
		dbObjects.forEach(dbObject => {
			if (dbObject._id) {
				Object.assign(dbObject.meta, { id: dbObject._id });
				delete dbObject._id;
			}
			if (dbObject.id) {
				Object.assign(dbObject.meta, { id: dbObject.id });
				delete dbObject.id;
			}
		});

		return dbObjects;
	},

	deleteId: dbObject => {
		if (dbObject) {
			delete dbObject.id;
			delete dbObject._id;
		}

		return dbObject;
	},

	deleteIds: dbObjects => {
		dbObjects.forEach(dbObject => {
			delete dbObject._id;
			delete dbObject.id;
		});

		return dbObjects;
	}
});

const mapToPromise = dbObject => Promise.resolve(null === dbObject ? undefined : dbObject);

const buildBlocksFromOptions = (height, numBlocks, chainHeight) => {
	const one = convertToLong(1);
	const startHeight = height.isZero() ? chainHeight.subtract(numBlocks).add(one) : height;

	// In all cases endHeight is actually max height + 1.
	const calculatedEndHeight = startHeight.add(numBlocks);
	const chainEndHeight = chainHeight.add(one);

	const endHeight = calculatedEndHeight.lessThan(chainEndHeight) ? calculatedEndHeight : chainEndHeight;
	return { startHeight, endHeight, numBlocks: endHeight.subtract(startHeight).toNumber() };
};

const getBoundedPageSize = (pageSize, pagingOptions) =>
	Math.max(pagingOptions.pageSizeMin, Math.min(pagingOptions.pageSizeMax, pageSize || pagingOptions.pageSizeDefault));

const TransactionGroup = Object.freeze({
	confirmed: 'transactions',
	unconfirmed: 'unconfirmedTransactions',
	partial: 'partialTransactions'
});

class CatapultDb {
	// region construction / connect / disconnect

	constructor(options) {
		this.networkId = options.networkId;
		if (!this.networkId)
			throw Error('network id is required');

		this.pagingOptions = {
			pageSizeMin: options.pageSizeMin,
			pageSizeMax: options.pageSizeMax,
			pageSizeDefault: options.pageSizeDefault
		};
		this.sanitizer = createSanitizer();
	}

	connect(url, dbName) {
		return connector.connectToDatabase(url, dbName)
			.then(client => {
				this.client = client;
				this.database = client.db();
			});
	}

	close() {
		if (!this.database)
			return Promise.resolve();

		return new Promise(resolve => {
			this.client.close(resolve);
			this.client = undefined;
			this.database = undefined;
		});
	}

	// endregion

	// region helpers

	queryDocument(collectionName, conditions, projection) {
		const collection = this.database.collection(collectionName);
		return collection.findOne(conditions, { projection })
			.then(mapToPromise);
	}

	queryDocuments(collectionName, conditions, options = {}) {
		const collection = this.database.collection(collectionName);
		return collection.find(conditions)
			.sort(options.sort)
			.limit(options.limit || 0)
			.toArray()
			.then(this.sanitizer.deleteIds);
	}

	queryPagedDocumentsUsingAggregate(collectionName, pipe, page, pageSize) {
		const skipStep = { $skip: page * pageSize };
		const limitStep = { $limit: pageSize };

		const collection = this.database.collection(collectionName);
		return collection.aggregate([...pipe, skipStep, limitStep], { promoteLongs: false })
			.toArray()
			.then(this.sanitizer.deleteIds);
	}

	queryRawDocuments(collectionName, conditions) {
		return this.database.collection(collectionName).find(conditions).toArray();
	}

	queryDocumentsAndCopyIds(collectionName, conditions, options = {}) {
		const collection = this.database.collection(collectionName);
		return collection.find(conditions)
			.project(options.projection)
			.toArray()
			.then(this.sanitizer.copyAndDeleteIds);
	}

	queryPagedDocuments(collectionName, conditions, id, pageSize, options = {}) {
		const sortOrder = options.sortOrder || options.sortDirection || -1;
		let sortBy = options.sortByField || '_id';
		if (sortBy === 'id')
			sortBy = '_id';
		const sorter = {};
		sorter[sortBy] = sortOrder;

		if (undefined !== options.offset) {
			conditions[sortBy] = { [1 === options.sortDirection ? '$gt' : '$lt']: options.offset };
		}

		if (id)
			conditions.$and.push({ _id: { [0 > sortOrder ? '$lt' : '$gt']: new ObjectId(id) } });

		const collection = this.database.collection(collectionName);
		return collection.find(conditions)
			.project(options.projection)
			.sort(sorter)
			.limit(getBoundedPageSize(pageSize, this.pagingOptions))
			.toArray().then(this.sanitizer.sanitizerIds);
	}

	// endregion

	// region retrieval

	/**
	 * Retrieves sizes of database collections.
	 * @returns {Promise} Promise that resolves to the sizes of collections in the database.
	 */
	storageInfo() {
		const blockCountPromise = this.database.collection('blocks').stats();
		const transactionCountPromise = this.database.collection('transactions').stats();
		const accountCountPromise = this.database.collection('accounts').stats();
		return Promise.all([blockCountPromise, transactionCountPromise, accountCountPromise])
			.then(storageInfo => ({ numBlocks: storageInfo[0].count, numTransactions: storageInfo[1].count, numAccounts: storageInfo[2].count }));
	}

	chainInfo() {
		return this.queryDocument('chainInfo', {}, { _id: 0 });
	}

	blockAtHeight(height) {
		return this.queryDocument(
			'blocks',
			{ 'block.height': convertToLong(height) },
			{ 'meta.transactionMerkleTree': 0, 'meta.statementMerkleTree': 0 }
		).then(this.sanitizer.deleteId);
	}

	blockWithMerkleTreeAtHeight(height, merkleTreeName) {
		const blockMerkleTreeNames = ['transactionMerkleTree', 'statementMerkleTree'];
		const excludedMerkleTrees = {};
		blockMerkleTreeNames.filter(merkleTree => merkleTree !== merkleTreeName)
			.forEach(merkleTree => { excludedMerkleTrees[`meta.${merkleTree}`] = 0; });
		return this.queryDocument('blocks', { 'block.height': convertToLong(height) }, excludedMerkleTrees)
			.then(this.sanitizer.deleteId);
	}

	blocksFrom(height, numBlocks) {
		if (0 === numBlocks)
			return Promise.resolve([]);

		return this.chainInfo().then(chainInfo => {
			const blockCollection = this.database.collection('blocks');
			const options = buildBlocksFromOptions(convertToLong(height), convertToLong(numBlocks), chainInfo.height);

			return blockCollection.find({ 'block.height': { $gte: options.startHeight, $lt: options.endHeight } })
				.project({ 'meta.transactionMerkleTree': 0, 'meta.statementMerkleTree': 0 })
				.sort({ 'block.height': -1 })
				.toArray()
				.then(this.sanitizer.deleteIds)
				.then(blocks => Promise.resolve(blocks));
		});
	}

	queryDependentDocuments(collectionName, aggregateIds) {
		if (0 === aggregateIds.length)
			return Promise.resolve([]);

		return this.queryDocumentsAndCopyIds(collectionName, { 'meta.aggregateId': { $in: aggregateIds } });
	}

	/**
	 * Makes a paginated query with the provided arguments.
	 * @param {array<object>} queryConditions The conditions that determine the query results, may be empty.
	 * @param {array<string>} removedFields Field names to be hidden from the query results, may be empty.
	 * @param {object} sortConditions Condition that describes the order of the results, must be set.
	 * @param {string} collectionName Name of the collection to be queried.
	 * @param {object} options Pagination options, must contain `pageSize` and `pageNumber` (starting at 1).
	 * @returns {Promise.<object>} Page result, contains the attributes `data` with the actual results, and `paging` with pagination
	 * metadata - which is comprised of: `totalEntries`, `pageNumber`, and `pageSize`.
	 */
	queryPagedDocuments_2(queryConditions, removedFields, sortConditions, collectionName, options) {
		let conditions = [];
		let firstLevelConditions = [];
		let preprocessingIndex = queryConditions.findIndex(i => i.key === 'firstLevel')
		if (preprocessingIndex !== -1) {
			firstLevelConditions = queryConditions[preprocessingIndex].value;
			queryConditions.splice(preprocessingIndex, 1);
		}
		
		const countConditions = [];
		if (queryConditions.length) {
			conditions.push(1 === queryConditions.length ? { $match: queryConditions[0] } : { $match: { $and: queryConditions } });
			countConditions.push(1 === queryConditions.length ? queryConditions[0] : { $and: queryConditions });
		}

		conditions.push(sortConditions);

		const { pageSize } = options;
		const pageIndex = options.pageNumber - 1;

		const facet = [];

		// rename _id to id
		facet.push({ $set: { "meta.id": '$_id' } });
		removedFields.push('_id');

		if (0 < Object.keys(removedFields).length)
			facet.push({ $unset: removedFields });

		conditions.push({ $skip: pageSize * pageIndex });
		conditions.push({ $limit: pageSize });
		
		let collection = this.database.collection(collectionName);
		var aggregateResult = function (totalEntries) {
			conditions.push({
				$facet: {
					data: facet
				}
			},
			{ $addFields: {
				'pagination.totalEntries': totalEntries, 
				'pagination.pageNumber': options.pageNumber,
				'pagination.pageSize': pageSize,
				'pagination.totalPages': 0
			} });

			return collection
			.aggregate(conditions, { promoteLongs: false , allowDiskUse: true })
			.toArray()
			.then(result => {
				const formattedResult = result[0];
				formattedResult.pagination.totalPages = Math.ceil(
					formattedResult.pagination.totalEntries / formattedResult.pagination.pageSize
				);

				if (firstLevelConditions.length) {
					const promises = [];
					formattedResult.data.forEach(item => {
						promises.push(
							this.transactionsByIdsImpl(
								collectionName, { 'meta.hash': { $in: [item.meta.hash] } }));
					})

					return Promise.all(promises).then( finalResult => {
						formattedResult.data = finalResult.map(i => { return i[0]; });
						return formattedResult;
					});
				} else {
					return formattedResult;
				}
			});
		}.bind(this);

		if (countConditions.length) {
			return collection
				.countDocuments(countConditions[0])
				.then(totalEntries => {
					return aggregateResult(totalEntries);
				});
		} else {
			return collection
				.estimatedDocumentCount()
				.then(totalEntries => {
					return aggregateResult(totalEntries);
				});
		}
	}

	/**
	 * Retrieves filtered and paginated transactions.
	 * @param {string} group Transactions group on which the query is made.
	 * @param {object} filters Filters to be applied: `address` for an involved address in the query, `signerPublicKey`, `recipientAddress`,
	 * `state`, `height`, `embedded`, `transactionTypes` array of uint. If `address` is provided, other account related filters are omitted.
	 * @param {object} options Options for ordering and pagination. Can have an `offset`, and must contain the `sortField`, `sortDirection`,
	 * `pageSize`.
	 * and `pageNumber`.
	 * @returns {Promise.<object>} Transactions page.
	 */
	transactions(group, filters, options) {
		const buildAccountConditions = () => {
			if (filters.address)
				return { 'meta.addresses': Buffer.from(filters.address) };

			const accountConditions = [];
			if (filters.signerPublicKey) {
				const signerPublicKeyCondition = { 'transaction.signer': Buffer.from(filters.signerPublicKey) };
				accountConditions.push(signerPublicKeyCondition);
			}

			if (filters.recipientAddress) {
				const recipientAddressCondition = { 'transaction.recipient': Buffer.from(filters.recipientAddress) };
				accountConditions.push(recipientAddressCondition);
			}

			if (Object.keys(accountConditions).length)
				return 1 < Object.keys(accountConditions).length ? { $and: accountConditions } : accountConditions[0];

			if (filters.publicKey) {
				accountConditions.push({ 'transaction.signer': Buffer.from(filters.publicKey) });

				const address = catapult.model.address.publicKeyToAddress(filters.publicKey, this.networkId);
				accountConditions.push({ 'transaction.recipient': Buffer.from(address) });
				accountConditions.push({ 'meta.addresses': Buffer.from(address) });

				return { $or: accountConditions }
			}

			return undefined;
		};

		const buildConditions = () => {
			let conditions = []
			let firstLevelConditions = []

			// it is assumed that sortField will always be an `id` for now - this will need to be redesigned when it gets upgraded
			// in fact, offset logic should be moved to `queryPagedDocuments`
			if (options.offset !== undefined)
				conditions.push({ [options.sortField]: { [1 === options.sortDirection ? '$gt' : '$lt']: new ObjectId(options.offset) } });

			if (filters.height !== undefined)
				conditions.push({ 'meta.height': convertToLong(filters.height) });
			else if (filters.fromHeight !== undefined && filters.toHeight !== undefined)
				conditions.push({ 'meta.height': { $gte: convertToLong(filters.fromHeight), $lte: convertToLong(filters.toHeight) } });
			else if (filters.fromHeight !== undefined)
				conditions.push({ 'meta.height': { $gte: convertToLong(filters.fromHeight) } });
			else if (filters.toHeight !== undefined)
				conditions.push({ 'meta.height': { $lte: convertToLong(filters.toHeight) } });
				
			if (filters.firstLevel !== undefined && !filters.firstLevel)
				firstLevelConditions.push(1);

			if (!filters.embedded)
				conditions.push({ 'meta.aggregateId': { $exists: false } });

			if (filters.transactionTypes !== undefined)
				conditions.push({ 'transaction.type': { $in: filters.transactionTypes } });

			const accountConditions = buildAccountConditions();
			if (accountConditions)
				conditions.push(accountConditions);

			if (firstLevelConditions.length > 0)
				conditions.unshift({ 'key': 'firstLevel', 'value' : firstLevelConditions })

			return conditions;
		};

		const removedFields = ['meta.addresses'];
		const sortConditions = { $sort: { [options.sortField]: options.sortDirection } };
		const conditions = buildConditions();

		return this.queryPagedDocuments_2(conditions, removedFields, sortConditions, TransactionGroup[group], options);
	}

	/**
	 * Retrieves count of transactions by transaction type.
	 * @param {array} types Array of transaction types.
	 * @param {object} filter Filter for payload(only JSON) of a transaction. 
	 * Only applicable for JSON. Optional. (Example: { key : k1, value : v1 }).
	 * @returns {Promise.<object>} array of the number of transactions divided by type.
	 */
	transactionsCountByType(types, filter) {
		const matching = {
			$match: { "transaction.message.payload": { $exists: true, $ne: null } }
		};

		const grouping = {
			$group: { "_id": { type: "$transaction.type" }, transactions: { $push: '$$ROOT' } }
		};

		const payloadDecoding = {
			$addFields: {
				transactions:
				{
					$function:
					{
						body: `function (transactions) {
							var base64Decoder = function (value) {
								try {
									value = JSON.stringify(value)
									value = JSON.parse(value)
									value = value["$binary"]
									
									var base64chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
									value = value.replace(new RegExp('[^'+base64chars.split("")+'=]', 'g'), "");
									 
									var p = (value.charAt(value.length-1) == '=' ? 
											(value.charAt(value.length-2) == '=' ? 'AA' : 'A') : ""); 
									var r = ""; 
									value = value.substr(0, value.length - p.length) + p;
									
									var base64inv = {};
									for (var i = 0; i < base64chars.length; i++) 
									{ 
									   base64inv[base64chars[i]] = i; 
									}
									 
									for (var c = 0; c < value.length; c += 4) {
									   var n = (base64inv[value.charAt(c)] << 18) + (base64inv[value.charAt(c+1)] << 12) +
											   (base64inv[value.charAt(c+2)] << 6) + base64inv[value.charAt(c+3)];
										
									   r += String.fromCharCode((n >>> 16) & 255, (n >>> 8) & 255, n & 255);
									}
									
									return JSON.parse(r.substring(0, r.length - p.length));
							   } catch (e) {
									return {}
							   }
							}

							transactions.forEach(function (value, index, array) {
								array[index].transaction.message.payload = base64Decoder(value.transaction.message.payload);
							});

							return transactions;
						}`,
						args: ["$transactions"],
						lang: "js"
					}
				},
			}
		};

		const projectFiltering = {
			$project: {
				transactions: {
					$filter: {
						input: "$transactions.transaction",
						as: "transaction",
						cond: {}
					}
				},
			}
		}

		if (filter) {
			projectFiltering.$project.transactions.$filter.cond = { $eq: ["$$transaction.message.payload." + filter.key, filter.value] }
		} else {
			projectFiltering.$project.transactions.$filter.cond = { $in: ["$$transaction.type", types] }
		}

		const project = {
			$project: {
				_id: 0, item: 1, count: {
					$cond: {
						if: { $isArray: "$transactions" },
						then: { $size: "$transactions" },
						else: 0
					}
				}, type: { $first: "$transactions.type" }
			}
		};

		const zeroMatching = {
			$match: { "count": { $ne: 0 } }
		};

		const aggregateExpressions = [];
		if (filter) {
			aggregateExpressions.push(matching);
		}

		aggregateExpressions.push(grouping);

		if (filter) {
			aggregateExpressions.push(payloadDecoding);
		}

		aggregateExpressions.push(projectFiltering);
		aggregateExpressions.push(project);
		aggregateExpressions.push(zeroMatching);

		return this.database.collection('transactions')
			.aggregate(aggregateExpressions)
			.toArray()
			.then(data => { return data; });
	}

	transactionsByIdsImpl(collectionName, conditions) {
		return this.queryDocumentsAndCopyIds(collectionName, conditions, { projection: { 'meta.addresses': 0 } })
			.then(documents => Promise.all(documents.map(document => {
				if (!document || !isAggregateType(document))
					return document;

				return this.queryDependentDocuments(collectionName, [document.meta.id]).then(dependentDocuments => {
					dependentDocuments.forEach(dependentDocument => {
						if (!document.transaction.transactions)
							document.transaction.transactions = [];

						document.transaction.transactions.push(dependentDocument);
					});

					return document;
				});
			})));
	}

	transactionsByIds(group, ids) {
		return this.transactionsByIdsImpl(TransactionGroup[group], { _id: { $in: ids.map(id => new ObjectId(id)) } });
	}

	transactionsByHashes(group, hashes) {
		return this.transactionsByIdsImpl(TransactionGroup[group], { 'meta.hash': { $in: hashes.map(hash => Buffer.from(hash)) } });
	}

	transactionsByHashesUnconfirmed(hashes) {
		return this.transactionsByIdsImpl('unconfirmedTransactions', { 'meta.hash': { $in: hashes.map(hash => Buffer.from(hash)) } });
	}

	transactionsByHashesPartial(hashes) {
		return this.transactionsByIdsImpl('partialTransactions', { 'meta.hash': { $in: hashes.map(hash => Buffer.from(hash)) } });
	}

	/**
	 * Return (id, name, parent) tuples for transactions with type and with id in set of ids.
	 * @param {*} ids Set of transaction ids.
	 * @param {*} transactionType Transaction type.
	 * @param {object} fieldNames Descriptor for fields used in query.
	 * @returns {Promise.<array>} Promise that is resolved when tuples are ready.
	 */
	findNamesByIds(ids, transactionType, fieldNames) {
		const queriedIds = ids.map(convertToLong);
		const conditions = {
			$match: {
				'transaction.type': transactionType,
				[`transaction.${fieldNames.id}`]: { $in: queriedIds }
			}
		};

		const grouping = {
			$group: {
				_id: `$transaction.${fieldNames.id}`,
				[fieldNames.id]: { $first: `$transaction.${fieldNames.id}` },
				[fieldNames.name]: { $first: `$transaction.${fieldNames.name}` },
				[fieldNames.parentId]: { $first: `$transaction.${fieldNames.parentId}` }
			}
		};

		const collection = this.database.collection('transactions');
		return collection.aggregate([conditions, grouping])
			.sort({ _id: -1 })
			.toArray()
			.then(this.sanitizer.deleteIds);
	}

	// region account retrieval

	accountsByIds(ids) {
		// id will either have address property or publicKey property set; in the case of publicKey, convert it to address
		const buffers = ids.map(id => Buffer.from((id.publicKey
			? catapult.model.address.publicKeyToAddress(id.publicKey, this.networkId) : id.address)));

		return this.queryDocuments('accounts', { 'account.address': { $in: buffers } })
			.then(entities => entities.map(accountWithMetadata => {
				return accountWithMetadata;
			}));
	}

	// endregion

	// region failed transaction

	/**
	 * Retrieves transaction results for the given hashes.
	 * @param {Array.<Uint8Array>} hashes Transaction hashes.
	 * @returns {Promise.<Array>} Promise that resolves to the array of hash / validation result pairs.
	 */
	transactionsByHashesFailed(hashes) {
		const buffers = hashes.map(hash => Buffer.from(hash));
		return this.queryDocuments('transactionStatuses', { hash: { $in: buffers } });
	}

	// endregion
}

module.exports = CatapultDb;
