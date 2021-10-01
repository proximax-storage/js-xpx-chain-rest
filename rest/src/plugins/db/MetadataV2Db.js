/*
 * Copyright (c) 2016-2019, Jaguar0625, gimre, BloodyRookie, Tech Bureau, Corp.
 * Copyright (c) 2020-present, Jaguar0625, gimre, BloodyRookie.
 * All rights reserved.
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

const { convertToLong, buildOffsetCondition } = require('../../db/dbUtils');

class MetadataV2Db {
	/**
	 * Creates MetadataV2Db around CatapultDb.
	 * @param {module:db/CatapultDb} db Catapult db instance.
	 */
	constructor(db) {
		this.catapultDb = db;
	}

	/**
	 * Retrieves filtered and paginated metadata.
	 * @param {Uint8Array} sourceAddress Metadata source address
	 * @param {Uint8Array} targetKey Metadata target address
	 * @param {Uint64} scopedMetadataKey Metadata scoped key
	 * @param {Uint64} targetId Metadata target id
	 * @param {Uint32} metadataType Metadata type
	 * @param {object} options Options for ordering and pagination. Can have an `offset`, and must contain the `sortField`, `sortDirection`,
	 * `pageSize` and `pageNumber`. 'sortField' must be within allowed 'sortingOptions'.
	 * @returns {Promise.<object>} Metadata page.
	 */
	metadata(sourceAddress, targetKey, scopedMetadataKey, targetId, metadataType, options) {
		let conditions = [];

		if (undefined !== sourceAddress)
			conditions.push({ 'metadataEntry.sourceAddress': Buffer.from(sourceAddress) });

		if (undefined !== targetKey)
			conditions.push({ 'metadataEntry.targetKey': Buffer.from(targetKey) });

		if (undefined !== scopedMetadataKey)
			conditions.push({ 'metadataEntry.scopedMetadataKey': convertToLong(scopedMetadataKey) });

		if (undefined !== targetId)
			conditions.push({ 'metadataEntry.targetId': convertToLong(targetId) });

		if (undefined !== metadataType)
			conditions.push({ 'metadataEntry.metadataType': metadataType });

		const sortConditions = { $sort: { [options.sortField]: options.sortDirection } };

		return this.catapultDb.queryPagedDocuments_2(conditions, [], sortConditions, 'metadata_v2', options)
	}

	metadatasByCompositeHash(ids) {
		const compositeHashes = ids.map(id => Buffer.from(id));
		const conditions = { 'metadataEntry.compositeHash': { $in: compositeHashes } };
		const collection = this.catapultDb.database.collection('metadata_v2');
		return collection.find(conditions)
			.sort({ _id: -1 })
			.toArray()
			.then(entities => Promise.resolve(this.catapultDb.sanitizer.sanitizerIds(entities)));
	}
}

module.exports = MetadataV2Db;
