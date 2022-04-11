/**
 *** Copyright 2022 ProximaX Limited. All rights reserved.
 *** Use of this source code is governed by the Apache 2.0
 *** license that can be found in the LICENSE file.
 **/

/** @module plugins/liquidityProvider */
const EntityType = require('../model/EntityType');
const ModelType = require('../model/ModelType');
const sizes = require('../modelBinary/sizes');

const constants = { sizes };

/**
 * Creates a liquidity provider plugin.
 * @type {module:plugins/CatapultPlugin}
 */
const liquidityProviderPlugin = {
	registerSchema: builder => {
		builder.addTransactionSupport(EntityType.createLiquidityProvider, {
			providerMosaicId: 		{ type: ModelType.uint64, schemaName: 'createLiquidityProvider.providerMosaicId' },
			currencyDeposit: 		{ type: ModelType.uint64, schemaName: 'createLiquidityProvider.currencyDeposit' },
			initialMosaicsMinting: 	{ type: ModelType.uint64, schemaName: 'createLiquidityProvider.initialMosaicsMinting' },
			slashingPeriod: 		{ type: ModelType.uint32, schemaName: 'createLiquidityProvider.slashingPeriod' },
			windowSize: 			{ type: ModelType.uint16, schemaName: 'createLiquidityProvider.windowSize' },
			slashingAccount: 		{ type: ModelType.binary, schemaName: 'createLiquidityProvider.slashingAccount' },
			alpha: 					{ type: ModelType.uint32, schemaName: 'createLiquidityProvider.alpha' },
			beta: 					{ type: ModelType.uint32, schemaName: 'createLiquidityProvider.beta' },
		});

		builder.addTransactionSupport(EntityType.manualRateChange, {
			providerMosaicId:			{ type: ModelType.uint64,  schemaName: 'manualRateChange.providerMosaicId' },
			currencyBalanceIncrease: 	{ type: ModelType.boolean, schemaName: 'manualRateChange.currencyBalanceIncrease' },
			currencyBalanceChange:		{ type: ModelType.uint64,  schemaName: 'manualRateChange.currencyBalanceChange' },
			mosaicBalanceIncrease:		{ type: ModelType.boolean, schemaName: 'manualRateChange.mosaicBalanceIncrease' },
			mosaicBalanceChange:		{ type: ModelType.uint64,  schemaName: 'manualRateChange.mosaicBalanceChange' },
		});
	},

	registerCodecs: codecBuilder => {
		codecBuilder.addTransactionSupport(EntityType.createLiquidityProvider, {
			deserialize: parser => {
				const transaction = {};
				transaction.providerMosaicId = parser.uint64();
				transaction.currencyDeposit = parser.uint64();
				transaction.initialMosaicsMinting = parser.uint64();
				transaction.slashingPeriod = parser.uint32();
				transaction.windowSize = parser.uint16();
				transaction.slashingAccount = parser.buffer(constants.sizes.hash256);
				transaction.alpha = parser.uint32();
				transaction.beta = parser.uint32();

				return transaction;
			},

			serialize: (transaction, serializer) => {
				serializer.writeUint64(transaction.providerMosaicId);
				serializer.writeUint64(transaction.currencyDeposit);
				serializer.writeUint64(transaction.initialMosaicsMinting);
				serializer.writeUint32(transaction.slashingPeriod);
				serializer.writeUint16(transaction.windowSize);
				serializer.writeBuffer(transaction.slashingAccount);
				serializer.writeUint32(transaction.alpha);
				serializer.writeUint32(transaction.beta);
			}
		});

		codecBuilder.addTransactionSupport(EntityType.manualRateChange, {
			deserialize: parser => {
				const transaction = {};
				transaction.providerMosaicId = parser.uint64();
				transaction.currencyBalanceIncrease = parser.uint8();
				transaction.currencyBalanceChange = parser.uint64();
				transaction.mosaicBalanceIncrease = parser.uint8();
				transaction.mosaicBalanceChange = parser.uint64();

				return transaction;
			},

			serialize: (transaction, serializer) => {
				serializer.writeUint64(transaction.providerMosaicId);
				serializer.writeUint8(transaction.currencyBalanceIncrease);
				serializer.writeUint64(transaction.currencyBalanceChange);
				serializer.writeUint8(transaction.mosaicBalanceIncrease);
				serializer.writeUint64(transaction.mosaicBalanceChange);
			}
		});
	}
};

module.exports = liquidityProviderPlugin;
