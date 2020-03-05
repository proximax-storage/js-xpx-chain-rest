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

		builder.addTransactionSupport(EntityType.uploadFile, {
			driveKey: 			{ type: ModelType.binary, schemaName: 'uploadFile.driveKey' },
			rootHash: 			{ type: ModelType.binary, schemaName: 'uploadFile.rootHash' },
			xorRootHash: 		{ type: ModelType.binary, schemaName: 'uploadFile.rootHash' },
			addActions: 		{ type: ModelType.array, schemaName: 'uploadFile.addfiles' },
			removeActions: 		{ type: ModelType.array, schemaName: 'uploadFile.addfiles' },
		});

		builder.addTransactionSupport(EntityType.deactivate, {
			superContract: 		ModelType.binary,
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
			owner:					ModelType.binary,
			end:					ModelType.uint64,
			mainDriveKey:			ModelType.binary,
			fileHash:				ModelType.binary,
			vmVersion:				ModelType.uint64,
		});

		builder.addSchema('uploadFile.addfiles', {
			fileHash: ModelType.binary,
			fileSize: ModelType.uint64,
		});
	},

	registerCodecs: codecBuilder => {
		codecBuilder.addTransactionSupport(EntityType.startExecute, {
			deserialize: parser => {
				const transaction = {};

				transaction.mosaicsCount = parser.uint8();
				transaction.superContract = parser.buffer(constants.sizes.signer);
				transaction.functionSize = parser.uint8();
				transaction.dataSize = parser.uint16();
				transaction.mosaics = [];

				let tmp = transaction.mosaicsCount;
				while (tmp--) {
					const mosaic = {};
					mosaic.id = parser.uint64();
					mosaic.amount = parser.uint64();
					transaction.mosaics.push(mosaic);
				}

				transaction.function = parser.buffer(transaction.functionSize);
				transaction.data = parser.buffer(transaction.dataSize);

				return transaction;
			},

			serialize: (transaction, serializer) => {
				serializer.writeUint8(transaction.mosaics.length);
				serializer.writeBuffer(transaction.superContract);
				serializer.writeUint8(transaction.function.length);
				serializer.writeUint16(transaction.data.length);

				for (let i = 0; i < transaction.mosaicsCount; ++i) {
					const mosaic = transaction.mosaics[i];
					serializer.writeUint64(mosaic.id);
					serializer.writeUint64(mosaic.amount);
				}

				serializer.writeBuffer(transaction.function);
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
				serializer.writeUint16(transaction.result);

				for (let i = 0; i < transaction.mosaicsCount; ++i) {
					const mosaic = transaction.mosaics[i];
					serializer.writeUint64(mosaic.id);
					serializer.writeUint64(mosaic.amount);
				}
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

		const deserializeFiles = function(parser, count, files, reader) {
			let i = count;
			while (i--) {
				files.push(reader(parser));
			}
		};

		codecBuilder.addTransactionSupport(EntityType.uploadFile, {
			deserialize: parser => {
				const transaction = {};
				transaction.driveKey = parser.buffer(constants.sizes.signer);
				transaction.rootHash = parser.buffer(constants.sizes.hash256);
				transaction.xorRootHash = parser.buffer(constants.sizes.hash256);
				transaction.addActionsCount = parser.uint16();
				transaction.addActions = [];
				transaction.removeActionsCount = parser.uint16();
				transaction.removeActions = [];

				deserializeFiles(parser, transaction.addActionsCount, transaction.addActions, (parser) => {
					const file = {};
					file.fileHash = parser.buffer(constants.sizes.hash256);
					file.fileSize = parser.uint64();
					return file;
				});

				deserializeFiles(parser, transaction.removeActionsCount, transaction.removeActions, (parser) => {
					const file = {};
					file.fileHash = parser.buffer(constants.sizes.hash256);
					file.fileSize = parser.uint64();
					return file;
				});

				return transaction;
			},

			serialize: (transaction, serializer) => {
				serializer.writeBuffer(transaction.driveKey);
				serializer.writeBuffer(transaction.rootHash);
				serializer.writeBuffer(transaction.xorRootHash);
				serializer.writeUint16(transaction.addActions.length);
				serializer.writeUint16(transaction.removeActions.length);

				for (let i = 0; i < transaction.addActions.length; ++i) {
					serializer.writeBuffer(transaction.addActions[i].fileHash);
					serializer.writeUint64(transaction.addActions[i].fileSize);
				}

				for (let i = 0; i < transaction.removeActions.length; ++i) {
					serializer.writeBuffer(transaction.removeActions[i].fileHash);
					serializer.writeUint64(transaction.removeActions[i].fileSize);
				}
			}
		});

		codecBuilder.addTransactionSupport(EntityType.deactivate, {
			deserialize: parser => {
				const transaction = {};

				transaction.superContract = parser.buffer(constants.sizes.signer);

				return transaction;
			},

			serialize: (transaction, serializer) => {
				serializer.writeBuffer(transaction.superContract);
			}
		});
	}
};

module.exports = superContractPlugin;
