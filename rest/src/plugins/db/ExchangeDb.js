/**
 *** Copyright 2019 ProximaX Limited. All rights reserved.
 *** Use of this source code is governed by the Apache 2.0
 *** license that can be found in the LICENSE file.
 * */

const MongoDb = require('mongodb');
const AccountType = require('../AccountType');
const uint64 = require('../../../../catapult-sdk/src/utils/uint64');

const { Long } = MongoDb;

const deleteExpiredOffersFromObject = dbObject => {
	if (dbObject && dbObject.exchange) {
		delete dbObject.exchange.expiredBuyOffers;
		delete dbObject.exchange.expiredSellOffers;
	}

	return dbObject;
};

const deleteExpiredOffersFromArray = dbObjects => {
	dbObjects.forEach(dbObject => {
		deleteExpiredOffersFromObject(dbObject);
	});

	return dbObjects;
};

const extractOfferInfo = (dbObjects, fieldName, mosaicIds, ordering) => {
	const result = [];
	dbObjects.forEach(dbObject => {
		const exchangeInfo = dbObject.exchange;
		const offers = exchangeInfo[fieldName];

		mosaicIds.forEach(mosaicId => {
			offers.forEach(offer => {
				if (mosaicId.toString() === offer.mosaicId.toString()) {
					offer.owner = exchangeInfo.owner;
					offer.type = fieldName === 'sellOffers' ? 0 : 1;

					result.push(offer);
				}
			});
		});
	});

	result.sort((a, b) => {
		return (a.price > b.price) ? ordering : ((a.price < b.price) ? -ordering : 0);
	});

	return result;
};

class ExchangeDb {
	/**
	 * Creates ExchangeDb around CatapultDb.
	 * @param {module:db/CatapultDb} db Catapult db instance.
	 */
	constructor(db) {
		this.catapultDb = db;
	}

	getCatapultDb() {
		return this.catapultDb;
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
			.then(deleteExpiredOffersFromArray);
	}

	/**
	 * Retrieves the exchange entries with the offers of the given type with the given mosaicIds.
	 * @param {OfferType} offerType Type of offers to search.
	 * @param {Array.<module:catapult.utils/uint64~uint64>} mosaicIds Required mosaic ids.
	 * @param {string} id Paging id.
	 * @param {int} pageSize Page size.
	 * @param {int} ordering Sort order.
	 * @returns {Promise.<array>} The exchange entries.
	 */
	exchangesByMosaicIds(offerType, mosaicIds, pagingId, pageSize, ordering) {
		const ids = mosaicIds.map(id => new Long(id[0], id[1]));
		const offerFieldName = ('buy' === offerType) ? 'buyOffers' : 'sellOffers';
		const conditions = { $and: [ { [`exchange.${offerFieldName}.mosaicId`]: { $in: ids } } ] };
		const extractor = function(dbObjects) {
			return extractOfferInfo(dbObjects, offerFieldName, ids, ordering);
		};

		const options = {
			sortByField: `exchange.${offerFieldName}.price`,
			sortOrder: ordering,
		};

		return this.catapultDb.queryPagedDocuments('exchanges', conditions, pagingId, pageSize, options).then(extractor);
	}

	/**
	 * Retrieves mosaic ids present in buy/sell offers.
	 * @param {Array.<Long>} mosaics Required mosaics.
	 * @returns {Promise.<array>} Mosaic ids.
	 */
	 mosaicsParticipatingInOffers(mosaics) {
		 var mosaicIds = [];
		 const handler = new Promise((resolve) => {
			 if (Array.isArray(mosaics) && mosaics.length) {
				 mosaics.forEach((entity, index, array) => {
					 const id = entity.mosaic.mosaicId;
					 const buyCondition = { "exchange.buyOffers.mosaicId": id };
					 const sellCondition = { "exchange.sellOffers.mosaicId": id };
					 const conditions = { $or: [buyCondition, sellCondition] };

					 this.catapultDb.queryDocument('exchanges', conditions)
						 .then(exchange => {
							 if (exchange) {
								 const id = entity.mosaic.mosaicId.toString();
								 const hex = uint64.toHex(uint64.fromString(id));
								 const json = { "mosaicId": hex };
								 mosaicIds.push(json);
							 }

							 if (Object.is(array.length - 1, index)) {
								 resolve(mosaicIds);
								 return;
							 }
						 });
				 });
			 } else {
				 resolve(mosaicIds);
				 return;
			 }
		 });

		 return handler.then(data => { return data; });
	}

	//
	// /**
	//  * Retrieves the exchange entries with the offers of the given type with the given mosaicIds
	//  * and mosaic amount not less than the given amount.
	//  * @param {OfferType} offerType Type of offers to search.
	//  * @param {Array.<module:catapult.utils/uint64~uint64>} mosaicIds Required mosaic ids.
	//  * @param {Uint64} minAmount Minimum offered mosaic amount.
	//  * @param {string} id Paging id.
	//  * @param {int} pageSize Page size.
	//  * @param {object} options Additional options.
	//  * @returns {Promise.<array>} The exchange entries.
	//  */
	// exchangesByMosaicIdsAndMinAmount(offerType, mosaicIds, minAmount, id, pageSize, options) {
	// 	const mosaicIds = ids.map(id => new Long(id[0], id[1]));
	// 	const offerFieldName = (OfferType.Buy === offerType) ? 'buyOffers' : 'sellOffers';
	// 	const conditions = { $and: [
	// 		{ [`exchange.${offerFieldName}.mosaicId`]: { $in: mosaicIds } },
	// 		{ [`exchange.${offerFieldName}.amount`]: { $gte: Buffer.from(minAmount) } }
	// 	]};
	// 	return this.catapultDb.queryPagedDocuments('exchanges', conditions, id, pageSize, options)
	// 		.then(this.deleteExpiredOffersFromArray);
	// }

	// endregion
}

module.exports = ExchangeDb;
