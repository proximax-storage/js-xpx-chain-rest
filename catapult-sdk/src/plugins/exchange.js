/**
 *** Copyright 2019 ProximaX Limited. All rights reserved.
 *** Use of this source code is governed by the Apache 2.0
 *** license that can be found in the LICENSE file.
 **/

/** @module plugins/exchange */
const EntityType = require('../model/EntityType');
const ModelType = require('../model/ModelType');
const sizes = require('../modelBinary/sizes');

const constants = { sizes };

/**
 * Creates a exchange plugin.
 * @type {module:plugins/CatapultPlugin}
 */
const exchangePlugin = {
	registerSchema: builder => {
		builder.addTransactionSupport(EntityType.exchangeOffer, {
			offers:	{ type: ModelType.array, schemaName: 'offerWithDuration' },
		});

		builder.addSchema('offerWithDuration', {
			mosaicId: 		ModelType.uint64,
			mosaicAmount: 	ModelType.uint64,
			cost: 			ModelType.uint64,
			duration: 		ModelType.uint64,
		});

		builder.addTransactionSupport(EntityType.exchange, {
			offers:	{ type: ModelType.array, schemaName: 'matchedOffer' },
		});

		builder.addSchema('matchedOffer', {
			mosaicId: 		ModelType.uint64,
			mosaicAmount: 	ModelType.uint64,
			cost: 			ModelType.uint64,
			owner: 			ModelType.binary,
		});

		builder.addTransactionSupport(EntityType.removeExchangeOffer, {
			offers:	{ type: ModelType.array, schemaName: 'offerMosaic' },
		});

		builder.addSchema('offerMosaic', {
			mosaicId: 	ModelType.uint64,
		});

		builder.addSchema('exchangeEntry', {
			exchange:	{ type: ModelType.object, schemaName: 'exchangeEntry.exchange' },
		});

		builder.addSchema('exchangeEntry.exchange', {
			owner:				ModelType.binary,
			ownerAddress:		ModelType.binary,
			buyOffers:	{ type: ModelType.array, schemaName: 'exchangeEntry.buyOffer' },
			sellOffers:	{ type: ModelType.array, schemaName: 'exchangeEntry.sellOffer' },
		});

		builder.addSchema('exchangeEntry.buyOffer', {
			mosaicId: 		ModelType.uint64,
			amount: 		ModelType.uint64,
			initialAmount:	ModelType.uint64,
			initialCost:	ModelType.uint64,
			deadline: 		ModelType.uint64,
			residualCost:	ModelType.uint64,
		});

		builder.addSchema('exchangeEntry.sellOffer', {
			mosaicId: 		ModelType.uint64,
			amount: 		ModelType.uint64,
			initialAmount:	ModelType.uint64,
			initialCost:	ModelType.uint64,
			deadline: 		ModelType.uint64,
		});

		builder.addSchema('offerInfo', {
			mosaicId: 		ModelType.uint64,
			amount: 		ModelType.uint64,
			initialAmount:	ModelType.uint64,
			initialCost:	ModelType.uint64,
			deadline: 		ModelType.uint64,
			owner: 			ModelType.binary,
		});

		builder.addSchema('mosaics', {
			mosaics: { type: ModelType.array },
		});
	},

	registerCodecs: codecBuilder => {
		const readOffer = function (parser) {
			const offer = {};
			offer.mosaicId = parser.uint64();
			offer.mosaicAmount = parser.uint64();
			offer.cost = parser.uint64();
			offer.type = parser.uint8();

			return offer;
		};

		const writeOffer = function (offer, serializer) {
			serializer.writeUint64(offer.mosaicId);
			serializer.writeUint64(offer.mosaicAmount);
			serializer.writeUint64(offer.cost);
			serializer.writeUint8(offer.type);
		};

		codecBuilder.addTransactionSupport(EntityType.exchangeOffer, {
			deserialize: parser => {
				const transaction = {};
				transaction.offersCount = parser.uint8();
				transaction.offers = [];
				let count = transaction.offersCount;
				while (count--) {
					const offerWithDuration = readOffer(parser);
					offerWithDuration.duration = parser.uint64();
					transaction.offers.push(offerWithDuration);
				}

				return transaction;
			},

			serialize: (transaction, serializer) => {
				serializer.writeUint8(transaction.offersCount);
				transaction.offers.forEach(offerWithDuration => {
					writeOffer(offerWithDuration, serializer);
					serializer.writeUint64(offerWithDuration.duration);
				});
			}
		});

		codecBuilder.addTransactionSupport(EntityType.exchange, {
			deserialize: parser => {
				const transaction = {};
				transaction.offersCount = parser.uint8();
				transaction.offers = [];
				let count = transaction.offersCount;
				while (count--) {
					const matchedOffer = readOffer(parser);
					matchedOffer.owner = parser.buffer(constants.sizes.signer);
					transaction.offers.push(matchedOffer);
				}

				return transaction;
			},

			serialize: (transaction, serializer) => {
				serializer.writeUint8(transaction.offersCount);
				transaction.offers.forEach(matchedOffer => {
					writeOffer(matchedOffer, serializer);
					serializer.writeBuffer(matchedOffer.owner);
				});
			}
		});

		codecBuilder.addTransactionSupport(EntityType.removeExchangeOffer, {
			deserialize: parser => {
				const transaction = {};
				transaction.offersCount = parser.uint8();
				transaction.offers = [];
				let count = transaction.offersCount;
				while (count--) {
					const offerMosaic = {};
					offerMosaic.mosaicId = parser.uint64();
					offerMosaic.offerType = parser.uint8();
					transaction.offers.push(offerMosaic);
				}

				return transaction;
			},

			serialize: (transaction, serializer) => {
				serializer.writeUint8(transaction.offersCount);
				transaction.offers.forEach(offerMosaic => {
					serializer.writeUint64(offerMosaic.mosaicId);
					serializer.writeUint8(offerMosaic.offerType);
				});
			}
		});
	}
};

module.exports = exchangePlugin;
