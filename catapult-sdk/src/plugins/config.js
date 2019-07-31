/**
 *** Copyright 2019 ProximaX Limited. All rights reserved.
 *** Use of this source code is governed by the Apache 2.0
 *** license that can be found in the LICENSE file.
 **/

/** @module plugins/config */
const EntityType = require('../model/EntityType');
const ModelType = require('../model/ModelType');

/**
 * Creates a config plugin.
 * @type {module:plugins/CatapultPlugin}
 */
const configPlugin = {
	registerSchema: builder => {
		builder.addTransactionSupport(EntityType.catapultConfig, {
			applyHeightDelta: 			{ type: ModelType.uint64, schemaName: 'catapultConfig.applyHeightDelta' },
			blockChainConfig:			{ type: ModelType.string, schemaName: 'catapultConfig.blockChainConfig' },
			supportedEntityVersions:	{ type: ModelType.string, schemaName: 'catapultConfig.supportedEntityVersions' },
		});

		builder.addSchema('catapultConfigEntry', {
			catapultConfig: { type: ModelType.object, schemaName: 'catapultConfigEntry.height' }
		});

		builder.addSchema('catapultConfigEntry.height', {
			height:						ModelType.uint64,
			blockChainConfig:			ModelType.string,
			supportedEntityVersions:	ModelType.string,
		});
	},

	registerCodecs: codecBuilder => {
		codecBuilder.addTransactionSupport(EntityType.catapultConfig, {
			deserialize: parser => {
				const transaction = {};
				transaction.applyHeightDelta = parser.uint64();
				transaction.blockChainConfigSize = parser.uint32();
				transaction.supportedEntityVersionsSize = parser.uint32();
				transaction.blockChainConfig = parser.buffer(transaction.blockChainConfigSize);
				transaction.supportedEntityVersions = parser.buffer(transaction.supportedEntityVersionsSize);

				return transaction;
			},

			serialize: (transaction, serializer) => {
				serializer.writeUint64(transaction.applyHeightDelta);
				serializer.writeUint32(transaction.blockChainConfigSize);
				serializer.writeUint32(transaction.supportedEntityVersionsSize);
				serializer.writeBuffer(transaction.blockChainConfig);
				serializer.writeBuffer(transaction.supportedEntityVersions);
			}
		});
	}
};

module.exports = configPlugin;
