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

/** @module plugins/accountProperties */
const EntityType = require('../model/EntityType');
const ModelType = require('../model/ModelType');
const sizes = require('../modelBinary/sizes');

const constants = { sizes };


const accountPropertiesCreateBaseCodec = valueCodec => ({
	deserialize: parser => {
		const transaction = {};
		transaction.propertyType = parser.uint8();
		transaction.modifications = [];
		const propertiesCount = parser.uint8();
		for (let i = 0; i < propertiesCount; ++i) {
			transaction.modifications.push({
				modificationType: parser.uint8(),
				value: valueCodec.deserializeValue(parser)
			});
		}
		return transaction;
	},
	serialize: (transaction, serializer) => {
		serializer.writeUint8(transaction.propertyType);
		serializer.writeUint8(transaction.modifications.length);
		for (let i = 0; i < transaction.modifications.length; ++i) {
			serializer.writeUint8(transaction.modifications[i].modificationType);
			valueCodec.serializeValue(serializer, transaction.modifications[i].value);
		}
	}
});

const propertyTypeBlockOffset = 128;
const PropertyTypeFlags = Object.freeze({
	address: 1,
	mosaic: 2,
	entityType: 4
});

/**
 * Creates an accountProperties plugin.
 * @type {module:plugins/CatapultPlugin}
 */
const accountPropertiesPlugin = {
	PropertyType: Object.freeze({
		addressAllow: PropertyTypeFlags.address,
		addressBlock: PropertyTypeFlags.address + propertyTypeBlockOffset,
		mosaicAllow: PropertyTypeFlags.mosaic,
		mosaicBlock: PropertyTypeFlags.mosaic + propertyTypeBlockOffset,
		entityTypeAllow: PropertyTypeFlags.entityType,
		entityTypeBlock: PropertyTypeFlags.entityType + propertyTypeBlockOffset
	}),

	registerSchema: builder => {
		// transaction schema for account property transactions
		const modificationTypeSchema = modificationsSchemaName => ({
			modifications: { type: ModelType.array, schemaName: modificationsSchemaName }
		});
		builder.addTransactionSupport(
			EntityType.accountPropertiesAddress,
			modificationTypeSchema('accountProperties.addressModificationType')
		);
		builder.addTransactionSupport(
			EntityType.accountPropertiesMosaic,
			modificationTypeSchema('accountProperties.mosaicModificationType')
		);
		builder.addTransactionSupport(
			EntityType.accountPropertiesEntityType,
			modificationTypeSchema('accountProperties.entityTypeModificationType')
		);
		builder.addSchema('accountProperties.addressModificationType', {
			value: ModelType.binary
		});
		builder.addSchema('accountProperties.mosaicModificationType', {
			value: ModelType.uint64
		});
		builder.addSchema('accountProperties.entityTypeModificationType', {
			value: ModelType.uint16
		});

		// aggregated account property assets
		builder.addSchema('accountProperties', {
			accountProperties: { type: ModelType.object, schemaName: 'accountProperties.accountProperties'}
		});
		builder.addSchema('accountProperties.accountProperties', {
			address: ModelType.binary,
			properties: {
				type: ModelType.array,
				schemaName: entity => {
					const propertyType = entity.propertyType & 0x7F;
					if (propertyType === PropertyTypeFlags.address)
						return 'accountProperties.addressAccountProperty';

					else if (propertyType === PropertyTypeFlags.mosaic)
						return 'accountProperties.mosaicAccountProperty';

					else if (propertyType === PropertyTypeFlags.entityType)
						return 'accountProperties.entityTypeAccountProperty';
				}
			}
		});
		builder.addSchema('accountProperties.addressAccountProperty', {
			values: { type: ModelType.array, schemaName: ModelType.binary }
		});
		builder.addSchema('accountProperties.mosaicAccountProperty', {
			values: { type: ModelType.array, schemaName: ModelType.uint64 }
		});
		builder.addSchema('accountProperties.entityTypeAccountProperty', {
			values: { type: ModelType.array, schemaName: ModelType.uint16 }
		});
	},

	registerCodecs: codecBuilder => {
		codecBuilder.addTransactionSupport(
			EntityType.accountPropertiesAddress,
			accountPropertiesCreateBaseCodec({
				deserializeValue: parser => parser.buffer(constants.sizes.addressDecoded),
				serializeValue: (serializer, value) => serializer.writeBuffer(value)
			})
		);

		codecBuilder.addTransactionSupport(
			EntityType.accountPropertiesMosaic,
			accountPropertiesCreateBaseCodec({
				deserializeValue: parser => parser.uint64(),
				serializeValue: (serializer, value) => serializer.writeUint64(value)
			})
		);

		codecBuilder.addTransactionSupport(
			EntityType.accountPropertiesEntityType,
			accountPropertiesCreateBaseCodec({
				deserializeValue: parser => parser.uint16(),
				serializeValue: (serializer, value) => serializer.writeUint16(value)
			})
		);
	}
};

module.exports = accountPropertiesPlugin;
