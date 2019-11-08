/**
 *** Copyright 2019 ProximaX Limited. All rights reserved.
 *** Use of this source code is governed by the Apache 2.0
 *** license that can be found in the LICENSE file.
 * */

const MongoDb = require('mongodb');
const AccountType = require('../AccountType');

const { Long } = MongoDb;

class ExchangeDb {
	/**
	 * Creates ExchangeDb around CatapultDb.
	 * @param {module:db/CatapultDb} db Catapult db instance.
	 */
	constructor(db) {
		this.catapultDb = db;

		this.deleteExpiredOffersFromObject = dbObject => {
			if (dbObject) {
				delete dbObject.expiredBuyOffers;
				delete dbObject.expiredSellOffers;
			}

			return dbObject;
		};

		this.deleteExpiredOffersFromArray = dbObjects => {
			dbObjects.forEach(dbObject => {
				deleteExpiredOffersFromObject(dbObject);
			});

			return dbObjects;
		};
	}

	// region exchange retrieval

	/**
	 * Retrieves the exchange entries for the given owner ids.
	 * @param {module:db/AccountType} idType Type of account ids.
	 * @param {array<object>} ids Owner public keys or addresses.
	 * @returns {Promise.<array>} The exchange entries.
	 */
	exchangesByIds(idType, ids) {
		const buffers = ids.map(id => Buffer.from(id));
		const fieldName = (AccountType.publicKey === idType) ? 'exchange.owner' : 'exchange.ownerAddress';
		return this.catapultDb.queryDocuments('exchanges', { [fieldName]: { $in: buffers } })
			.then(this.deleteExpiredOffersFromObject);
	}

	/**
	 * Retrieves the exchange entries with the offers of the given type with the given mosaicIds.
	 * @param {OfferType} offerType Type of offers to search.
	 * @param {Array.<module:catapult.utils/uint64~uint64>} mosaicIds Required mosaic ids.
	 * @param {string} id Paging id.
	 * @param {int} pageSize Page size.
	 * @param {object} options Additional options.
	 * @returns {Promise.<array>} The exchange entries.
	 */
	exchangesByMosaicIds(offerType, mosaicIds, id, pageSize, options) {
		const mosaicIds = ids.map(id => new Long(id[0], id[1]));
		const offerFieldName = (OfferType.Buy === offerType) ? 'buyOffers' : 'sellOffers';
		const conditions = { [`exchange.${offerFieldName}.mosaicId`]: { $in: mosaicIds } };
		return this.catapultDb.queryPagedDocuments('exchanges', conditions, id, pageSize, options)
			.then(this.deleteExpiredOffersFromArray);
	}

	/**
	 * Retrieves the exchange entries with the offers of the given type with the given mosaicIds
	 * and mosaic amount not less than the given amount.
	 * @param {OfferType} offerType Type of offers to search.
	 * @param {Array.<module:catapult.utils/uint64~uint64>} mosaicIds Required mosaic ids.
	 * @param {Uint64} minAmount Minimum offered mosaic amount.
	 * @param {string} id Paging id.
	 * @param {int} pageSize Page size.
	 * @param {object} options Additional options.
	 * @returns {Promise.<array>} The exchange entries.
	 */
	exchangesByMosaicIdsAndMinAmount(offerType, mosaicIds, minAmount, id, pageSize, options) {
		const mosaicIds = ids.map(id => new Long(id[0], id[1]));
		const offerFieldName = (OfferType.Buy === offerType) ? 'buyOffers' : 'sellOffers';
		const conditions = { $and: [
			{ [`exchange.${offerFieldName}.mosaicId`]: { $in: mosaicIds } }, 
			{ [`exchange.${offerFieldName}.amount`]: { $gte: Buffer.from(minAmount) } }
		]};
		return this.catapultDb.queryPagedDocuments('exchanges', conditions, id, pageSize, options)
			.then(this.deleteExpiredOffersFromArray);
	}

	// endregion
}

module.exports = ExchangeDb;
