/**
 *** Copyright 2022 ProximaX Limited. All rights reserved.
 *** Use of this source code is governed by the Apache 2.0
 *** license that can be found in the LICENSE file.
 **/

/** @module plugins/exchange_sda */
const EntityType = require('../model/EntityType');
const ModelType = require('../model/ModelType');
const sizes = require('../modelBinary/sizes');

const constants = { sizes };

/**
 * Creates a SDA-SDA exchange plugin.
 * @type {module:plugins/CatapultPlugin}
 */
const exchangeSdaPlugin = {
   registerSchema: builder => {
      builder.addTransactionSupport(EntityType.placeSdaExchangeOffer, {
         offers:  { type: ModelType.array, schemaName: 'sdaOfferWithOwnerAndDuration' },
      });

      builder.addSchema('sdaOfferWithOwnerAndDuration', {
         mosaicIdGive:     ModelType.uint64,
         mosaicAmountGive: ModelType.uint64,
         mosaicIdGet:      ModelType.uint64,
         mosaicAmountGet:  ModelType.uint64,
         owner:            ModelType.binary,
         duration:         ModelType.uint64,
      });

      builder.addTransactionSupport(EntityType.removeSdaExchangeOffer, {
         offers:  { type: ModelType.array, schemaName: 'sdaOfferMosaic' },
      });

      builder.addSchema('sdaOfferMosaic', {
         mosaicIdGive:  ModelType.uint64,
         mosaicIdGet:   ModelType.uint64,
      });

      builder.addSchema('sdaExchangeEntry', {
         exchangesda:   { type: ModelType.object, schemaName: 'sdaExchangeEntry.exchangesda' },
      });

      builder.addSchema('sdaExchangeEntry.exchangesda', {
         owner:            ModelType.binary,
         ownerAddress:     ModelType.binary,
         sdaOfferBalances: { type: ModelType.array, schemaName: 'sdaExchangeEntry.sdaOfferBalances' },
      });

      builder.addSchema('sdaExchangeEntry.sdaOfferBalances', {
         mosaicIdGive:             ModelType.uint64,
         mosaicIdGet:              ModelType.uint64,
         currentMosaicGiveAmount:  ModelType.uint64,
         currentMosaicGetAmount:   ModelType.uint64,
         initialMosaicGiveAmount:  ModelType.uint64,
         initialMosaicGetAmount:   ModelType.uint64,
         deadline:                 ModelType.uint64,
      });

      builder.addSchema('sdaOfferGroupEntry', {
         sdaoffergroups:   { type: ModelType.object, schemaName: 'sdaOfferGroupEntry.sdaoffergroups' },
      });

      builder.addSchema('sdaOfferGroupEntry.sdaoffergroups', {
         groupHash:     ModelType.binary,
         sdaOfferGroup: { type: ModelType.array, schemaName: 'sdaOfferGroupEntry.sdaOfferGroup' },
      });

      builder.addSchema('sdaOfferGroupEntry.sdaOfferGroup', {
         owner:             ModelType.binary,
         mosaicGiveAmount:  ModelType.uint64,
         deadline:          ModelType.uint64,
      });
   },

   registerCodecs: codecBuilder => {
      const readSdaOffer = function (parser) {
         const sdaOffer = {};
         sdaOffer.mosaicIdGive = parser.uint64();
         sdaOffer.mosaicAmountGive = parser.uint64();
         sdaOffer.mosaicIdGet = parser.uint64();
         sdaOffer.mosaicAmountGet = parser.uint64();

         return sdaOffer;
      };

      const writeSdaOffer = function (sdaOffer, serializer) {
         serializer.writeUint64(sdaOffer.mosaicIdGive);
         serializer.writeUint64(sdaOffer.mosaicAmountGive);
         serializer.writeUint64(sdaOffer.mosaicIdGet);
         serializer.writeUint64(sdaOffer.mosaicAmountGet);
      };

      codecBuilder.addTransactionSupport(EntityType.placeSdaExchangeOffer, {
         deserialize: parser => {
            const transaction = {};
            transaction.sdaOffersCount = parser.uint8();
            transaction.offers = [];
            let count = transaction.sdaOffersCount;
            while (count--) {
               const sdaOfferWithOwnerAndDuration = readSdaOffer(parser);
               sdaOfferWithOwnerAndDuration.owner = parser.buffer(constants.sizes.signer);
               sdaOfferWithOwnerAndDuration.duration = parser.uint64();
               transaction.offers.push(sdaOfferWithOwnerAndDuration);
            }

            return transaction;
         },

         serialize: (transaction, serializer) => {
            serializer.writeUint8(transaction.sdaOffersCount);
            transaction.offers.forEach(sdaOfferWithOwnerAndDuration => {
               writeSdaOffer(sdaOfferWithOwnerAndDuration, serializer);
               serializer.writeBuffer(sdaOfferWithOwnerAndDuration.owner);
               serializer.writeUint64(sdaOfferWithOwnerAndDuration.duration);
            });
         }
      });

      codecBuilder.addTransactionSupport(EntityType.removeSdaExchangeOffer, {
         deserialize: parser => {
            const transaction = {};
            transaction.sdaOffersCount = parser.uint8();
            transaction.offers = [];
            let count = transaction.sdaOffersCount;
            while (count--) {
               const sdaOfferMosaic = {};
               sdaOfferMosaic.mosaicIdGive = parser.uint64();
               sdaOfferMosaic.mosaicIdGet = parser.uint64();
               transaction.offers.push(sdaOfferMosaic);
            }

            return transaction;
         },

         serialize: (transaction, serializer) => {
            serializer.writeUint8(transaction.sdaOffersCount);
            transaction.offers.forEach(sdaOfferMosaic => {
               serializer.writeUint64(sdaOfferMosaic.mosaicIdGive);
               serializer.writeUint64(sdaOfferMosaic.mosaicIdGet);
            });
         }
      });
   }
};

module.exports = exchangeSdaPlugin;