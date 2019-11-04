/**
 *** Copyright 2019 ProximaX Limited. All rights reserved.
 *** Use of this source code is governed by the Apache 2.0
 *** license that can be found in the LICENSE file.
 **/

/** @module plugins/exchange */
const EntityType = require('../model/EntityType');
const ModelType = require('../model/ModelType');

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
			offer: { type: ModelType.object, schemaName: 'offer' },
			duration: ModelType.uint64,
		});

		builder.addTransactionSupport(EntityType.exchange, {
			offers:	{ type: ModelType.array, schemaName: 'matchedOffer' },
		});

		builder.addSchema('matchedOffer', {
			offer: { type: ModelType.object, schemaName: 'offer' },
			owner: ModelType.binary,
		});

		builder.addSchema('offer', {
			mosaicId: 	ModelType.uint64,
			amount: 	ModelType.uint64,
			cost: 		ModelType.uint64,
			type: 		ModelType.uint8,
		});

		builder.addTransactionSupport(EntityType.removeExchangeOffer, {
			offers:	{ type: ModelType.array, schemaName: 'offerMosaic' },
		});

		builder.addSchema('offerMosaic', {
			mosaicId: 	ModelType.uint64,
			offerType:	ModelType.uint8,
		});

		builder.addSchema('exchangeEntry', {
			owner:		ModelType.binary,
			buyOffers:	{ type: ModelType.array, schemaName: 'exchangeEntry.buyOffer' },
			sellOffers:	{ type: ModelType.array, schemaName: 'exchangeEntry.sellOffer' },
		});

		builder.addSchema('exchangeEntry.buyOffer', {
			offer: 			{ type: ModelType.object, schemaName: 'exchangeEntry.offerBase' },
			residualCost:	ModelType.uint64,
		});

		builder.addSchema('exchangeEntry.sellOffer', {
			offer:	{ type: ModelType.object, schemaName: 'exchangeEntry.offerBase' },
		});

		builder.addSchema('exchangeEntry.offerBase', {
			amount: 		ModelType.uint64,
			initialAmount:	ModelType.uint64,
			initialCost:	ModelType.uint64,
			deadline: 		ModelType.uint64,
		});
	},

	registerCodecs: codecBuilder => {
		const readOffer = function (parser) {
			const offer = {};
			offer.mosaicId = parser.uint64();
			offer.amount = parser.uint64();
			offer.cost = parser.uint64();
			offer.type = parser.uint8();

			return offer;
		};

		const writeOffer = function (offer, serializer) {
			serializer.writeUint64(offer.mosaicId);
			serializer.writeUint64(offer.amount);
			serializer.writeUint64(offer.cost);
			serializer.writeUint8(offer.type);
		};

		codecBuilder.addTransactionSupport(EntityType.exchangeOffer, {
			deserialize: parser => {
				const transaction = {};
				const bytesLeft = parser.numUnprocessedBytes();
				transaction.offers = [];
				while (0 < bytesLeft) {
					const offerWithDuration = {};
					offerWithDuration.offer = readOffer(parser);
					offerWithDuration.duration = parser.uint64();
					bytesLeft -= 8 + 8 + 8 + 1 + 8;
					transaction.offers.push(offerWithDuration);
				}

				return transaction;
			},

			serialize: (transaction, serializer) => {
				transaction.offers.forEach(offerWithDuration => {
					writeOffer(offerWithDuration.offer, serializer);
					serializer.writeUint64(offerWithDuration.duration);
				});
			}
		});

		codecBuilder.addTransactionSupport(EntityType.exchange, {
			deserialize: parser => {
				const transaction = {};
				const bytesLeft = parser.numUnprocessedBytes();
				transaction.offers = [];
				while (0 < bytesLeft) {
					const matchedOffer = {};
					matchedOffer.offer = readOffer(parser);
					matchedOffer.owner = parser.buffer(32);
					bytesLeft -= 8 + 8 + 8 + 1 + 32;
					transaction.offers.push(matchedOffer);
				}

				return transaction;
			},

			serialize: (transaction, serializer) => {
				transaction.offers.forEach(matchedOffer => {
					writeOffer(matchedOffer.offer, serializer);
					serializer.writeBuffer(matchedOffer.owner);
				});
			}
		});

		codecBuilder.addTransactionSupport(EntityType.removeExchangeOffer, {
			deserialize: parser => {
				const transaction = {};
				const bytesLeft = parser.numUnprocessedBytes();
				transaction.offers = [];
				while (0 < bytesLeft) {
					const offerMosaic = {};
					offerMosaic.mosaicId = parser.uint64();
					offerMosaic.offerType = parser.uint8();
					bytesLeft -= 8 + 1;
					transaction.offers.push(offerMosaic);
				}

				return transaction;
			},

			serialize: (transaction, serializer) => {
				transaction.offers.forEach(offerMosaic => {
					serializer.writeUint64(offerMosaic.mosaicId);
					serializer.writeUint8(offerMosaic.offerType);
				});
			}
		});
	}
};

module.exports = exchangePlugin;
