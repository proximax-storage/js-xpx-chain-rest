/**
 *** Copyright 2019 ProximaX Limited. All rights reserved.
 *** Use of this source code is governed by the Apache 2.0
 *** license that can be found in the LICENSE file.
 * */

const OfferType = {
	Buy: 	1,
	Sell: 	2,
};

class ExchangeDb {
	/**
	 * Creates ExchangeDb around CatapultDb.
	 * @param {module:db/CatapultDb} db Catapult db instance.
	 */
	constructor(db) {
		this.catapultDb = db;
	}
	

	// region exchange retrieval

	/**
	 * Retrieves the exchange entries for the given keys.
	 * @param {array<object>} keys Account public keys.
	 * @returns {Promise.<array>} The exchange entries.
	 */
	exchangesByKeys(keys) {
		const buffers = keys.map(key => Buffer.from(key));
		return this.catapultDb.queryDocuments('exchanges', { ['exchange.owner']: { $in: buffers } });
	}

	/**
	 * Retrieves the exchange entries with the offers of the given type with the given mosaicIds.
	 * @param {OfferType} offerType Type of offers to search.
	 * @param {array<object>} mosaicIds Required mosaic ids.
	 * @returns {Promise.<array>} The exchange entries.
	 */
	exchangesByMosaicIds(offerType, mosaicIds) {
		const buffers = mosaicIds.map(mosaicId => Buffer.from(mosaicId));
		const offerFieldName = (OfferType.Buy == offerType) ? 'buyOffers' : 'sellOffers';
		return this.catapultDb.queryDocuments('exchanges', { ['exchange.${offerFieldName}.mosaicId']: { $in: buffers } });
	}

	/**
	 * Retrieves the exchange entries with the offers of the given type with the given mosaicIds
	 * and mosaic amount not less than the given amount.
	 * @param {OfferType} offerType Type of offers to search.
	 * @param {array<object>} mosaicIds Required mosaic ids.
	 * @param {Uint64} minAmount Minimum offered mosaic amount.
	 * @returns {Promise.<array>} The exchange entries.
	 */
	exchangesByMosaicIdsAndMinAmount(offerType, mosaicIds, minAmount) {
		const buffers = mosaicIds.map(mosaicId => Buffer.from(mosaicId));
		const offerFieldName = (OfferType.Buy == offerType) ? 'buyOffers' : 'sellOffers';
		return this.catapultDb.queryDocuments('exchanges',
		{ $and: [
			{ ['exchange.${offerFieldName}.mosaicId']: { $in: buffers } }, 
			{ ['exchange.${offerFieldName}.amount']: { $gte: Buffer.from(minAmount) } }
		]});
	}

	// endregion
}

module.exports = ExchangeDb;
