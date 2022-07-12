/**
 *** Copyright 2022 ProximaX Limited. All rights reserved.
 *** Use of this source code is governed by the Apache 2.0
 *** license that can be found in the LICENSE file.
 **/

/** @module plugins/lockfund */
const EntityType = require('../model/EntityType');
const ModelType = require('../model/ModelType');
const uint64 = require('../utils/uint64');
const sizes = require('../modelBinary/sizes');

const constants = { sizes };

/**
 * Creates a lock fund plugin.
 * @type {module:plugins/CatapultPlugin}
 */
const lockFundPlugin = {
	registerSchema: builder => {
		builder.addTransactionSupport(EntityType.lockFundTransfer, {
			action:				ModelType.uint8,
			duration:			ModelType.uint64,
			mosaics: { type: ModelType.array, schemaName: 'mosaic' }
		});

		builder.addTransactionSupport(EntityType.lockFundCancelUnlock, {
			targetHeight: ModelType.uint64
		});

		builder.addSchema('lockFundRecordGroupEntry_height', {
			lockFundRecordGroup:		{ type: ModelType.object, schemaName: 'lockfundrecordgroup_height' }
		});

		builder.addSchema('lockFundRecordGroupEntry_key', {
			lockFundRecordGroup:		{ type: ModelType.object, schemaName: 'lockfundrecordgroup_key' }
		});

		builder.addSchema('inactiveRecord', {
			mosaics: { type: ModelType.array, schemaName: 'mosaic' }
		});

		builder.addSchema('lockfundrecordgroup_height', {
			identifier:			ModelType.uint64,
			records:			{ type: ModelType.array, schemaName: 'lockfundrecord_height' }
		});

		builder.addSchema('lockfundrecordgroup_key', {
			identifier:			ModelType.binary,
			records:			{ type: ModelType.array, schemaName: 'lockfundrecord_key' }
		});

		builder.addSchema('lockfundrecord_height', {
			activeMosaics: { type: ModelType.array, schemaName: 'mosaic' },
			inactiveRecords:  { type: ModelType.array, schemaName: 'inactiveRecord' },
			key: {type: ModelType.binary}
		});

		builder.addSchema('lockfundrecord_key', {
			activeMosaics: { type: ModelType.array, schemaName: 'mosaic' },
			inactiveRecords:  { type: ModelType.array, schemaName: 'inactiveRecord' },
			key: {type: ModelType.uint64}
		});
	},

	registerCodecs: codecBuilder => {
		codecBuilder.addTransactionSupport(EntityType.lockFundTransfer, {
			deserialize: parser => {
				const transaction = {};

				transaction.duration = parser.uint64();
				transaction.action = parser.uint8();

				const numMosaics = parser.uint8();
				if (0 < numMosaics) {
					transaction.mosaics = [];
					while (transaction.mosaics.length < numMosaics) {
						const id = parser.uint64();
						const amount = parser.uint64();
						transaction.mosaics.push({ id, amount });
					}
				}

				return transaction;
			},

			serialize: (transaction, serializer) => {
				serializer.writeUint64(transaction.duration);
				serializer.writeUint8(transaction.action);

				const numMosaics = transaction.mosaics ? transaction.mosaics.length : 0;
				serializer.writeUint8(numMosaics);

				if (0 < numMosaics) {
					transaction.mosaics.forEach(mosaic => {
						serializer.writeUint64(mosaic.id);
						serializer.writeUint64(mosaic.amount);
					});
				}
			}
		});

		codecBuilder.addTransactionSupport(EntityType.lockFundCancelUnlock, {
			deserialize: parser => {
				const transaction = {};

				transaction.targetHeight = parser.uint64();
				return transaction;
			},

			serialize: (transaction, serializer) => {
				serializer.writeUint64(transaction.targetHeight);

			}
		});
	}
};

module.exports = lockFundPlugin;
