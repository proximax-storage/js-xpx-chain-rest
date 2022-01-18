/**
 *** Copyright 2021 ProximaX Limited. All rights reserved.
 *** Use of this source code is governed by the Apache 2.0
 *** license that can be found in the LICENSE file.
 **/

/** @module plugins/storage */
const EntityType = require('../model/EntityType');
const ModelType = require('../model/ModelType');
const sizes = require('../modelBinary/sizes');

const constants = { sizes };

/**
 * Creates a storage plugin.
 * @type {module:plugins/CatapultPlugin}
 */
const storagePlugin = {
	registerSchema: builder => {
		builder.addTransactionSupport(EntityType.prepareBcDrive, {
			driveSize:				{ type: ModelType.uint64, schemaName: 'prepareBcDrive.driveSize' },
			verificationFeeAmount:	{ type: ModelType.uint64, schemaName: 'prepareBcDrive.verificationFeeAmount' },
			replicatorCount:		{ type: ModelType.uint16, schemaName: 'prepareBcDrive.replicatorCount' },
		});

		builder.addTransactionSupport(EntityType.dataModification, {
			driveKey:				{ type: ModelType.binary, schemaName: 'dataModification.driveKey' },
			downloadDataCdi: 		{ type: ModelType.binary, schemaName: 'dataModification.downloadDataCdi' },
			uploadSize:				{ type: ModelType.uint64, schemaName: 'dataModification.uploadSize' },
			feedbackFeeAmount:		{ type: ModelType.uint64, schemaName: 'dataModification.feedbackFeeAmount' },
		});

		builder.addTransactionSupport(EntityType.download, {
			driveKey:				{ type: ModelType.binary, schemaName: 'download.driveKey' },
			downloadSize:			{ type: ModelType.uint64, schemaName: 'download.downloadSize' },
			feedbackFeeAmount:		{ type: ModelType.uint64, schemaName: 'download.feedbackFeeAmount' },
			publicKeyCount:			{ type: ModelType.uint16, schemaName: 'download.publicKeyCount' },
			listOfPublicKeys:		{ type: ModelType.array,  schemaName: ModelType.binary },
		});

		builder.addTransactionSupport(EntityType.dataModificationApproval, {
			driveKey:				{ type: ModelType.binary, schemaName: 'dataModificationApproval.driveKey' },
			dataModificationId:		{ type: ModelType.binary, schemaName: 'dataModificationApproval.dataModificationId' },
			fileStructureCdi:		{ type: ModelType.binary, schemaName: 'dataModificationApproval.fileStructureCdi' },
			fileStructureSize:		{ type: ModelType.uint64, schemaName: 'dataModificationApproval.fileStructureSize' },
			usedDriveSize:			{ type: ModelType.uint64, schemaName: 'dataModificationApproval.usedDriveSize' },
		});

		builder.addTransactionSupport(EntityType.dataModificationCancel, {
			driveKey:				{ type: ModelType.binary, schemaName: 'dataModificationCancel.driveKey' },
			dataModificationId:		{ type: ModelType.binary, schemaName: 'dataModificationCancel.dataModificationId' },
		});

		builder.addTransactionSupport(EntityType.replicatorOnboarding, {
			capacity:				{ type: ModelType.uint64, schemaName: 'replicatorOnboarding.capacity' },
			blsKey: 				{ type: ModelType.binary, schemaName: 'replicatorOnboarding.blsKey' },
		});

		builder.addTransactionSupport(EntityType.replicatorOffboarding, {
			driveKey:				{ type: ModelType.binary, schemaName: 'replicatorOffboarding.driveKey' },
		});

		builder.addTransactionSupport(EntityType.finishDownload, {
			downloadChannelId:		{ type: ModelType.binary, schemaName: 'finishDownload.downloadChannelId' },
			feedbackFeeAmount:		{ type: ModelType.uint64, schemaName: 'finishDownload.feedbackFeeAmount' },
		});

		builder.addTransactionSupport(EntityType.downloadPayment, {
			downloadChannelId: 		{ type: ModelType.binary, schemaName: 'downloadPayment.downloadChannelId' },
			downloadSize:			{ type: ModelType.uint64, schemaName: 'downloadPayment.downloadSize' },
			feedbackFeeAmount:		{ type: ModelType.uint64, schemaName: 'downloadPayment.feedbackFeeAmount' },
		});

		builder.addTransactionSupport(EntityType.storagePayment, {
			driveKey: 				{ type: ModelType.binary, schemaName: 'storagePayment.driveKey' },
			storageUnits:			{ type: ModelType.uint64, schemaName: 'storagePayment.storageUnits' },
		});

		builder.addTransactionSupport(EntityType.dataModificationSingleApproval, {
			driveKey:				{ type: ModelType.binary, schemaName: 'dataModificationSingleApproval.driveKey' },
			dataModificationId:		{ type: ModelType.binary, schemaName: 'dataModificationSingleApproval.dataModificationId' },
			uploaderKeys:			{ type: ModelType.array,  schemaName: ModelType.binary },
			uploadOpinion:			{ type: ModelType.array,  schemaName: ModelType.uint16 },
		});

		builder.addTransactionSupport(EntityType.verificationPayment, {
			driveKey: 				{ type: ModelType.binary, schemaName: 'verificationPayment.driveKey' },
			verificationFeeAmount:	{ type: ModelType.uint64, schemaName: 'verificationPayment.verificationFeeAmount' },
		});

		builder.addTransactionSupport(EntityType.downloadApproval, {
			downloadChannelId: 						{ type: ModelType.binary, schemaName: 'downloadApproval.downloadChannelId' },
			approvalTrigger: 						{ type: ModelType.binary, schemaName: 'downloadApproval.approvalTrigger' },
			sequenceNumber:							{ type: ModelType.uint16, schemaName: 'downloadApproval.sequenceNumber' },
			responseToFinishDownloadTransaction:	{ type: ModelType.uint8,  schemaName: 'downloadApproval.responseToFinishDownloadTransaction' },
			judgingCount:							{ type: ModelType.uint8,  schemaName: 'downloadApproval.judgingCount' },
			overlappingCount:						{ type: ModelType.uint8,  schemaName: 'downloadApproval.overlappingCount' },
			judgedCount:							{ type: ModelType.uint8,  schemaName: 'downloadApproval.judgedCount' },
			opinionElementCount:					{ type: ModelType.uint16, schemaName: 'downloadApproval.opinionElementCount' },
			publicKeys:								{ type: ModelType.array,  schemaName: ModelType.binary },
			blsSignatures:							{ type: ModelType.array,  schemaName: ModelType.binary },
			presentOpinions:						{ type: ModelType.array,  schemaName: ModelType.uint8 },
			opinions:								{ type: ModelType.array,  schemaName: ModelType.uint64 },
		});

		builder.addTransactionSupport(EntityType.driveClosure, {
			driveKey: 				{ type: ModelType.binary, schemaName: 'driveClosure.driveKey' },
		});

		builder.addSchema('bcDriveEntry', {
			drive: { type: ModelType.object, schemaName: 'bcdrive' }
		});

		builder.addSchema('bcdrive', {
			multisig:					ModelType.binary,
			multisigAddress:			ModelType.binary,
			owner:						ModelType.binary,
			rootHash:					ModelType.binary,
			size:						ModelType.uint64,
			usedSize:					ModelType.uint64,
			metaFilesSize:				ModelType.uint64,
			replicatorCount:			ModelType.uint32,
			ownerCumulativeUploadSize:	ModelType.uint64,
			activeDataModifications: 	{ type: ModelType.array, schemaName: 'activeDataModification' },
			completedDataModifications: { type: ModelType.array, schemaName: 'completedDataModification' },
			confirmedUsedSizes: 		{ type: ModelType.array, schemaName: 'confirmedUsedSize' },
			replicators: 				{ type: ModelType.array, schemaName: ModelType.binary },
			offboardingReplicators: 	{ type: ModelType.array, schemaName: ModelType.binary },
			verifications: 				{ type: ModelType.array, schemaName: 'verification' },
		});

		builder.addSchema('activeDataModification', {
			id:						ModelType.binary,
			owner:					ModelType.binary,
			downloadDataCdi:		ModelType.binary,
			expectedUploadSize:		ModelType.uint64,
			actualUploadSize:		ModelType.uint64,
			folderName:				ModelType.string,
			readyForApproval:		ModelType.boolean,
		});

		builder.addSchema('completedDataModification', {
			id:						ModelType.binary,
			owner:					ModelType.binary,
			downloadDataCdi:		ModelType.binary,
			expectedUploadSize:		ModelType.uint64,
			actualUploadSize:		ModelType.uint64,
			folderName:				ModelType.string,
			readyForApproval:		ModelType.boolean,
			state:					ModelType.uint8,
		});

		builder.addSchema('confirmedUsedSize', {
			replicator:				ModelType.binary,
			size:					ModelType.uint64,
		});

		builder.addSchema('verification', {
			verificationTrigger:	ModelType.binary,
			expiration:				ModelType.uint64,
			expired:				ModelType.boolean,
			shards:					{ type: ModelType.array, schemaName: 'shard' },
		});

		builder.addSchema('shard', {
			id:						ModelType.uint32,
			replicators:			{ type: ModelType.array, schemaName: ModelType.binary },
		});
	},

	registerCodecs: codecBuilder => {
		codecBuilder.addTransactionSupport(EntityType.prepareBcDrive, {
			deserialize: parser => {
				const transaction = {};
				transaction.driveSize = parser.uint64();
				transaction.verificationFeeAmount = parser.uint64();
				transaction.replicatorCount = parser.uint16();

				return transaction;
			},

			serialize: (transaction, serializer) => {
				serializer.writeUint64(transaction.driveSize);
				serializer.writeUint64(transaction.verificationFeeAmount);
				serializer.writeUint16(transaction.replicatorCount);
			}
		});

		codecBuilder.addTransactionSupport(EntityType.dataModification, {
			deserialize: parser => {
				const transaction = {};
				transaction.driveKey = parser.buffer(constants.sizes.signer);
				transaction.downloadDataCdi = parser.buffer(constants.sizes.hash256);
				transaction.uploadSize = parser.uint64();
				transaction.feedbackFeeAmount = parser.uint64();

				return transaction;
			},

			serialize: (transaction, serializer) => {
				serializer.writeBuffer(transaction.driveKey);
				serializer.writeBuffer(transaction.downloadDataCdi);
				serializer.writeUint64(transaction.uploadSize);
				serializer.writeUint64(transaction.feedbackFeeAmount);
			}
		});

		codecBuilder.addTransactionSupport(EntityType.download, {
			deserialize: parser => {
				const transaction = {};
				transaction.driveKey = parser.buffer(constants.sizes.signer);
				transaction.downloadSize = parser.uint64();
				transaction.feedbackFeeAmount = parser.uint64();
				transaction.publicKeyCount = parser.uint16();

				transaction.listOfPublicKeys = [];
				let count = transaction.publicKeyCount;
				while (count-- > 0) {
					transaction.listOfPublicKeys.push(parser.buffer(constants.sizes.signer));
				}

				return transaction;
			},

			serialize: (transaction, serializer) => {
				serializer.writeBuffer(transaction.driveKey);
				serializer.writeUint64(transaction.downloadSize);
				serializer.writeUint64(transaction.feedbackFeeAmount);
				serializer.writeUint16(transaction.publicKeyCount);
				for (let i = 0; i < transaction.publicKeyCount; ++i) {
					serializer.writeBuffer(transaction.listOfPublicKeys[i]);
				}
			}
		});

		codecBuilder.addTransactionSupport(EntityType.dataModificationApproval, {
			deserialize: parser => {
				const transaction = {};
				transaction.driveKey = parser.buffer(constants.sizes.signer);
				transaction.dataModificationId = parser.buffer(constants.sizes.hash256);
				transaction.fileStructureCdi = parser.buffer(constants.sizes.hash256);
				transaction.fileStructureSize = parser.uint64();
				transaction.usedDriveSize = parser.uint64();

				return transaction;
			},

			serialize: (transaction, serializer) => {
				serializer.writeBuffer(transaction.driveKey);
				serializer.writeBuffer(transaction.dataModificationId);
				serializer.writeBuffer(transaction.fileStructureCdi);
				serializer.writeUint64(transaction.fileStructureSize);
				serializer.writeUint64(transaction.usedDriveSize);
			}
		});

		codecBuilder.addTransactionSupport(EntityType.dataModificationCancel, {
			deserialize: parser => {
				const transaction = {};
				transaction.driveKey = parser.buffer(constants.sizes.signer);
				transaction.dataModificationId = parser.buffer(constants.sizes.hash256);

				return transaction;
			},

			serialize: (transaction, serializer) => {
				serializer.writeBuffer(transaction.driveKey);
				serializer.writeBuffer(transaction.dataModificationId);
			}
		});

		codecBuilder.addTransactionSupport(EntityType.replicatorOnboarding, {
			deserialize: parser => {
				const transaction = {};
				transaction.capacity = parser.uint64();
				transaction.blsKey = parser.buffer(constants.sizes.blsPublicKey);

				return transaction;
			},

			serialize: (transaction, serializer) => {
				serializer.writeUint64(transaction.capacity);
				serializer.writeBuffer(transaction.blsKey);
			}
		});

		codecBuilder.addTransactionSupport(EntityType.replicatorOffboarding, {
			deserialize: parser => {
				const transaction = {};
				transaction.driveKey = parser.buffer(constants.sizes.signer);

				return transaction;
			},

			serialize: (transaction, serializer) => {
				serializer.writeBuffer(transaction.driveKey);
			}
		});

		codecBuilder.addTransactionSupport(EntityType.finishDownload, {
			deserialize: parser => {
				const transaction = {};
				transaction.downloadChannelId = parser.buffer(constants.sizes.hash256);
				transaction.feedbackFeeAmount = parser.uint64();

				return transaction;
			},

			serialize: (transaction, serializer) => {
				serializer.writeBuffer(transaction.downloadChannelId);
				serializer.writeUint64(transaction.feedbackFeeAmount);
			}
		});

		codecBuilder.addTransactionSupport(EntityType.downloadPayment, {
			deserialize: parser => {
				const transaction = {};
				transaction.downloadChannelId = parser.buffer(constants.sizes.hash256);
				transaction.downloadSize = parser.uint64();
				transaction.feedbackFeeAmount = parser.uint64();

				return transaction;
			},

			serialize: (transaction, serializer) => {
				serializer.writeBuffer(transaction.downloadChannelId);
				serializer.writeUint64(transaction.downloadSize);
				serializer.writeUint64(transaction.feedbackFeeAmount);
			}
		});

		codecBuilder.addTransactionSupport(EntityType.storagePayment, {
			deserialize: parser => {
				const transaction = {};
				transaction.driveKey = parser.buffer(constants.sizes.signer);
				transaction.storageUnits = parser.uint64();

				return transaction;
			},

			serialize: (transaction, serializer) => {
				serializer.writeBuffer(transaction.driveKey);
				serializer.writeUint64(transaction.storageUnits);
			}
		});

		codecBuilder.addTransactionSupport(EntityType.dataModificationSingleApproval, {
			deserialize: parser => {
				const transaction = {};
				transaction.driveKey = parser.buffer(constants.sizes.signer);
				transaction.dataModificationId = parser.buffer(constants.sizes.hash256);
				transaction.uploadOpinionPairCount = parser.uint16();
				transaction.usedDriveSize = parser.uint64();

				transaction.uploaderKeys = [];
				let count = transaction.uploadOpinionPairCount;
				while (count-- > 0) {
					transaction.uploaderKeys.push(parser.buffer(constants.sizes.signer));
				}

				transaction.uploadOpinion = [];
				count = transaction.uploadOpinionPairCount;
				while (count-- > 0) {
					transaction.uploadOpinion.push(parser.uint8());
				}

				return transaction;
			},

			serialize: (transaction, serializer) => {
				serializer.writeBuffer(transaction.driveKey);
				serializer.writeBuffer(transaction.dataModificationId);
				serializer.writeUint16(transaction.uploadOpinionPairCount);
				serializer.writeUint64(transaction.usedDriveSize);
				for (let i = 0; i < transaction.uploadOpinionPairCount; ++i) {
					serializer.writeBuffer(transaction.uploaderKeys[i]);
				}
				for (let i = 0; i < transaction.uploadOpinionPairCount; ++i) {
					serializer.writeUint8(transaction.uploadOpinion[i]);
				}
			}
		});

		codecBuilder.addTransactionSupport(EntityType.verificationPayment, {
			deserialize: parser => {
				const transaction = {};
				transaction.driveKey = parser.buffer(constants.sizes.signer);
				transaction.verificationFeeAmount = parser.uint64();

				return transaction;
			},

			serialize: (transaction, serializer) => {
				serializer.writeBuffer(transaction.driveKey);
				serializer.writeUint64(transaction.verificationFeeAmount);
			}
		});

		codecBuilder.addTransactionSupport(EntityType.downloadApproval, {
			deserialize: parser => {
				const transaction = {};
				transaction.downloadChannelId = parser.buffer(constants.sizes.hash256);
				transaction.approvalTrigger = parser.buffer(constants.sizes.hash256);
				transaction.sequenceNumber = parser.uint16();
				transaction.responseToFinishDownloadTransaction = parser.uint8();
				transaction.judgingCount = parser.uint8();
				transaction.overlappingCount = parser.uint8();
				transaction.judgedCount = parser.uint8();
				transaction.opinionElementCount = parser.uint16();

				transaction.publicKeys = [];
				let count = transaction.judgingCount + transaction.overlappingCount + transaction.judgedCount;
				while (count-- > 0) {
					transaction.publicKeys.push(parser.buffer(constants.sizes.signer));
				}

				transaction.blsSignatures = [];
				count = transaction.judgingCount + transaction.overlappingCount;
				while (count-- > 0) {
					transaction.blsSignatures.push(parser.buffer(constants.sizes.blsSignature));
				}

				transaction.presentOpinions = [];
				count = Math.floor(((transaction.judgingCount + transaction.overlappingCount) * transaction.judgedCount + 7) / 8);
				while (count-- > 0) {
					transaction.presentOpinions.push(parser.uint8());
				}

				const totalJudgingCount = transaction.overlappingCount + transaction.judgingCount;
				const totalJudgedCount = transaction.overlappingCount + transaction.judgedCount;
				const presentOpinionByteCount = Math.floor((totalJudgingCount * totalJudgedCount + 7) / 8);
				for (let i = 0; i < presentOpinionByteCount; ++i) {
					transaction.presentOpinions.push(parser.uint8());
				}

				transaction.opinions = [];
				count = transaction.opinionElementCount;
				while (count-- > 0) {
					transaction.opinions.push(parser.uint64());
				}

				return transaction;
			},

			serialize: (transaction, serializer) => {
				serializer.writeBuffer(transaction.downloadChannelId);
				serializer.writeBuffer(transaction.approvalTrigger);
				serializer.writeUint16(transaction.sequenceNumber);
				serializer.writeUint8(transaction.responseToFinishDownloadTransaction);
				serializer.writeUint8(transaction.judgingCount);
				serializer.writeUint8(transaction.overlappingCount);
				serializer.writeUint8(transaction.judgedCount);
				serializer.writeUint16(transaction.opinionElementCount);

				transaction.publicKeys.forEach(key => {
					serializer.writeBuffer(key);
				});

				transaction.blsSignatures.forEach(signature => {
					serializer.writeBuffer(signature);
				})

				transaction.presentOpinions.forEach(presentOpinion => {
					serializer.writeUint8(presentOpinion);
				})

				transaction.opinions.forEach(opinion => {
					serializer.writeUint64(opinion);
				})
			}
		});

		codecBuilder.addTransactionSupport(EntityType.driveClosure, {
			deserialize: parser => {
				const transaction = {};
				transaction.driveKey = parser.buffer(constants.sizes.signer);

				return transaction;
			},

			serialize: (transaction, serializer) => {
				serializer.writeBuffer(transaction.driveKey);
			}
		});
	}
};

module.exports = storagePlugin;
