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
			downloadSize:			{ type: ModelType.uint64, schemaName: 'download.downloadSize' },
			feedbackFeeAmount:		{ type: ModelType.uint64, schemaName: 'download.feedbackFeeAmount' },
			listOfPublicKeys:		{ type: ModelType.array,  schemaName: ModelType.binary },
		});

		builder.addTransactionSupport(EntityType.dataModificationApproval, {
			driveKey:				{ type: ModelType.binary, schemaName: 'dataModificationApproval.driveKey' },
			dataModificationId:		{ type: ModelType.binary, schemaName: 'dataModificationApproval.dataModificationId' },
			fileStructureCdi:		{ type: ModelType.binary, schemaName: 'dataModificationApproval.fileStructureCdi' },
			fileStructureSize:		{ type: ModelType.uint64, schemaName: 'dataModificationApproval.fileStructureSize' },
			metaFilesSize: 			{ type: ModelType.uint64, schemaName: 'dataModificationApproval.metaFilesSize' },
			usedDriveSize:			{ type: ModelType.uint64, schemaName: 'dataModificationApproval.usedDriveSize' },
			publicKeys:				{ type: ModelType.array,  schemaName: ModelType.binary },
			signatures:				{ type: ModelType.array,  schemaName: ModelType.binary },
			presentOpinions:		{ type: ModelType.array,  schemaName: ModelType.uint8 },
			opinions:				{ type: ModelType.array,  schemaName: ModelType.uint64 },
		});

		builder.addTransactionSupport(EntityType.dataModificationCancel, {
			drive:					{ type: ModelType.binary, schemaName: 'dataModificationCancel.drive' },
			dataModificationId:		{ type: ModelType.binary, schemaName: 'dataModificationCancel.dataModificationId' },
		});

		builder.addTransactionSupport(EntityType.replicatorOnboarding, {
			publicKey: 				{ type: ModelType.binary, schemaName: 'replicatorOnboarding.publicKey' },
			capacity:				{ type: ModelType.uint64, schemaName: 'replicatorOnboarding.capacity' },
		});

		builder.addTransactionSupport(EntityType.replicatorOffboarding, {
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
			publicKeysCount:		{ type: ModelType.uint8, schemaName: 'dataModificationSingleApproval.publicKeysCount' },
			publicKeys:				{ type: ModelType.array, schemaName: ModelType.binary },
			opinions:				{ type: ModelType.array, schemaName: ModelType.uint64 },
		});

		builder.addTransactionSupport(EntityType.verificationPayment, {
			driveKey: 				{ type: ModelType.binary, schemaName: 'verificationPayment.driveKey' },
			verificationFeeAmount:	{ type: ModelType.uint64, schemaName: 'verificationPayment.verificationFeeAmount' },
		});

		builder.addTransactionSupport(EntityType.downloadApproval, {
			downloadChannelId: 						{ type: ModelType.binary, schemaName: 'downloadApproval.downloadChannelId' },
			sequenceNumber:							{ type: ModelType.uint16, schemaName: 'downloadApproval.sequenceNumber' },
			responseToFinishDownloadTransaction:	{ type: ModelType.uint8,  schemaName: 'downloadApproval.responseToFinishDownloadTransaction' },
			publicKeys:								{ type: ModelType.array,  schemaName: ModelType.binary },
			signatures:								{ type: ModelType.array,  schemaName: ModelType.binary },
			presentOpinions:						{ type: ModelType.array,  schemaName: ModelType.uint8 },
			opinions:								{ type: ModelType.array,  schemaName: ModelType.uint64 },
		});

		builder.addTransactionSupport(EntityType.driveClosure, {
			drive: 	{ type: ModelType.binary, schemaName: 'driveClosure.drive' },
		});

		builder.addTransactionSupport(EntityType.endDriveVerification, {
			drive:					{ type: ModelType.binary, schemaName: 'endDriveVerification.drive' },
			verificationTrigger:	{ type: ModelType.binary, schemaName: 'endDriveVerification.verificationTrigger' },
			provers:				{ type: ModelType.array, schemaName: ModelType.binary },
			verificationOpinions: 	{ type: ModelType.array, schemaName: 'endDriveVerification.verificationOpinions' },
		});

		builder.addSchema('endDriveVerification.verificationOpinions', {
			verifier:	ModelType.binary,
			signature:	ModelType.binary,
			results:	{ type: ModelType.array, schemaName: 'verificationOpinions' },
		});

		builder.addSchema('replicatorEntry', {
			replicator: { type: ModelType.object, schemaName: 'replicators' }
		});

		builder.addSchema('driveInfo', {
			drive: ModelType.binary,
			lastApprovedDataModificationId: ModelType.binary,
			dataModificationIdIsValid: ModelType.uint8,
			initialDownloadWork: ModelType.uint64,
		});

		builder.addSchema('replicators', {
			key:			ModelType.binary,
			version:		ModelType.uint32,
			capacity:		ModelType.uint64,
			drives: 		{ type: ModelType.array, schemaName: 'driveInfo' },
		});

		builder.addSchema('bcDriveEntry', {
			drive: { type: ModelType.object, schemaName: 'bcdrives' }
		});

		builder.addSchema('activeDataModification', {
			id: 				ModelType.binary,
			owner: 				ModelType.binary,
			downloadDataCdi:	ModelType.binary,
			expectedUploadSize: ModelType.uint64,
			actualUploadSize: 	ModelType.uint64,
			folderName: 		ModelType.string,
			readyForApproval: 	ModelType.bool,
		});

		builder.addSchema('completedDataModification', {
			id:					ModelType.binary,
			owner:				ModelType.binary,
			downloadDataCdi:	ModelType.binary,
			expectedUploadSize: ModelType.uint64,
			actualUploadSize: 	ModelType.uint64,
			folderName: 		ModelType.string,
			readyForApproval: 	ModelType.bool,
			state:				ModelType.uint8,
		});

		builder.addSchema('confirmedUsedSizes', {
			replicator: ModelType.binary,
			size: ModelType.uint64,
		});

		builder.addSchema('verificationOpinions', {
			prover: ModelType.binary,
			result: ModelType.uint8,
		});

		builder.addSchema('verifications', {
			verificationTrigger: ModelType.binary,
			state: ModelType.uint8,
			results: { type: ModelType.array, schemaName: 'verificationOpinions' },
		});

		builder.addSchema('bcdrives', {
			multisig:						ModelType.binary,
			multisigAddress:				ModelType.binary,
			owner:							ModelType.binary,
			rootHash:						ModelType.binary,
			size: 							ModelType.uint64,
			usedSize: 						ModelType.uint64,
			metaFilesSize:					ModelType.uint64,
			replicatorCount:				ModelType.uint16,
			ownerCumulativeUploadSize:      ModelType.uint64,
			activeDataModifications: 		{ type: ModelType.array, schemaName: 'activeDataModification' },
			completedDataModifications: 	{ type: ModelType.array, schemaName: 'completedDataModification' },
			confirmedUsedSizes:				{ type: ModelType.array, schemaName: 'confirmedUsedSizes' },
			replicators: 					{ type: ModelType.array, schemaName: ModelType.binary },
			verifications: 					{ type: ModelType.array, schemaName: 'verifications' },
		});

		builder.addSchema('downloadChannelEntry', {
			downloadChannelInfo: { type: ModelType.object, schemaName: 'downloadChannelInfo' }
		});

		builder.addSchema('cumulativePayments', {
			replicator:		ModelType.binary,
			payment:		ModelType.uint64,
		});

		builder.addSchema('downloadChannelInfo', {
			id:						ModelType.binary,
			consumer:				ModelType.binary,
			downloadSize:			ModelType.uint64,
			downloadApprovalCount:	ModelType.uint16,
			listOfPublicKeys: 		{ type: ModelType.array, schemaName: ModelType.binary },
			cumulativePayments: 	{ type: ModelType.array, schemaName: 'cumulativePayments' },
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
				transaction.metaFilesSize = parser.uint64();
				transaction.usedDriveSize = parser.uint64();
				transaction.judgingKeysCount = parser.uint8();
				transaction.overlappingKeysCount = parser.uint8();
				transaction.judgedKeysCount = parser.uint8();
				transaction.opinionElementCount = parser.uint8();

				transaction.publicKeys = []
				let count = transaction.judgingKeysCount + transaction.overlappingKeysCount + transaction.judgedKeysCount;
				while (count-- > 0) {
					transaction.publicKeys.push(parser.buffer(constants.sizes.signer));
				}

				transaction.signatures = [];
				const totalJudgingKeysCount = transaction.judgingKeysCount + transaction.overlappingKeysCount;
				count = totalJudgingKeysCount;
				while (count-- > 0) {
					transaction.signatures.push(parser.buffer(constants.sizes.signature));
				}
		
				transaction.presentOpinions = [];
				const totalJudgedKeysCount = transaction.overlappingKeysCount + transaction.judgedKeysCount;
				count = Math.floor((totalJudgingKeysCount * totalJudgedKeysCount + 7) / 8);
				while (count-- > 0) {
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
				serializer.writeBuffer(transaction.driveKey);
				serializer.writeBuffer(transaction.dataModificationId);
				serializer.writeBuffer(transaction.fileStructureCdi);
				serializer.writeUint64(transaction.fileStructureSize);
				serializer.writeUint64(transaction.metaFilesSize);
				serializer.writeUint64(transaction.usedDriveSize);
				serializer.writeUint8(transaction.judgingKeysCount);
				serializer.writeUint8(transaction.overlappingKeysCount);
				serializer.writeUint8(transaction.judgedKeysCount);
				serializer.writeUint8(transaction.opinionElementCount);
				let count = transaction.judgingKeysCount + transaction.overlappingKeysCount + transaction.judgedKeysCount;
				for (let i = 0; i < count; ++i) {
					serializer.writeBuffer(transaction.publicKeys[i]);
				}
				const totalJudgingKeysCount = transaction.judgingKeysCount + transaction.overlappingKeysCount;
				for (let i = 0; i < totalJudgingKeysCount; ++i) {
					serializer.writeBuffer(transaction.signatures[i]);
				}
				const totalJudgedKeysCount = transaction.overlappingKeysCount + transaction.judgedKeysCount;
				count = Math.floor((totalJudgingKeysCount * totalJudgedKeysCount + 7) / 8);
				for (let i = 0; i < count; ++i) {
					serializer.writeUint8(transaction.presentOpinions[i]);
				}
				for (let i = 0; i < transaction.opinionElementCount; ++i) {
					serializer.writeUint64(transaction.opinions[i]);
				}
			}
		});

		codecBuilder.addTransactionSupport(EntityType.dataModificationCancel, {
			deserialize: parser => {
				const transaction = {};
				transaction.drive = parser.buffer(constants.sizes.signer);
				transaction.dataModificationId = parser.buffer(constants.sizes.hash256);

				return transaction;
			},

			serialize: (transaction, serializer) => {
				serializer.writeBuffer(transaction.drive);
				serializer.writeBuffer(transaction.dataModificationId);
			}
		});

		codecBuilder.addTransactionSupport(EntityType.replicatorOnboarding, {
			deserialize: parser => {
				const transaction = {};
				transaction.publicKey = parser.buffer(constants.sizes.signer);
				transaction.capacity = parser.uint64();

				return transaction;
			},

			serialize: (transaction, serializer) => {
				serializer.writeBuffer(transaction.publicKey);
				serializer.writeUint64(transaction.capacity);
			}
		});

		codecBuilder.addTransactionSupport(EntityType.replicatorOffboarding, {
			deserialize: parser => {
				return {};
			},

			serialize: (transaction, serializer) => {
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
				transaction.publicKeyCount = parser.uint8();

				transaction.publicKeys = [];
				let count = transaction.publicKeyCount;
				while (count-- > 0) {
					transaction.publicKeys.push(parser.buffer(constants.sizes.signer));
				}

				transaction.opinions = [];
				count = transaction.publicKeyCount;
				while (count-- > 0) {
					transaction.opinions.push(parser.uint64());
				}

				return transaction;
			},

			serialize: (transaction, serializer) => {
				serializer.writeBuffer(transaction.driveKey);
				serializer.writeBuffer(transaction.dataModificationId);
				serializer.writeUint8(transaction.publicKeyCount);
				for (let i = 0; i < transaction.publicKeyCount; ++i) {
					serializer.writeBuffer(transaction.publicKeys[i]);
				}
				for (let i = 0; i < transaction.publicKeyCount; ++i) {
					serializer.writeUint64(transaction.opinions[i]);
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
				transaction.sequenceNumber = parser.uint16();
				transaction.responseToFinishDownloadTransaction = parser.uint8();
				transaction.judgingKeysCount = parser.uint8();
				transaction.overlappingKeysCount = parser.uint8();
				transaction.judgedKeysCount = parser.uint8();
				transaction.opinionElementCount = parser.uint8();

				transaction.publicKeys = [];
				let count = transaction.judgingKeysCount + transaction.overlappingKeysCount + transaction.judgedKeysCount;
				while (count-- > 0) {
					transaction.publicKeys.push(parser.buffer(constants.sizes.signer));
				}
				
				transaction.signatures = [];
				const totalJudgingKeysCount = transaction.judgingKeysCount + transaction.overlappingKeysCount;
				count = totalJudgingKeysCount;
				while (count-- > 0) {
					transaction.signatures.push(parser.buffer(constants.sizes.signature));
				}

				transaction.presentOpinions = [];
				const totalJudgedKeysCount = transaction.overlappingKeysCount + transaction.judgedKeysCount;
				count = Math.floor((totalJudgingKeysCount * totalJudgedKeysCount + 7) / 8);
				while (count-- > 0) {
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
				serializer.writeUint16(transaction.sequenceNumber);
				serializer.writeUint8(transaction.responseToFinishDownloadTransaction);
				serializer.writeUint8(transaction.judgingKeysCount);
				serializer.writeUint8(transaction.overlappingKeysCount);
				serializer.writeUint8(transaction.judgedKeysCount);
				serializer.writeUint8(transaction.opinionElementCount);
				let count = transaction.judgingKeysCount + transaction.overlappingKeysCount + transaction.judgedKeysCount;
				for (let i = 0; i < count; ++i) {
					serializer.writeBuffer(transaction.publicKeys[i]);
				}
				const totalJudgingKeysCount = transaction.judgingKeysCount + transaction.overlappingKeysCount;
				for (let i = 0; i < totalJudgingKeysCount; ++i) {
					serializer.writeBuffer(transaction.signatures[i]);
				}
				const totalJudgedKeysCount = transaction.overlappingKeysCount + transaction.judgedKeysCount;
				count = Math.floor((totalJudgingKeysCount * totalJudgedKeysCount + 7) / 8);
				for (let i = 0; i < count; ++i) {
					serializer.writeUint8(transaction.presentOpinions[i]);
				}
				for (let i = 0; i < transaction.opinionElementCount; ++i) {
					serializer.writeUint64(transaction.opinions[i]);
				}
			}
		});

		codecBuilder.addTransactionSupport(EntityType.driveClosure, {
			deserialize: parser => {
				const transaction = {};
				transaction.drive = parser.buffer(constants.sizes.signer);

				return transaction;
			},

			serialize: (transaction, serializer) => {
				serializer.writeBuffer(transaction.drive);
			}
		});

		codecBuilder.addTransactionSupport(EntityType.endDriveVerification, {
			deserialize: parser => {
				const transaction = {};
				transaction.drive = parser.buffer(constants.sizes.signer);
				transaction.verificationTrigger = parser.buffer(constants.sizes.hash256);
				transaction.proversCount = parser.uint16();
				transaction.verificationOpinionsCount = parser.uint16();

				transaction.provers = [];
				let count = transaction.proversCount;
				while (count-- > 0) {
					transaction.provers.push(parser.buffer(constants.sizes.signer));
				}

				transaction.verificationOpinions = [];
				count = transaction.verificationOpinionsCount;
				while (count-- > 0) {
					const verificationOpinion = {};
					verificationOpinion.verifier = parser.buffer(constants.sizes.signer),
					verificationOpinion.signature = parser.buffer(constants.sizes.signature),
					verificationOpinion.results = [];

					let pCount = transaction.proversCount - 1;
					while (pCount-- > 0) {
						verificationOpinion.results.push({
							prover: parser.buffer(constants.sizes.signer),
							result: parser.uint8(),
						});
					}

					transaction.verificationOpinions.push(verificationOpinion);
				}

				return transaction;
			},

			serialize: (transaction, serializer) => {
				serializer.writeBuffer(transaction.drive);
				serializer.writeBuffer(transaction.verificationTrigger);
				serializer.writeUint16(transaction.proversCount);
				serializer.writeUint16(transaction.verificationOpinionsCount);
				for (let i = 0; i < transaction.proversCount; ++i) {
					serializer.writeBuffer(transaction.provers[i]);
				}
				for (let i = 0; i < transaction.verificationOpinionsCount; ++i) {
					const verificationOpinion = transaction.verificationOpinions[i];
					serializer.writeBuffer(verificationOpinion.verifier);
					serializer.writeBuffer(verificationOpinion.signature);

					for (let j = 0; j < transaction.proversCount - 1; ++j) {
						const result = verificationOpinion.results[j];
						serializer.writeBuffer(result.prover);
						serializer.writeUint8(result.result)
					}
				}
			}
		});
	}
};

module.exports = storagePlugin;
