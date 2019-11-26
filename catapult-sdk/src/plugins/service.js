/**
 *** Copyright 2019 ProximaX Limited. All rights reserved.
 *** Use of this source code is governed by the Apache 2.0
 *** license that can be found in the LICENSE file.
 **/

/** @module plugins/service */
const EntityType = require('../model/EntityType');
const ModelType = require('../model/ModelType');
const sizes = require('../modelBinary/sizes');

const constants = { sizes };

/**
 * Creates a service plugin.
 * @type {module:plugins/CatapultPlugin}
 */
const servicePlugin = {
	registerSchema: builder => {
		builder.addTransactionSupport(EntityType.prepareDrive, {
			owner: 				{ type: ModelType.binary, schemaName: 'prepareDrive.owner' },
			duration:			{ type: ModelType.uint64, schemaName: 'prepareDrive.duration' },
			billingPeriod:		{ type: ModelType.uint64, schemaName: 'prepareDrive.billingPeriod' },
			billingPrice:		{ type: ModelType.uint64, schemaName: 'prepareDrive.billingPrice' },
			driveSize:			{ type: ModelType.uint64, schemaName: 'prepareDrive.driveSize' },
			replicas:			{ type: ModelType.uint16, schemaName: 'prepareDrive.replicas' },
			minReplicators:		{ type: ModelType.uint16, schemaName: 'prepareDrive.minReplicators' },
			percentApprovers:	{ type: ModelType.uint16, schemaName: 'prepareDrive.percentApprovers' },
		});

		builder.addTransactionSupport(EntityType.joinToDrive, {
			driveKey: 			{ type: ModelType.binary, schemaName: 'joinToDrive.driveKey' },
		});

		builder.addTransactionSupport(EntityType.driveFileSystem, {
			driveKey: 			{ type: ModelType.binary, schemaName: 'driveFileSystem.driveKey' },
			rootHash: 			{ type: ModelType.binary, schemaName: 'driveFileSystem.rootHash' },
			xorRootHash: 		{ type: ModelType.binary, schemaName: 'driveFileSystem.rootHash' },
			addActions: 		{ type: ModelType.array, schemaName: 'driveFileSystem.addfiles' },
			removeActions: 		{ type: ModelType.array, schemaName: 'filesDeposit.files' },
		});

		builder.addTransactionSupport(EntityType.filesDeposit, {
			driveKey: 			{ type: ModelType.binary, schemaName: 'filesDeposit.driveKey' },
			files: 				{ type: ModelType.array, schemaName: 'filesDeposit.files' }
		});

		builder.addTransactionSupport(EntityType.endDrive, {
			driveKey: 			{ type: ModelType.binary, schemaName: 'filesDeposit.driveKey' },
		});

		builder.addTransactionSupport(EntityType.deleteReward, {
			deletedFiles: 			{ type: ModelType.array, schemaName: 'deleteReward.deletedFile' },
		});

		builder.addSchema('deleteReward.deletedFile', {
			fileHash: 		ModelType.binary,
			size:			ModelType.uint64,
			uploadInfos: 	{ type: ModelType.array, schemaName: 'deleteReward.uploadInfo' },
		});

		builder.addSchema('deleteReward.uploadInfo', {
			participant: 		ModelType.binary,
			uploaded:			ModelType.uint64,
		});

		builder.addSchema('driveFileSystem.addfiles', {
			fileHash: ModelType.binary,
			fileSize: ModelType.uint64,
		});

		builder.addSchema('filesDeposit.files', {
			fileHash: ModelType.binary
		});

		builder.addSchema('driveEntry', {
			drive: { type: ModelType.object, schemaName: 'drive' }
		});

		builder.addSchema('paymentInformation', {
			receiver:			ModelType.binary,
			amount:				ModelType.uint64,
			height:				ModelType.uint64
		});

		builder.addSchema('billingPeriodDescription', {
			start:			ModelType.uint64,
			end:			ModelType.uint64,
			payments:		{ type: ModelType.array, schemaName: 'paymentInformation' },
		});

		builder.addSchema('fileAction', {
			height:				ModelType.uint64
		});

		builder.addSchema('fileInfo', {
			fileHash:		ModelType.binary,
			deposit:		ModelType.uint64,
			size:			ModelType.uint64,
			payments:		{ type: ModelType.array, schemaName: 'paymentInformation' },
			actions:		{ type: ModelType.array, schemaName: 'fileAction' },
		});

		builder.addSchema('fileWithoutDeposit', {
			fileHash:		ModelType.binary,
			count:			ModelType.uint16,
		});

		builder.addSchema('replicatorInfo', {
			replicator:				ModelType.binary,
			start:					ModelType.uint64,
			end:					ModelType.uint64,
			deposit:				ModelType.uint64,
			filesWithoutDeposit:	{ type: ModelType.array, schemaName: 'fileWithoutDeposit' },
		});

		builder.addSchema('drive', {
			multisig:				ModelType.binary,
			multisigAddress:		ModelType.binary,
			owner:					ModelType.binary,
			start:					ModelType.uint64,
			end:					ModelType.uint64,
			rootHash:				ModelType.binary,
			duration:				ModelType.uint64,
			billingPeriod:			ModelType.uint64,
			billingPrice:			ModelType.uint64,
			size:					ModelType.uint64,
			replicas:				ModelType.uint16,
			minReplicators:			ModelType.uint16,
			billingHistory: 		{ type: ModelType.array, schemaName: 'billingPeriodDescription' },
			files: 					{ type: ModelType.array, schemaName: 'fileInfo' },
			replicators: 			{ type: ModelType.array, schemaName: 'replicatorInfo' },
		});

		builder.addSchema('service.driveStateWithMetadata', {
			driveKey: ModelType.binary,
			meta: { type: ModelType.object, schemaName: 'topicMetadata' }
		});
	},

	registerCodecs: codecBuilder => {
		codecBuilder.addTransactionSupport(EntityType.prepareDrive, {
			deserialize: parser => {
				const transaction = {};
				transaction.owner = parser.buffer(constants.sizes.signer);
				transaction.duration = parser.uint64();
				transaction.billingPeriod = parser.uint64();
				transaction.billingPrice = parser.uint64();
				transaction.driveSize = parser.uint64();
				transaction.replicas = parser.uint16();
				transaction.minReplicators = parser.uint16();
				transaction.percentApprovers = parser.uint8();

				return transaction;
			},

			serialize: (transaction, serializer) => {
				serializer.writeBuffer(transaction.owner);
				serializer.writeUint64(transaction.duration);
				serializer.writeUint64(transaction.billingPeriod);
				serializer.writeUint64(transaction.billingPrice);
				serializer.writeUint64(transaction.driveSize);
				serializer.writeUint16(transaction.replicas);
				serializer.writeUint16(transaction.minReplicators);
				serializer.writeUint8(transaction.percentApprovers);
			}
		});

		codecBuilder.addTransactionSupport(EntityType.joinToDrive, {
			deserialize: parser => {
				const transaction = {};
				transaction.driveKey = parser.buffer(constants.sizes.signer);

				return transaction;
			},

			serialize: (transaction, serializer) => {
				serializer.writeBuffer(transaction.driveKey);
			}
		});

		codecBuilder.addTransactionSupport(EntityType.endDrive, {
			deserialize: parser => {
				const transaction = {};
				transaction.driveKey = parser.buffer(constants.sizes.signer);

				return transaction;
			},

			serialize: (transaction, serializer) => {
				serializer.writeBuffer(transaction.driveKey);
			}
		});

		const deserializeFiles = function(parser, count, files, reader) {
			let i = count;
			while (i--) {
				files.push(reader(parser));
			}
		};

		codecBuilder.addTransactionSupport(EntityType.driveFileSystem, {
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
				}
			}
		});

		codecBuilder.addTransactionSupport(EntityType.filesDeposit, {
			deserialize: parser => {
				const transaction = {};
				transaction.driveKey = parser.buffer(constants.sizes.signer);
				transaction.filesCount = parser.uint16();
				transaction.files = [];

				deserializeFiles(parser, transaction.filesCount, transaction.files, (parser) => {
					const file = {};
					file.fileHash = parser.buffer(constants.sizes.hash256);
					return file;
				});

				return transaction;
			},

			serialize: (transaction, serializer) => {
				serializer.writeBuffer(transaction.driveKey);
				serializer.writeUint16(transaction.files.length);

				for (let i = 0; i < transaction.filesCount; ++i)
					serializer.writeBuffer(transaction.files[i].fileHash);
			}
		});

		codecBuilder.addTransactionSupport(EntityType.deleteReward, {
			deserialize: (parser, size, txCodecs, preprocessedBytes = 0) => {
				let bodySize = size - preprocessedBytes;
				const transaction = {};
				transaction.deletedFiles = [];

				while (bodySize > 0) {
					const deletedFile = {};
					deletedFile.fileHash = parser.buffer(constants.sizes.hash256);
					deletedFile.size = parser.uint32();
					deletedFile.uploadInfos = [];

					let size = deletedFile.size - (constants.sizes.hash256 + 4);
					while (size > 0) {
						deletedFile.uploadInfos.push({
							participant: parser.buffer(constants.sizes.hash256),
							uploaded: parser.uint64(),
						});
						size -= constants.sizes.hash256 + 8;
					}

					transaction.deletedFiles.push(deletedFile);
					bodySize -= deletedFile.size;
				}

				return transaction;
			},

			serialize: (transaction, serializer) => {
				for (let i = 0; i < transaction.deletedFiles.length; ++i) {
					const deletedFile = transaction.deletedFiles[i];
					serializer.writeBuffer(deletedFile.fileHash);
					serializer.writeUint32(deletedFile.size);

					for (let j = 0; j < deletedFile.uploadInfos.length; ++j) {
						const uploadInfo = deletedFile.uploadInfos[j];
						serializer.writeBuffer(uploadInfo.participant);
						serializer.writeUint64(uploadInfo.uploaded);
					}
				}
			}
		});
	}
};

module.exports = servicePlugin;
