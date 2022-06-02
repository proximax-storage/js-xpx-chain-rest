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

/** @module plugins/mosaic */
const EntityType = require('../model/EntityType');
const ModelType = require('../model/ModelType');
const sizes = require('../modelBinary/sizes');
const uint64 = require('../utils/uint64');

const constants = { sizes };

/**
 * Creates a mosaic plugin.
 * @type {module:plugins/CatapultPlugin}
 */
const mosaicPlugin = {
	registerSchema: builder => {
		builder.addTransactionSupport(EntityType.mosaicDefinition, {
			mosaicId: ModelType.uint64,
			mosaicNonce: ModelType.uint32,
			properties: { type: ModelType.array, schemaName: 'mosaicDefinition.mosaicProperty' }
		});

		builder.addSchema('mosaicDefinition.mosaicProperty', {
			value: ModelType.uint64
		});

		builder.addTransactionSupport(EntityType.mosaicSupplyChange, {
			mosaicId: ModelType.uint64,
			delta: ModelType.uint64
		});

		builder.addSchema('mosaicDescriptor', {
			meta: { type: ModelType.object, schemaName: 'transactionMetadata' },
			mosaic: { type: ModelType.object, schemaName: 'mosaicDescriptor.mosaic' }
		});

		builder.addSchema('mosaicDescriptor.mosaic', {
			mosaicId: ModelType.uint64,
			supply: ModelType.uint64,

			height: ModelType.uint64,
			owner: ModelType.binary,
			properties: { type: ModelType.array, schemaName: 'mosaicDefinition.mosaicProperty' }
		});

		builder.addSchema('mosaicLevy', {
			levyType: ModelType.uint8,
			recipient: ModelType.binary,
			mosaicId: ModelType.uint64,
			fee: ModelType.uint64
		});

		builder.addTransactionSupport(EntityType.mosaicModifyLevy, {
			command : ModelType.uint32,
			updateFlag : ModelType.uint32,
			mosaicId: ModelType.uint64,
			levy: { type: ModelType.object, schemaName: 'mosaicLevy' },
		});

		builder.addTransactionSupport(EntityType.mosaicRemoveLevy, {
			mosaicId: ModelType.uint64,
		});
	},

	registerCodecs: codecBuilder => {
		const numRequiredProperties = 2; // flags and divisibility
		codecBuilder.addTransactionSupport(EntityType.mosaicDefinition, {
			deserialize: parser => {
				const transaction = {};

				transaction.mosaicNonce = parser.uint32();
				transaction.mosaicId = parser.uint64();
				const propertiesCount = parser.uint8();

				transaction.properties = [];
				for (let i = 0; i < numRequiredProperties; ++i)
					transaction.properties.push({ id: i, value: uint64.fromUint(parser.uint8()) });

				if (0 < propertiesCount) {
					for (let i = 0; i < propertiesCount; ++i) {
						const id = parser.uint8();
						const value = parser.uint64();
						transaction.properties.push({ id, value });
					}
				}

				return transaction;
			},

			serialize: (transaction, serializer) => {
				serializer.writeUint32(transaction.mosaicNonce);
				serializer.writeUint64(transaction.mosaicId);

				const propertiesCount = transaction.properties.length - numRequiredProperties;
				if (0 > propertiesCount)
					throw Error('all required properties must be specified in bag');

				serializer.writeUint8(propertiesCount);

				// notice that required property values are uint8 size
				for (let i = 0; i < numRequiredProperties; ++i) {
					const property = transaction.properties[i];
					if (i !== property.id)
						throw Error(`unexpected property ${property.id} at position ${i} in bag`);

					const value = uint64.compact(property.value);
					if ('number' !== typeof value || 0xFF < value)
						throw Error(`property ${property.id} value is too large`);

					serializer.writeUint8(value);
				}

				for (let i = 0; i < propertiesCount; ++i) {
					const property = transaction.properties[numRequiredProperties + i];
					serializer.writeUint8(property.id);
					serializer.writeUint64(property.value);
				}
			}
		});

		codecBuilder.addTransactionSupport(EntityType.mosaicSupplyChange, {
			deserialize: parser => {
				const transaction = {};
				transaction.mosaicId = parser.uint64();
				transaction.direction = parser.uint8();
				transaction.delta = parser.uint64();
				return transaction;
			},

			serialize: (transaction, serializer) => {
				serializer.writeUint64(transaction.mosaicId);
				serializer.writeUint8(transaction.direction);
				serializer.writeUint64(transaction.delta);
			}
		});

		codecBuilder.addTransactionSupport(EntityType.mosaicModifyLevy, {
			deserialize: parser => {
				const transaction = {};

				transaction.mosaicId = parser.uint64();

				transaction.levy = {};
				transaction.levy.type = parser.uint8();
				transaction.levy.recipient = parser.buffer(constants.sizes.addressDecoded);
				transaction.levy.mosaicId = parser.uint64();
				transaction.levy.fee = parser.uint64();

				return transaction;
			},

			serialize: (transaction, serializer) => {
				serializer.writeUint64(transaction.mosaicId);

				serializer.writeUint8(transaction.levy.type);
				serializer.writeBuffer(transaction.levy.recipient);
				serializer.writeUint64(transaction.levy.mosaicId);
				serializer.writeUint64(transaction.levy.fee);
			}
		});

		codecBuilder.addTransactionSupport(EntityType.mosaicRemoveLevy, {
			deserialize: parser => {
				const transaction = {};

				transaction.mosaicId = parser.uint64();
				return transaction;
			},

			serialize: (transaction, serializer) => {
				serializer.writeUint64(transaction.mosaicId);
			}
		});
	}
};

module.exports = mosaicPlugin;
