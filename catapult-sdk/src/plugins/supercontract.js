/**
 *** Copyright 2020 ProximaX Limited. All rights reserved.
 *** Use of this source code is governed by the Apache 2.0
 *** license that can be found in the LICENSE file.
 **/

/** @module plugins/mosaic */
const EntityType = require('../model/EntityType');
const ModelType = require('../model/ModelType');
const uint64 = require('../utils/uint64');
const sizes = require('../modelBinary/sizes');

const constants = { sizes };

/**
 * Creates a super contract plugin.
 * @type {module:plugins/CatapultPlugin}
 */
const superContractPlugin = {
	registerSchema: builder => {
		builder.addTransactionSupport(EntityType.deploy, {
			drive: 			ModelType.binary,
			owner: 			ModelType.binary,
			fileHash: 		ModelType.binary,
			vmVersion: 		ModelType.uint64,
		});

		builder.addTransactionSupport(EntityType.startExecute, {
			superContract: 		ModelType.binary,
			function: 			ModelType.string,
			data: 				ModelType.binary,
			mosaics: 			{ type: ModelType.array, schemaName: 'execute.mosaic' }
		});

		builder.addTransactionSupport(EntityType.endExecute, {
			operationToken: 	ModelType.binary,
			mosaics: 			{ type: ModelType.array, schemaName: 'execute.mosaic' }
		});

		builder.addSchema('execute.mosaic', {
			id: 		ModelType.uint64,
			amount: 	ModelType.uint64,
		});

		builder.addSchema('superContractEntry', {
			supercontract: { type: ModelType.object, schemaName: 'supercontract' }
		});

		builder.addSchema('supercontract', {
			multisig:				ModelType.binary,
			multisigAddress:		ModelType.binary,
			start:					ModelType.uint64,
			end:					ModelType.uint64,
			mainDriveKey:			ModelType.binary,
			fileHash:				ModelType.binary,
			vmVersion:				ModelType.uint64,
		});
	},

	registerCodecs: codecBuilder => {
		codecBuilder.addTransactionSupport(EntityType.startExecute, {
			deserialize: parser => {
				const transaction = {};

				transaction.superContract = parser.buffer(constants.sizes.signer);
				transaction.functionSize = parser.uint8();
				transaction.mosaicsCount = parser.uint8();
				transaction.dataSize = parser.uint16();
				transaction.function = parser.buffer(transaction.functionSize);
				transaction.mosaics = [];

				let tmp = transaction.mosaicsCount;
				while (tmp--) {
					const mosaic = {};
					mosaic.id = parser.uint64();
					mosaic.amount = parser.uint64();
					transaction.mosaics.push(mosaic);
				}

				transaction.data = parser.buffer(transaction.dataSize);

				return transaction;
			},

			serialize: (transaction, serializer) => {
				serializer.writeBuffer(transaction.superContract);
				serializer.writeUint8(transaction.function.length);
				serializer.writeUint8(transaction.mosaics.length);
				serializer.writeUint16(transaction.data.length);
				serializer.writeBuffer(transaction.function);

				for (let i = 0; i < transaction.mosaicsCount; ++i) {
					const mosaic = transaction.mosaics[i];
					serializer.writeUint64(mosaic.id);
					serializer.writeUint64(mosaic.amount);
				}

				serializer.writeBuffer(transaction.data);
			}
		});

		codecBuilder.addTransactionSupport(EntityType.endExecute, {
			deserialize: parser => {
				const transaction = {};

				transaction.mosaicsCount = parser.uint8();
				transaction.operationToken = parser.buffer(constants.sizes.hash256);
				transaction.result = parser.uint16();
				transaction.mosaics = [];

				let tmp = transaction.mosaicsCount;
				while (tmp--) {
					const mosaic = {};
					mosaic.id = parser.uint64();
					mosaic.amount = parser.uint64();
					transaction.mosaics.push(mosaic);
				}

				return transaction;
			},

			serialize: (transaction, serializer) => {
				serializer.writeUint8(transaction.mosaics.length);
				serializer.writeBuffer(transaction.operationToken);

				for (let i = 0; i < transaction.mosaicsCount; ++i) {
					const mosaic = transaction.mosaics[i];
					serializer.writeUint64(mosaic.id);
					serializer.writeUint64(mosaic.amount);
				}

				serializer.writeUint16(transaction.result);
			}
		});

		codecBuilder.addTransactionSupport(EntityType.deploy, {
			deserialize: parser => {
				const transaction = {};

				transaction.drive = parser.buffer(constants.sizes.signer);
				transaction.owner = parser.buffer(constants.sizes.signer);
				transaction.fileHash = parser.buffer(constants.sizes.hash256);
				transaction.vmVersion = parser.uint64();

				return transaction;
			},

			serialize: (transaction, serializer) => {
				serializer.writeBuffer(transaction.drive);
				serializer.writeBuffer(transaction.owner);
				serializer.writeBuffer(transaction.fileHash);
				serializer.writeUint64(transaction.vmVersion);
			}
		});
	}
};

module.exports = superContractPlugin;
