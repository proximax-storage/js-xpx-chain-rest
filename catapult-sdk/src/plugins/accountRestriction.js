/**
 *** Copyright 2022 ProximaX Limited. All rights reserved.
 *** Use of this source code is governed by the Apache 2.0
 *** license that can be found in the LICENSE file.
 **/

/** @module plugins/accountRestriction */
const EntityType = require('../model/EntityType');
const ModelType = require('../model/ModelType');
const uint64 = require('../utils/uint64');
const sizes = require('../modelBinary/sizes');

const constants = { sizes };

// const accountRestrictionTypeOutgoingOffset = 0x4000;
const accountRestrictionTypeBlockOffset = 0x8000;
const AccountRestrictionTypeFlags = Object.freeze({
	address: 0x0001,
	mosaic: 0x0002,
	operation: 0x0004
});

const accountRestrictionsCreateBaseCodec = valueCodec => ({
	deserialize: parser => {
		const transaction = {};
		transaction.restrictionFlags = parser.uint16();
		const restrictionAdditionsCount = parser.uint8();
		const restrictionDeletionsCount = parser.uint8();
		transaction.accountRestrictionTransactionBody_Reserved1 = parser.uint32();

		transaction.restrictionAdditions = [];
		for (let i = 0; i < restrictionAdditionsCount; ++i)
			transaction.restrictionAdditions.push(valueCodec.deserializeValue(parser));

		transaction.restrictionDeletions = [];
		for (let i = 0; i < restrictionDeletionsCount; ++i)
			transaction.restrictionDeletions.push(valueCodec.deserializeValue(parser));

		return transaction;
	},
	serialize: (transaction, serializer) => {
		serializer.writeUint16(transaction.restrictionFlags);
		serializer.writeUint8(transaction.restrictionAdditions.length);
		serializer.writeUint8(transaction.restrictionDeletions.length);
		serializer.writeUint32(transaction.accountRestrictionTransactionBody_Reserved1);
		transaction.restrictionAdditions.forEach(key => {
			valueCodec.serializeValue(serializer, key);
		});
		transaction.restrictionDeletions.forEach(key => {
			valueCodec.serializeValue(serializer, key);
		});
	}
});

const accountRestrictionTypeDescriptors = [
	{
		entityType: EntityType.accountAddressRestriction,
		schemaPrefix: 'address',
		valueType: ModelType.binary,
		flag: AccountRestrictionTypeFlags.address
	},
	{
		entityType: EntityType.accountMosaicRestriction,
		schemaPrefix: 'mosaic',
		valueType: ModelType.uint64HexIdentifier,
		flag: AccountRestrictionTypeFlags.mosaic
	},
	{
		entityType: EntityType.accountOperationRestriction,
		schemaPrefix: 'operation',
		valueType: ModelType.uint16,
		flag: AccountRestrictionTypeFlags.operation
	}
];

/**
 * Creates a account restriction plugin.
 * @type {module:plugins/CatapultPlugin}
 */
const accountRestrictionPlugin = {
	AccountRestrictionType: Object.freeze({
		addressAllow: AccountRestrictionTypeFlags.address,
		addressBlock: AccountRestrictionTypeFlags.address + accountRestrictionTypeBlockOffset,
		mosaicAllow: AccountRestrictionTypeFlags.mosaic,
		mosaicBlock: AccountRestrictionTypeFlags.mosaic + accountRestrictionTypeBlockOffset,
		operationAllow: AccountRestrictionTypeFlags.operation,
		operationBlock: AccountRestrictionTypeFlags.operation + accountRestrictionTypeBlockOffset
	}),
	registerSchema: builder => {
		/**
		 * Account restrictions scope
		 */
		accountRestrictionTypeDescriptors.forEach(restrictionTypeDescriptor => {
			// transaction schemas
			builder.addTransactionSupport(restrictionTypeDescriptor.entityType, {
				restrictionFlags: ModelType.uint16,
				restrictionAdditions: { type: ModelType.array, schemaName: restrictionTypeDescriptor.valueType },
				restrictionDeletions: { type: ModelType.array, schemaName: restrictionTypeDescriptor.valueType }
			});

			// aggregated account restriction subschemas
			builder.addSchema(`accountRestriction.${restrictionTypeDescriptor.schemaPrefix}AccountRestriction`, {
				restrictionFlags: ModelType.uint16,
				values: { type: ModelType.array, schemaName: restrictionTypeDescriptor.valueType }
			});
		});

		// aggregated account restrictions schemas
		builder.addSchema('accountRestrictions', {
			accountRestrictions: { type: ModelType.object, schemaName: 'accountRestriction.restrictions' }
		});
		builder.addSchema('accountRestriction.restrictions', {
			version: ModelType.uint16,
			address: ModelType.encodedAddress,
			restrictions: {
				type: ModelType.array,
				schemaName: entity => {
					for (let i = 0; i < accountRestrictionTypeDescriptors.length; i++) {
						if ((entity.restrictionFlags & 0x3FFF) === accountRestrictionTypeDescriptors[i].flag)
							// the following schemas were added in the previous loop
							return `accountRestriction.${accountRestrictionTypeDescriptors[i].schemaPrefix}AccountRestriction`;
					}
					return 'accountRestriction.fallback';
				}
			}
		});
		builder.addSchema('accountRestriction.fallback', {});
	},

	registerCodecs: codecBuilder => {
		// account restrictions address
		codecBuilder.addTransactionSupport(
			EntityType.accountAddressRestriction,
			accountRestrictionsCreateBaseCodec({
				deserializeValue: parser => parser.buffer(constants.sizes.addressDecoded),
				serializeValue: (serializer, value) => serializer.writeBuffer(value)
			})
		);

		// account restrictions mosaic
		codecBuilder.addTransactionSupport(
			EntityType.accountMosaicRestriction,
			accountRestrictionsCreateBaseCodec({
				deserializeValue: parser => parser.uint64(),
				serializeValue: (serializer, value) => serializer.writeUint64(value)
			})
		);

		// account restrictions operation
		codecBuilder.addTransactionSupport(
			EntityType.accountOperationRestriction,
			accountRestrictionsCreateBaseCodec({
				deserializeValue: parser => parser.uint16(),
				serializeValue: (serializer, value) => serializer.writeUint16(value)
			})
		);
	}
};

module.exports = accountRestrictionPlugin;
