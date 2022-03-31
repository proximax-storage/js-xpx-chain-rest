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
			listOfPublicKeysSize:	{ type: ModelType.uint16, schemaName: 'download.listOfPublicKeysSize' },
			listOfPublicKeys:		{ type: ModelType.array,  schemaName: ModelType.binary },
		});

		builder.addTransactionSupport(EntityType.dataModificationApproval, {
			driveKey:				{ type: ModelType.binary, 	schemaName: 'dataModificationApproval.driveKey' },
			dataModificationId:		{ type: ModelType.binary, 	schemaName: 'dataModificationApproval.dataModificationId' },
			fileStructureCdi:		{ type: ModelType.binary, 	schemaName: 'dataModificationApproval.fileStructureCdi' },
			fileStructureSizeBytes:	{ type: ModelType.uint64, 	schemaName: 'dataModificationApproval.fileStructureSizeBytes' },
			metaFilesSizeBytes:		{ type: ModelType.uint64, 	schemaName: 'dataModificationApproval.metaFilesSizeBytes' },
			usedDriveSizeBytes:		{ type: ModelType.uint64, 	schemaName: 'dataModificationApproval.usedDriveSizeBytes' },
			// judgingKeysCount:		{ type: ModelType.uint8, 	schemaName: 'dataModificationApproval.judgingKeysCount' },
			// overlappingKeysCount:	{ type: ModelType.uint8, 	schemaName: 'dataModificationApproval.overlappingKeysCount' },
			// judgedKeysCount:		{ type: ModelType.uint8, 	schemaName: 'dataModificationApproval.judgedKeysCount' },
			// opinionElementCount:	{ type: ModelType.uint16, 	schemaName: 'dataModificationApproval.opinionElementCount' },
			// publicKeys:				{ type: ModelType.array,  	schemaName: ModelType.binary },
			// signatures:				{ type: ModelType.array,  	schemaName: ModelType.binary },
			// presentOpinions:		{ type: ModelType.array,  	schemaName: ModelType.uint8 },
			// opinions:				{ type: ModelType.array,  	schemaName: ModelType.uint64 },
		});

		builder.addTransactionSupport(EntityType.dataModificationCancel, {
			driveKey:				{ type: ModelType.binary, schemaName: 'dataModificationCancel.driveKey' },
			dataModificationId:		{ type: ModelType.binary, schemaName: 'dataModificationCancel.dataModificationId' },
		});

		builder.addTransactionSupport(EntityType.replicatorOnboarding, {
			capacity:				{ type: ModelType.uint64, schemaName: 'replicatorOnboarding.capacity' },
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
			driveKey:				{ type: ModelType.binary, 	schemaName: 'dataModificationSingleApproval.driveKey' },
			dataModificationId:		{ type: ModelType.binary, 	schemaName: 'dataModificationSingleApproval.dataModificationId' },
			publicKeysCount:		{ type: ModelType.uint8, 	schemaName: 'dataModificationSingleApproval.publicKeysCount' },
			publicKeys:				{ type: ModelType.array, 	schemaName: ModelType.binary },
			opinions:				{ type: ModelType.array, 	schemaName: ModelType.uint64 },
		});

		builder.addTransactionSupport(EntityType.verificationPayment, {
			driveKey: 				{ type: ModelType.binary, schemaName: 'verificationPayment.driveKey' },
			verificationFeeAmount:	{ type: ModelType.uint64, schemaName: 'verificationPayment.verificationFeeAmount' },
		});

		builder.addTransactionSupport(EntityType.downloadApproval, {
			downloadChannelId: 						{ type: ModelType.binary, schemaName: 'downloadApproval.downloadChannelId' },
			approvalTrigger: 						{ type: ModelType.binary, schemaName: 'downloadApproval.approvalTrigger' },
			judgingKeysCount:						{ type: ModelType.uint8,  schemaName: 'downloadApproval.judgingKeysCount' },
			overlappingKeysCount:					{ type: ModelType.uint8,  schemaName: 'downloadApproval.overlappingKeysCount' },
			judgedKeysCount:						{ type: ModelType.uint8,  schemaName: 'downloadApproval.judgedKeysCount' },
			opinionElementCount:					{ type: ModelType.uint16, schemaName: 'downloadApproval.opinionElementCount' },
			publicKeys:								{ type: ModelType.array,  schemaName: ModelType.binary },
			signatures:								{ type: ModelType.array,  schemaName: ModelType.binary },
			presentOpinions:						{ type: ModelType.array,  schemaName: ModelType.uint8 },
			opinions:								{ type: ModelType.array,  schemaName: ModelType.uint64 },
		});

		builder.addTransactionSupport(EntityType.driveClosure, {
			driveKey: 	{ type: ModelType.binary, schemaName: 'driveClosure.driveKey' },
		});

		builder.addTransactionSupport(EntityType.endDriveVerificationV2, {
			driveKey:               {type: ModelType.binary, 	schemaName: 'endDriveVerification.driveKey'},
			verificationTrigger:    {type: ModelType.binary, 	schemaName: 'endDriveVerification.verificationTrigger'},
			shardId:                {type: ModelType.uint16, 	schemaName: 'endDriveVerification.shardId'},
			keyCount:	            {type: ModelType.uint8, 	schemaName: 'endDriveVerification.keyCount'},
			judgingKeyCount:	    {type: ModelType.uint8,    	schemaName: 'endDriveVerification.judgingKeyCount'},
			publicKeys:				{ type: ModelType.array,  	schemaName: ModelType.binary },
			signatures:				{ type: ModelType.array,  	schemaName: ModelType.binary },
			opinions:				{ type: ModelType.array,  	schemaName: ModelType.uint8 },
		});

		builder.addSchema('driveInfo', {
			drive: 									ModelType.binary,
			lastApprovedDataModificationId: 		ModelType.binary,
			dataModificationIdIsValid: 				ModelType.boolean,
			initialDownloadWork: 					ModelType.uint64,
			lastCompletedCumulativeDownloadWork: 	ModelType.uint64,
		});

		builder.addSchema('replicatorEntry', {
			replicator: { type: ModelType.object, schemaName: 'replicator' }
		});

		builder.addSchema('replicator', {
			key:			ModelType.binary,
			version:		ModelType.uint32,
			capacity:		ModelType.uint64,
			drives: 		{ type: ModelType.array, schemaName: 'driveInfo' },
		});

		builder.addSchema('downloadChannelEntry', {
			downloadChannelInfo: { type: ModelType.object, schemaName: 'downloadChannelInfo' }
		});

		builder.addSchema('cumulativePayments', {
			replicator:		ModelType.binary,
			payment:		ModelType.uint64,
		});

		builder.addSchema('downloadChannelInfo', {
			id:							ModelType.binary,
			consumer:					ModelType.binary,
			drive:						ModelType.binary,
			downloadSize:				ModelType.uint64,
			downloadApprovalCountLeft:	ModelType.uint16,
			listOfPublicKeys: 		{ type: ModelType.array, schemaName: ModelType.binary },
			shardReplicators: 		{ type: ModelType.array, schemaName: ModelType.binary },
			cumulativePayments: 	{ type: ModelType.array, schemaName: 'cumulativePayments' },
		});

		builder.addSchema('bcDriveEntry', {
			drive: { type: ModelType.object, schemaName: 'bcDrive' }
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

		builder.addSchema('shard', {
			id:				ModelType.uint32,
			replicators:	{ type: ModelType.array, schemaName: ModelType.binary },
		});

		builder.addSchema('verification', {
			verificationTrigger:	ModelType.binary,
			expiration:				ModelType.uint64,
			expired:				ModelType.boolean,
			shards:					{ type: ModelType.array, schemaName: 'shard' },
		});

		builder.addSchema('downloadShard', {
			downloadChannelId:	ModelType.binary,
		});

		builder.addSchema('uploadInfo', {
			key:		ModelType.binary,
			uploadSize:	ModelType.uint64,
		});

		builder.addSchema('dataModificationShard', {
			replicator:				ModelType.binary,
			actualShardReplicators: { type: ModelType.array, schemaName: 'uploadInfo' },
			formerShardReplicators: { type: ModelType.array, schemaName: 'uploadInfo' },
			ownerUpload:			ModelType.uint64,
		});

		builder.addSchema('bcDrive', {
			multisig:					ModelType.binary,
			multisigAddress:			ModelType.binary,
			owner:						ModelType.binary,
			rootHash:					ModelType.binary,
			size:						ModelType.uint64,
			usedSizeBytes:				ModelType.uint64,
			metaFilesSizeBytes:			ModelType.uint64,
			replicatorCount:			ModelType.uint16,
			activeDataModifications: 	{ type: ModelType.array, schemaName: 'activeDataModification' },
			completedDataModifications: { type: ModelType.array, schemaName: 'completedDataModification' },
			confirmedUsedSizes: 		{ type: ModelType.array, schemaName: 'confirmedUsedSize' },
			replicators: 				{ type: ModelType.array, schemaName: ModelType.binary },
			offboardingReplicators: 	{ type: ModelType.array, schemaName: ModelType.binary },
			verifications: 				{ type: ModelType.array, schemaName: 'verification' },
			downloadShards:				{ type: ModelType.array, schemaName: 'downloadShard' },
			dataModificationShards:		{ type: ModelType.array, schemaName: 'dataModificationShard' },
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
				transaction.listOfPublicKeysSize = parser.uint16();

				transaction.listOfPublicKeys = [];
				let count = transaction.listOfPublicKeysSize;
				while (count-- > 0) {
					transaction.listOfPublicKeys.push(parser.buffer(constants.sizes.signer));
				}

				return transaction;
			},

			serialize: (transaction, serializer) => {
				serializer.writeBuffer(transaction.driveKey);
				serializer.writeUint64(transaction.downloadSize);
				serializer.writeUint64(transaction.feedbackFeeAmount);
				serializer.writeUint16(transaction.listOfPublicKeys.length);

				transaction.listOfPublicKeys.forEach(key => {
					serializer.writeBuffer(key);
				});
			}
		});

		codecBuilder.addTransactionSupport(EntityType.dataModificationApproval, {
			deserialize: parser => {
				const transaction = {};
				transaction.driveKey = parser.buffer(constants.sizes.signer);
				transaction.dataModificationId = parser.buffer(constants.sizes.hash256);
				transaction.fileStructureCdi = parser.buffer(constants.sizes.hash256);
				transaction.fileStructureSizeBytes = parser.uint64();
				transaction.metaFilesSizeBytes = parser.uint64();
				transaction.usedDriveSizeBytes = parser.uint64();
				// transaction.judgingKeysCount = parser.uint8();
				// transaction.overlappingKeysCount = parser.uint8();
				// transaction.judgedKeysCount = parser.uint8();
				// transaction.opinionElementCount = parser.uint16();

				// transaction.publicKeys = []
				// let count = transaction.judgingKeysCount + transaction.overlappingKeysCount + transaction.judgedKeysCount;
				// while (count-- > 0) {
				// 	transaction.publicKeys.push(parser.buffer(constants.sizes.signer));
				// }
				//
				// transaction.signatures = [];
				// const totalJudgingKeysCount = transaction.judgingKeysCount + transaction.overlappingKeysCount;
				// count = totalJudgingKeysCount;
				// while (count-- > 0) {
				// 	transaction.signatures.push(parser.buffer(constants.sizes.signature));
				// }
				//
				// transaction.presentOpinions = [];
				// const totalJudgedKeysCount = transaction.overlappingKeysCount + transaction.judgedKeysCount;
				// count = Math.floor((totalJudgingKeysCount * totalJudgedKeysCount + 7) / 8);
				// while (count-- > 0) {
				// 	transaction.presentOpinions.push(parser.uint8());
				// }
				//
				// transaction.opinions = [];
				// count = transaction.opinionElementCount;
				// while (count-- > 0) {
				// 	transaction.opinions.push(parser.uint64());
				// }

				return transaction;
			},

			serialize: (transaction, serializer) => {
				serializer.writeBuffer(transaction.driveKey);
				serializer.writeBuffer(transaction.dataModificationId);
				serializer.writeBuffer(transaction.fileStructureCdi);
				serializer.writeUint64(transaction.fileStructureSizeBytes);
				serializer.writeUint64(transaction.metaFilesSizeBytes);
				serializer.writeUint64(transaction.usedDriveSizeBytes);
				// serializer.writeUint8(transaction.judgingKeysCount);
				// serializer.writeUint8(transaction.overlappingKeysCount);
				// serializer.writeUint8(transaction.judgedKeysCount);
				// serializer.writeUint16(transaction.opinionElementCount);
				//
				// transaction.publicKeys.forEach(key => {
				// 	serializer.writeBuffer(key);
				// });
				//
				// transaction.signatures.forEach(signature => {
				// 	serializer.writeBuffer(signature);
				// })
				//
				// transaction.presentOpinions.forEach(presentOpinion => {
				// 	serializer.writeUint8(presentOpinion);
				// })
				//
				// transaction.opinions.forEach(opinion => {
				// 	serializer.writeUint64(opinion);
				// })
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

				return transaction;
			},

			serialize: (transaction, serializer) => {
				serializer.writeUint64(transaction.capacity);
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
				transaction.approvalTrigger = parser.buffer(constants.sizes.hash256);
				transaction.judgingKeysCount = parser.uint8();
				transaction.overlappingKeysCount = parser.uint8();
				transaction.judgedKeysCount = parser.uint8();
				transaction.opinionElementCount = parser.uint16();

				transaction.publicKeys = [];
				let count = transaction.judgingKeysCount + transaction.overlappingKeysCount + transaction.judgedKeysCount;
				while (count-- > 0) {
					transaction.publicKeys.push(parser.buffer(constants.sizes.signer));
				}

				transaction.signatures = [];
				const totalJudgingCount = transaction.judgingKeysCount + transaction.overlappingKeysCount;
				count = totalJudgingCount;
				while (count-- > 0) {
					transaction.signatures.push(parser.buffer(constants.sizes.signature));
				}

				transaction.presentOpinions = [];
				const totalJudgedCount = transaction.overlappingKeysCount + transaction.judgingKeysCount;
				count = Math.floor((totalJudgingCount * totalJudgedCount + 7) / 8);
				for (let i = 0; i < count; ++i) {
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
				serializer.writeUint8(transaction.judgingKeysCount);
				serializer.writeUint8(transaction.overlappingKeysCount);
				serializer.writeUint8(transaction.judgedKeysCount);
				serializer.writeUint16(transaction.opinionElementCount);

				transaction.publicKeys.forEach(key => {
					serializer.writeBuffer(key);
				});

				transaction.signatures.forEach(signature => {
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

        codecBuilder.addTransactionSupport(EntityType.endDriveVerificationV2, {
            deserialize: parser => {
                const transaction = {};
                transaction.driveKey = parser.buffer(constants.sizes.signer);
                transaction.verificationTrigger = parser.buffer(constants.sizes.hash256);
                transaction.shardId = parser.uint16();
				transaction.keyCount = parser.uint8();
				transaction.judgingKeyCount = parser.uint8();
				transaction.publicKeys = [];
				transaction.signatures = [];
				transaction.opinions = [];

				let count = transaction.keyCount;
				while (count--) {
					transaction.publicKeys.push(parser.buffer(constants.sizes.signer));
				}

				count = transaction.judgingKeyCount;
				while (count--) {
					transaction.signatures.push(parser.buffer(constants.sizes.signature));
				}

				count = Math.floor((transaction.judgingKeyCount * transaction.keyCount + 7) / 8);
				while (count--) {
					transaction.opinions.push(parser.uint8());
				}

                return transaction;
            },

            serialize: (transaction, serializer) => {
                serializer.writeBuffer(transaction.driveKey);
                serializer.writeBuffer(transaction.verificationTrigger);
				serializer.writeUint16(transaction.shardId);

				serializer.writeUint8(transaction.publicKeys.length);
				serializer.writeUint8(transaction.signatures.length);

				transaction.publicKeys.forEach(key => {
					serializer.writeBuffer(key);
				})

				transaction.signatures.forEach(signature => {
					serializer.writeBuffer(signature);
				})

				const len = Math.floor((transaction.signatures.length * transaction.publicKeys.length + 7) / 8);
				for (let i = 0; i < len; ++i) {
					serializer.writeUint8(transaction.opinions[i]);
				}
            }
        });
	}
};

module.exports = storagePlugin;
