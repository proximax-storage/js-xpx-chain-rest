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

const MongoDb = require('mongodb');
const { convertToLong } = require('../../db/dbUtils');

const { Long } = MongoDb;

const constants = {
	FlagsIndex: 0,
	Flags : {
		None: 0,
		Supply_Mutable: 1,
		Transferable: 2,
		All: 3,
	}
};

class MosaicDb {
	/**
	 * Creates MosaicDb around CatapultDb.
	 * @param {module:db/CatapultDb} db Catapult db instance.
	 */
	constructor(db) {
		this.catapultDb = db;
	}

	getCatapultDb() {
		return this.catapultDb;
	}

	// region mosaic retrieval

	/**
	 * Retrieves mosaics.
	 * @param {Array.<module:catapult.utils/uint64~uint64>} ids Mosaic ids.
	 * @returns {Promise.<array>} Mosaics.
	 */
	mosaicsByIds(ids) {
		const mosaicIds = ids.map(id => new Long(id[0], id[1]));
		const conditions = { 'mosaic.mosaicId': { $in: mosaicIds } };
		const collection = this.catapultDb.database.collection('mosaics');
		return collection.find(conditions)
			.sort({ _id: -1 })
			.toArray()
			.then(entities => Promise.resolve(this.catapultDb.sanitizer.copyAndDeleteIds(entities)));
	}

	/**
	 * Retrieves all mosaics.
	 * @returns {Promise.<array>} Mosaics.
	 */
	async mosaics(filters, options) {
		const buildConditions = async () => {
			const conditions = [];

			if (filters === undefined)
				return undefined;

			if (filters.ownerPubKey !== undefined) {
				const ownerPubKeyCondition = { 'mosaic.owner': Buffer.from(filters.ownerPubKey) };
				conditions.push(ownerPubKeyCondition);

				if(filters.holding !== undefined){
					const accountInfos = await this.catapultDb.accountsByIds([{ "publicKey": filters.ownerPubKey }]);
					
					if(accountInfos.length){
						const holdingMosaics = accountInfos[0].account.mosaics.map(x=> x.id);

						if(!filters.holding){
							conditions.push({ 'mosaic.mosaicId': { $nin: holdingMosaics }});
						}
						else{
							conditions.push({ 'mosaic.mosaicId': { $in: holdingMosaics }});
						}
					}
					
				}
			}

			if (filters.supply !== undefined) {
				const supplyCondition = { 'mosaic.supply': convertToLong(filters.supply) };
				conditions.push(supplyCondition);
			}

			if (filters.mutable !== undefined) {
				let values = [];
				if (filters.mutable) {
					values = [constants.Flags.Supply_Mutable, constants.Flags.All];
				} else {
					values = [constants.Flags.None, constants.Flags.Transferable];
				}

				const mutableCondition = {
					"mosaic.properties": { $elemMatch: {
							"id": constants.FlagsIndex,
							"value": { $in: values}
						}}
				};

				conditions.push(mutableCondition);
			}

			if (filters.transferable !== undefined) {
				let values = [];
				if (filters.transferable) {
					values = [constants.Flags.Transferable, constants.Flags.All];
				} else {
					values = [constants.Flags.None, constants.Flags.Supply_Mutable];
				}

				const mutableCondition = {
					"mosaic.properties": { $elemMatch: {
							"id": constants.FlagsIndex,
							"value": { $in: values}
						}}
				};

				conditions.push(mutableCondition);
			}

			return conditions;
		};

		const removedFields = ['meta.addresses'];
		const sortConditions = { $sort: { [options.sortField]: options.sortDirection } };
		const conditions = await buildConditions();

		// it is assumed that sortField will always be an `id` for now - this will need to be redesigned when it gets upgraded
		// in fact, offset logic should be moved to `queryPagedDocuments`
		if (options.offset !== undefined)
			conditions.push({[options.sortField]: {[1 === options.sortDirection ? '$gt' : '$lt']: new ObjectId(options.offset)}});

		return this.catapultDb.queryPagedDocuments_2(conditions, removedFields, sortConditions, "mosaics", options);
	}

	/**
	 * Retrieves all mosaics.
	 * @returns {Promise.<array>} Mosaics.
	 */
	allMosaics() {
		const collection = this.catapultDb.database.collection('mosaics');
		return collection.find({}, { 'mosaic.mosaicId': 1, 'mosaic.properties': 0, 'meta': 0 })
			.toArray()
			.then(entities => Promise.resolve(this.catapultDb.sanitizer.copyAndDeleteIds(entities)));
	}

	// endregion
}

module.exports = MosaicDb;
