/**
 *** Copyright 2022 ProximaX Limited. All rights reserved.
 *** Use of this source code is governed by the Apache 2.0
 *** license that can be found in the LICENSE file.
 **/

/** @module plugins/mosaicrestriction */
const EntityType = require('../model/EntityType');
const ModelType = require('../model/ModelType');
const sizes = require('../modelBinary/sizes');

const constants = { sizes };

/**
 * Creates a mosaic restriction plugin.
 * @type {module:plugins/CatapultPlugin}
 */
const mosaicRestrictionPlugin = {
	registerSchema: builder => {
		// MosaicAddressRestrictionTransaction transaction schema
		builder.addTransactionSupport(EntityType.mosaicAddressRestriction, {
			mosaicId: ModelType.uint64,
			restrictionKey: ModelType.uint64,
			targetAddress: ModelType.binary,
			previousRestrictionValue: ModelType.uint64,
			newRestrictionValue: ModelType.uint64
		});

		// MosaicGlobalRestrictionTransaction transaction schema
		builder.addTransactionSupport(EntityType.mosaicGlobalRestriction, {
			mosaicId: ModelType.uint64,
			referenceMosaicId: ModelType.uint64,
			restrictionKey: ModelType.uint64,
			previousRestrictionValue: ModelType.uint64,
			newRestrictionValue: ModelType.uint64,
			previousRestrictionType: ModelType.uint8,
			newRestrictionType: ModelType.uint8
		});

		// mosaic restriction schemas
		builder.addSchema('mosaicRestrictions', {
			id: ModelType.objectId,
			mosaicRestrictionEntry: { type: ModelType.object, schemaName: 'mosaicRestrictions.entry' }
		});
		builder.addSchema('mosaicRestrictions.entry', {
			version: ModelType.uint16,
			compositeHash: ModelType.binary,
			entryType: ModelType.uint32,
			mosaicId: ModelType.uint64,
			targetAddress: ModelType.binary,
			restrictions: { type: ModelType.array, schemaName: 'mosaicRestrictions.entry.restrictions' }
		});
		builder.addSchema('mosaicRestrictions.entry.restrictions', {
			key: ModelType.uint64,
			value: ModelType.uint64,
			restriction: { type: ModelType.object, schemaName: 'mosaicRestrictions.entry.restrictions.restriction' }
		});
		builder.addSchema('mosaicRestrictions.entry.restrictions.restriction', {
			referenceMosaicId: ModelType.uint64HexIdentifier,
			restrictionValue: ModelType.uint64,
			restrictionType: ModelType.uint8
		});
	},

	registerCodecs: codecBuilder => {
		// mosaic restrictions address
		codecBuilder.addTransactionSupport(EntityType.mosaicAddressRestriction, {
			deserialize: parser => {
				const transaction = {};
				transaction.mosaicId = parser.uint64();
				transaction.restrictionKey = parser.uint64();
				transaction.previousRestrictionValue = parser.uint64();
				transaction.newRestrictionValue = parser.uint64();
				transaction.targetAddress = parser.buffer(constants.sizes.addressDecoded);
				return transaction;
			},

			serialize: (transaction, serializer) => {
				serializer.writeUint64(transaction.mosaicId);
				serializer.writeUint64(transaction.restrictionKey);
				serializer.writeUint64(transaction.previousRestrictionValue);
				serializer.writeUint64(transaction.newRestrictionValue);
				serializer.writeBuffer(transaction.targetAddress);
			}
		});

		// mosaic restrictions global
		codecBuilder.addTransactionSupport(EntityType.mosaicGlobalRestriction, {
			deserialize: parser => {
				const transaction = {};
				transaction.mosaicId = parser.uint64();
				transaction.referenceMosaicId = parser.uint64();
				transaction.restrictionKey = parser.uint64();
				transaction.previousRestrictionValue = parser.uint64();
				transaction.newRestrictionValue = parser.uint64();
				transaction.previousRestrictionType = parser.uint8();
				transaction.newRestrictionType = parser.uint8();
				return transaction;
			},

			serialize: (transaction, serializer) => {
				serializer.writeUint64(transaction.mosaicId);
				serializer.writeUint64(transaction.referenceMosaicId);
				serializer.writeUint64(transaction.restrictionKey);
				serializer.writeUint64(transaction.previousRestrictionValue);
				serializer.writeUint64(transaction.newRestrictionValue);
				serializer.writeUint8(transaction.previousRestrictionType);
				serializer.writeUint8(transaction.newRestrictionType);
			}
		});
	}
};

module.exports = mosaicRestrictionPlugin;
