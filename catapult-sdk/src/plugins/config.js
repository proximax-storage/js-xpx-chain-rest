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
		builder.addTransactionSupport(EntityType.networkConfig, {
			applyHeightDelta: 			{ type: ModelType.uint64, schemaName: 'networkConfig.applyHeightDelta' },
			networkConfig:			{ type: ModelType.string, schemaName: 'networkConfig.networkConfig' },
			supportedEntityVersions:	{ type: ModelType.string, schemaName: 'networkConfig.supportedEntityVersions' },
		});
		builder.addTransactionSupport(EntityType.networkConfigAbsoluteHeight, {
			applyHeight: 			{ type: ModelType.uint64, schemaName: 'networkConfigAbsoluteHeight.applyHeight' },
			networkConfig:			{ type: ModelType.string, schemaName: 'networkConfigAbsoluteHeight.networkConfig' },
			supportedEntityVersions:	{ type: ModelType.string, schemaName: 'networkConfigAbsoluteHeight.supportedEntityVersions' },
		});

		builder.addSchema('networkConfigEntry', {
			networkConfig: { type: ModelType.object, schemaName: 'networkConfigEntry.height' }
		});

		builder.addSchema('networkConfigEntry.height', {
			height:						ModelType.uint64,
			networkConfig:			ModelType.string,
			supportedEntityVersions:	ModelType.string,
		});
	},

	registerCodecs: codecBuilder => {
		codecBuilder.addTransactionSupport(EntityType.networkConfig, {
			deserialize: parser => {
				const transaction = {};
				transaction.applyHeightDelta = parser.uint64();
				transaction.networkConfigSize = parser.uint16();
				transaction.supportedEntityVersionsSize = parser.uint16();
				transaction.networkConfig = parser.buffer(transaction.networkConfigSize);
				transaction.supportedEntityVersions = parser.buffer(transaction.supportedEntityVersionsSize);

				return transaction;
			},

			serialize: (transaction, serializer) => {
				serializer.writeUint64(transaction.applyHeightDelta);
				serializer.writeUint16(transaction.networkConfigSize);
				serializer.writeUint16(transaction.supportedEntityVersionsSize);
				serializer.writeBuffer(transaction.networkConfig);
				serializer.writeBuffer(transaction.supportedEntityVersions);
			}
		});

		codecBuilder.addTransactionSupport(EntityType.networkConfigAbsoluteHeight, {
			deserialize: parser => {
				const transaction = {};
				transaction.applyHeight = parser.uint64();
				transaction.networkConfigSize = parser.uint16();
				transaction.supportedEntityVersionsSize = parser.uint16();
				transaction.networkConfig = parser.buffer(transaction.networkConfigSize);
				transaction.supportedEntityVersions = parser.buffer(transaction.supportedEntityVersionsSize);

				return transaction;
			},

			serialize: (transaction, serializer) => {
				serializer.writeUint64(transaction.applyHeight);
				serializer.writeUint16(transaction.networkConfigSize);
				serializer.writeUint16(transaction.supportedEntityVersionsSize);
				serializer.writeBuffer(transaction.networkConfig);
				serializer.writeBuffer(transaction.supportedEntityVersions);
			}
		});
	}
};

module.exports = configPlugin;
