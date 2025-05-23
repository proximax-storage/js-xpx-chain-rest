/**
 *** Copyright 2021 ProximaX Limited. All rights reserved.
 *** Use of this source code is governed by the Apache 2.0
 *** license that can be found in the LICENSE file.
 * */

const EntityType = require('../../src/model/EntityType');
const ModelSchemaBuilder = require('../../src/model/ModelSchemaBuilder');
const test = require('../binaryTestUtils');
const { expect } = require('chai');

const storagePlugin = require('../../src/plugins/storage');

describe('storage plugin', () => {
	describe('register schema', () => {
		it('adds storage system schema', () => {
			// Arrange:
			const builder = new ModelSchemaBuilder();
			const numDefaultKeys = Object.keys(builder.build()).length;

			// Act:
			storagePlugin.registerSchema(builder);
			const modelSchema = builder.build();

			// Assert:
			expect(Object.keys(modelSchema).length).to.equal(numDefaultKeys + 34);
			expect(modelSchema).to.contain.all.keys([
				'prepareBcDrive',
				'dataModification',
				'download',
				'dataModificationApproval',
				'dataModificationCancel',
				'replicatorOnboarding',
				'replicatorOffboarding',
				'finishDownload',
				'downloadPayment',
				'storagePayment',
				'dataModificationSingleApproval',
				'verificationPayment',
				'downloadApproval',
				'driveClosure',
				'replicatorEntry',
				'replicator',
				'driveInfo',
				'downloadChannelEntry',
				'cumulativePayments',
				'downloadChannelInfo',
				'bcDriveEntry',
				'bcDrive',
				'activeDataModification',
				'completedDataModification',
				'confirmedUsedSize',
				'verification',
				'shard',
				'endDriveVerificationV2',
				'replicatorsCleanup',
				'bootKeyReplicatorEntry',
				'replicatorTreeRebuild',
			]);

			expect(Object.keys(modelSchema.prepareBcDrive).length).to.equal(Object.keys(modelSchema.transaction).length + 3);
			expect(modelSchema.prepareBcDrive).to.contain.all.keys([
				'driveSize',
				'verificationFeeAmount',
				'replicatorCount',
			]);

			expect(Object.keys(modelSchema.dataModification).length).to.equal(Object.keys(modelSchema.transaction).length + 4);
			expect(modelSchema.dataModification).to.contain.all.keys([
				'driveKey',
				'downloadDataCdi',
				'uploadSize',
				'feedbackFeeAmount',
			]);

			expect(Object.keys(modelSchema.download).length).to.equal(Object.keys(modelSchema.transaction).length + 4);
			expect(modelSchema.download).to.contain.all.keys([
				'driveKey',
				'downloadSize',
				'feedbackFeeAmount',
				'listOfPublicKeys',
			]);

			expect(Object.keys(modelSchema.dataModificationApproval).length).to.equal(Object.keys(modelSchema.transaction).length + 14);
			expect(modelSchema.dataModificationApproval).to.contain.all.keys([
				'driveKey',
				'dataModificationId',
				'fileStructureCdi',
				'modificationStatus',
				'fileStructureSizeBytes',
				'metaFilesSizeBytes',
				'usedDriveSizeBytes',
				'judgingKeysCount',
				'overlappingKeysCount',
				'judgedKeysCount',
				'publicKeys',
				'signatures',
				'presentOpinions',
				'opinions',
			]);

			expect(Object.keys(modelSchema.dataModificationCancel).length).to.equal(Object.keys(modelSchema.transaction).length + 2);
			expect(modelSchema.dataModificationCancel).to.contain.all.keys([
				'driveKey',
				'dataModificationId',
			]);

			expect(Object.keys(modelSchema.replicatorOnboarding).length).to.equal(Object.keys(modelSchema.transaction).length + 5);
			expect(modelSchema.replicatorOnboarding).to.contain.all.keys([
				'publicKey',
				'capacity',
				'nodeBootKey',
				'message',
				'messageSignature',
			]);

			expect(Object.keys(modelSchema.replicatorOffboarding).length).to.equal(Object.keys(modelSchema.transaction).length + 1);
			expect(modelSchema.replicatorOffboarding).to.contain.all.keys([
				'driveKey',
			]);

			expect(Object.keys(modelSchema.finishDownload).length).to.equal(Object.keys(modelSchema.transaction).length + 2);
			expect(modelSchema.finishDownload).to.contain.all.keys([
				'downloadChannelId',
				'feedbackFeeAmount',
			]);

			expect(Object.keys(modelSchema.downloadPayment).length).to.equal(Object.keys(modelSchema.transaction).length + 3);
			expect(modelSchema.downloadPayment).to.contain.all.keys([
				'downloadChannelId',
				'downloadSize',
				'feedbackFeeAmount',
			]);

			expect(Object.keys(modelSchema.storagePayment).length).to.equal(Object.keys(modelSchema.transaction).length + 2);
			expect(modelSchema.storagePayment).to.contain.all.keys([
				'driveKey',
				'storageUnits',
			]);

			expect(Object.keys(modelSchema.dataModificationSingleApproval).length).to.equal(Object.keys(modelSchema.transaction).length + 5);
			expect(modelSchema.dataModificationSingleApproval).to.contain.all.keys([
				'driveKey',
				'dataModificationId',
				'publicKeysCount',
				'publicKeys',
				'opinions',
			]);

			expect(Object.keys(modelSchema.verificationPayment).length).to.equal(Object.keys(modelSchema.transaction).length + 2);
			expect(modelSchema.verificationPayment).to.contain.all.keys([
				'driveKey',
				'verificationFeeAmount',
			]);

			expect(Object.keys(modelSchema.downloadApproval).length).to.equal(Object.keys(modelSchema.transaction).length + 9);
			expect(modelSchema.downloadApproval).to.contain.all.keys([
				'downloadChannelId',
				'approvalTrigger',
				'judgingKeysCount',
				'overlappingKeysCount',
				'judgedKeysCount',
				'publicKeys',
				'signatures',
				'presentOpinions',
				'opinions',
			]);

			expect(Object.keys(modelSchema.driveClosure).length).to.equal(Object.keys(modelSchema.transaction).length + 1);
			expect(modelSchema.driveClosure).to.contain.all.keys([
				'driveKey',
			]);

			expect(Object.keys(modelSchema.replicatorsCleanup).length).to.equal(Object.keys(modelSchema.transaction).length + 1);
			expect(modelSchema.replicatorsCleanup).to.contain.all.keys([
				'replicatorKeys',
			]);

			expect(Object.keys(modelSchema.replicatorTreeRebuild).length).to.equal(Object.keys(modelSchema.transaction).length + 1);
			expect(modelSchema.replicatorTreeRebuild).to.contain.all.keys([
				'replicatorKeys',
			]);

			expect(Object.keys(modelSchema['bootKeyReplicatorEntry']).length).to.equal(2);
			expect(modelSchema['bootKeyReplicatorEntry']).to.contain.all.keys(['nodeBootKey', 'replicatorKey']);

			expect(Object.keys(modelSchema['replicatorEntry']).length).to.equal(1);
			expect(modelSchema['replicatorEntry']).to.contain.all.keys(['replicator']);

			expect(Object.keys(modelSchema['replicator']).length).to.equal(5);
			expect(modelSchema['replicator']).to.contain.all.keys([
				'key',
				'version',
				'nodeBootKey',
				// 'capacity',
				'drives',
				'downloadChannels'
			]);

			expect(Object.keys(modelSchema['driveInfo']).length).to.equal(4);
			expect(modelSchema['driveInfo']).to.contain.all.keys([
				'drive',
				'lastApprovedDataModificationId',
				'initialDownloadWork',
				'lastCompletedCumulativeDownloadWork'
			]);

			// expect(Object.keys(modelSchema['downloadChannelEntry']).length).to.equal(1);
			// expect(modelSchema['downloadChannelEntry']).to.contain.all.keys(['downloadChannelInfo']);

			expect(Object.keys(modelSchema['cumulativePayments']).length).to.equal(2);
			expect(modelSchema['cumulativePayments']).to.contain.all.keys([
				'replicator',
				'payment'
			]);

			expect(Object.keys(modelSchema['downloadChannelInfo']).length).to.equal(9);
			expect(modelSchema['downloadChannelInfo']).to.contain.all.keys([
				'id',
				'consumer',
				'drive',
				'downloadSizeMegabytes',
				'downloadApprovalCount',
				'finished',
				'listOfPublicKeys',
				'shardReplicators',
				'cumulativePayments'
			]);

			expect(Object.keys(modelSchema['bcDriveEntry']).length).to.equal(1);
			expect(modelSchema['bcDriveEntry']).to.contain.all.keys(['drive']);

			expect(Object.keys(modelSchema['bcDrive']).length).to.equal(16);
			expect(modelSchema['bcDrive']).to.contain.all.keys([
				'multisig',
				'multisigAddress',
				'owner',
				'rootHash',
				'size',
				'usedSizeBytes',
				'metaFilesSizeBytes',
				'replicatorCount',
				'activeDataModifications',
				'completedDataModifications',
				'confirmedUsedSizes',
				'replicators',
				'offboardingReplicators',
				'verification',
				'downloadShards',
				'dataModificationShards'
			]);

			expect(Object.keys(modelSchema['activeDataModification']).length).to.equal(8);
			expect(modelSchema['activeDataModification']).to.contain.all.keys([
				'id',
				'owner',
				'downloadDataCdi',
				'expectedUploadSize',
				'actualUploadSize',
				'folderName',
				'readyForApproval',
				'isStream'
			]);

			expect(Object.keys(modelSchema['completedDataModification']).length).to.equal(9);
			expect(modelSchema['completedDataModification']).to.contain.all.keys([
				'id',
				'owner',
				'downloadDataCdi',
				'expectedUploadSize',
				'actualUploadSize',
				'folderName',
				'readyForApproval',
				'state',
				'success'
			]);

			expect(Object.keys(modelSchema['confirmedUsedSize']).length).to.equal(2);
			expect(modelSchema['confirmedUsedSize']).to.contain.all.keys([
				'replicator',
				'size'
			]);

			expect(Object.keys(modelSchema['verification']).length).to.equal(4);
			expect(modelSchema['verification']).to.contain.all.keys([
				'verificationTrigger',
				'expiration',
				'duration',
				'shards'
			]);

			expect(Object.keys(modelSchema['shard']).length).to.equal(2);
			expect(modelSchema['shard']).to.contain.all.keys([
				'id',
				'replicators'
			]);

			expect(Object.keys(modelSchema.endDriveVerificationV2).length).to.equal(Object.keys(modelSchema.transaction).length + 6);
			expect(modelSchema.endDriveVerificationV2).to.contain.all.keys([
				'driveKey',
				'verificationTrigger',
				'shardId',
				'publicKeys',
				'signatures',
				'opinions',
			]);
		});
	});

	describe('register codecs', () => {
		const getCodecs = () => {
			const codecs = {};
			storagePlugin.registerCodecs({
				addTransactionSupport: (type, codec) => { codecs[type] = codec; }
			});

			return codecs;
		};

		it('adds storage codecs', () => {
			// Act:
			const codecs = getCodecs();

			// Assert: codec was registered
			expect(Object.keys(codecs).length).to.equal(17);
			expect(codecs).to.contain.all.keys([
				EntityType.prepareBcDrive.toString(),
				EntityType.dataModification.toString(),
				EntityType.download.toString(),
				EntityType.dataModificationApproval.toString(),
				EntityType.dataModificationCancel.toString(),
				EntityType.replicatorOnboarding.toString(),
				EntityType.replicatorOffboarding.toString(),
				EntityType.finishDownload.toString(),
				EntityType.downloadPayment.toString(),
				EntityType.storagePayment.toString(),
				EntityType.dataModificationSingleApproval.toString(),
				EntityType.verificationPayment.toString(),
				EntityType.downloadApproval.toString(),
				EntityType.driveClosure.toString(),
				EntityType.endDriveVerificationV2.toString(),
				EntityType.replicatorsCleanup.toString(),
				EntityType.replicatorTreeRebuild.toString(),
			]);
		});

		describe('supports prepare drive transaction', () => {
			const codec = getCodecs()[EntityType.prepareBcDrive];
			const driveSize = Buffer.of(0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00);
			const verificationFeeAmount = Buffer.of(0x02, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00);
			const replicatorCount = Buffer.of(0x03, 0x00);

			test.binary.test.addAll(codec, 2 * 8 + 2, () => ({
				buffer: Buffer.concat([
					driveSize,
					verificationFeeAmount,
					replicatorCount,
				]),
				object: {
					driveSize: [0x01, 0x0],
					verificationFeeAmount: [0x02, 0x0],
					replicatorCount: 0x03,
				}
			}));
		});

		const createByteArray = (number, size = 32) => {
			const hash = new Uint8Array(size);
			hash[0] = number;

			return hash;
		};

		describe('supports data modification transaction', () => {
			const codec = getCodecs()[EntityType.dataModification];
			const driveKey = createByteArray(0x01);
			const downloadDataCdi = createByteArray(0x02);
			const uploadSize = Buffer.of(0x03, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00);
			const feedbackFeeAmount = Buffer.of(0x04, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00);

			test.binary.test.addAll(codec, 2 * 32 + 2 * 8, () => ({
				buffer: Buffer.concat([
					driveKey,
					downloadDataCdi,
					uploadSize,
					feedbackFeeAmount,
				]),
				object: {
					driveKey,
					downloadDataCdi,
					uploadSize: [0x03, 0x0],
					feedbackFeeAmount: [0x04, 0x0],
				}
			}));
		});

		describe('supports download transaction', () => {
			const codec = getCodecs()[EntityType.download];
			const driveKey = createByteArray(0x01);
			const downloadSize = Buffer.of(0x02, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00);
			const feedbackFeeAmount = Buffer.of(0x03, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00);
			const listOfPublicKeysSize = Buffer.of(0x04, 0x00);
			const key1 = createByteArray(0x05, 32);
			const key2 = createByteArray(0x06, 32);
			const key3 = createByteArray(0x07, 32);
			const key4 = createByteArray(0x08, 32);

			test.binary.test.addAll(codec, 32 + 2 * 8 + 2 + 4 * 32, () => ({
				buffer: Buffer.concat([
					driveKey,
					downloadSize,
					feedbackFeeAmount,
					listOfPublicKeysSize,
					key1,
					key2,
					key3,
					key4,
				]),
				object: {
					driveKey,
					downloadSize: [0x02, 0x00],
					feedbackFeeAmount: [0x03, 0x00],
					listOfPublicKeysSize: 0x04,
					listOfPublicKeys: [ key1, key2, key3, key4 ],
				}
			}));
		});

		describe('supports data modification approval transaction', () => {
			const codec = getCodecs()[EntityType.dataModificationApproval];
			const driveKey = createByteArray(0x01);
			const dataModificationId = createByteArray(0x02);
			const fileStructureCdi = createByteArray(0x03);
			const modificationStatus = Buffer.of(0x05);
			const fileStructureSizeBytes = Buffer.of(0x04, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00);
			const metaFilesSizeBytes = Buffer.of(0x05, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00);
			const usedDriveSizeBytes = Buffer.of(0x06, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00);
			const judgingKeysCount = Buffer.of(0x02);
			const overlappingKeysCount = Buffer.of(0x00);
			const judgedKeysCount = Buffer.of(0x01);
			const opinionElementCount = Buffer.of(0x03, 0x00);
			const publicKey1 = createByteArray(0x0B);
			const publicKey2 = createByteArray(0x0C);
			const publicKey3 = createByteArray(0x0D);
			const signature1 = createByteArray(0x0E, 64);
			const signature2 = createByteArray(0x0F, 64);
			const presentOpinions = Buffer.of(0x11);
			const opinions = Buffer.of(
				0x12, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0,
				0x13, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0,
				0x14, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0,
			);


			test.binary.test.addAll(codec, 3 * 32 + 1 + 3 * 8 + 5 + 3 * 32 + 2 * 64 + 1 + 3 * 8, () => ({
				buffer: Buffer.concat([
					driveKey,
					dataModificationId,
					fileStructureCdi,
					modificationStatus,
					fileStructureSizeBytes,
					metaFilesSizeBytes,
					usedDriveSizeBytes,
					judgingKeysCount,
					overlappingKeysCount,
					judgedKeysCount,
					opinionElementCount,
					publicKey1,
					publicKey2,
					publicKey3,
					signature1,
					signature2,
					presentOpinions,
					opinions,
				]),
				object: {
					driveKey,
					dataModificationId,
					fileStructureCdi,
					modificationStatus: 0x05,
					fileStructureSizeBytes: [ 0x04, 0x0 ],
					metaFilesSizeBytes: [ 0x05, 0x0 ],
					usedDriveSizeBytes: [ 0x06, 0x0 ],
					judgingKeysCount: 0x02,
					overlappingKeysCount: 0x00,
					judgedKeysCount: 0x01,
					opinionElementCount: 0x03,
					publicKeys: [ publicKey1, publicKey2, publicKey3 ],
					signatures: [ signature1, signature2 ],
					presentOpinions: [ 0x11 ],
					opinions: [ [ 0x12, 0x0 ], [ 0x13, 0x0 ] , [ 0x14, 0x0 ] ],
				}
			}));
		});

		describe('supports data modification cancel transaction', () => {
			const codec = getCodecs()[EntityType.dataModificationCancel];
			const driveKey = createByteArray(0x01);
			const dataModificationId = createByteArray(0x02);

			test.binary.test.addAll(codec, 2 * 32, () => ({
				buffer: Buffer.concat([
					driveKey,
					dataModificationId,
				]),
				object: {
					driveKey,
					dataModificationId,
				}
			}));
		});

		describe('supports replicator onboarding transaction', () => {
			const codec = getCodecs()[EntityType.replicatorOnboarding];
			const capacity = Buffer.of(0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00);
			const nodeBootKey = createByteArray(0x01);
			const message = createByteArray(0x01);
			const messageSignature = createByteArray(0x01, 64);

			test.binary.test.addAll(codec, 136, () => ({
				buffer: Buffer.concat([
					capacity,
					nodeBootKey,
					message,
					messageSignature,
				]),
				object: {
					capacity: [0x01, 0x0],
					nodeBootKey,
					message,
					messageSignature,
				}
			}));
		});

		describe('supports replicator offboarding transaction', () => {
			const codec = getCodecs()[EntityType.replicatorOffboarding];
			const driveKey = createByteArray(0x01);

			test.binary.test.addAll(codec, 32, () => ({
				buffer: Buffer.concat([
					driveKey,
				]),
				object: {
					driveKey,
				},
			}));
		});

		describe('supports finish download transaction', () => {
			const codec = getCodecs()[EntityType.finishDownload];
			const downloadChannelId = createByteArray(0x01);
			const feedbackFeeAmount = Buffer.of(0x02, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00);

			test.binary.test.addAll(codec, 32 + 8, () => ({
				buffer: Buffer.concat([
					downloadChannelId,
					feedbackFeeAmount,
				]),
				object: {
					downloadChannelId,
					feedbackFeeAmount: [0x02, 0x0],
				}
			}));
		});

		describe('supports download payment transaction', () => {
			const codec = getCodecs()[EntityType.downloadPayment];
			const downloadChannelId = createByteArray(0x01);
			const downloadSize = Buffer.of(0x02, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00);
			const feedbackFeeAmount = Buffer.of(0x03, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00);

			test.binary.test.addAll(codec, 32 + 2 * 8, () => ({
				buffer: Buffer.concat([
					downloadChannelId,
					downloadSize,
					feedbackFeeAmount,
				]),
				object: {
					downloadChannelId,
					downloadSize: [0x02, 0x0],
					feedbackFeeAmount: [0x03, 0x0],
				}
			}));
		});

		describe('supports storage payment transaction', () => {
			const codec = getCodecs()[EntityType.storagePayment];
			const driveKey = createByteArray(0x01);
			const storageUnits = Buffer.of(0x02, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00);

			test.binary.test.addAll(codec, 32 + 8, () => ({
				buffer: Buffer.concat([
					driveKey,
					storageUnits,
				]),
				object: {
					driveKey,
					storageUnits: [0x02, 0x0],
				}
			}));
		});

		describe('supports data modification single approval transaction', () => {
			const codec = getCodecs()[EntityType.dataModificationSingleApproval];
			const driveKey = createByteArray(0x01);
			const dataModificationId = createByteArray(0x02);
			const publicKeyCount = Buffer.of(0x03);
			const key1 = createByteArray(0x05);
			const key2 = createByteArray(0x06);
			const key3 = createByteArray(0x07);
			const opinions = Buffer.of(
				0x08, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0,
				0x09, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0,
				0x0A, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0,
			);

			test.binary.test.addAll(codec, 2 * 32 + 1 + 3 * 32 + 3 * 8, () => ({
				buffer: Buffer.concat([
					driveKey,
					dataModificationId,
					publicKeyCount,
					key1,
					key2,
					key3,
					opinions,
				]),
				object: {
					driveKey,
					dataModificationId,
					publicKeyCount: 0x03,
					publicKeys: [ key1, key2, key3 ],
					opinions: [ [ 0x08, 0x0 ], [ 0x09, 0x0 ], [ 0x0A, 0x0 ] ],
				}
			}));
		});

		describe('supports verification payment transaction', () => {
			const codec = getCodecs()[EntityType.verificationPayment];
			const driveKey = createByteArray(0x01);
			const verificationFeeAmount = Buffer.of(0x02, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00);

			test.binary.test.addAll(codec, 32 + 8, () => ({
				buffer: Buffer.concat([
					driveKey,
					verificationFeeAmount,
				]),
				object: {
					driveKey,
					verificationFeeAmount: [0x02, 0x0],
				}
			}));
		});

		describe('supports download approval transaction', () => {
			const codec = getCodecs()[EntityType.downloadApproval];
			const downloadChannelId = createByteArray(0x01);
			const approvalTrigger = createByteArray(0x02);
			const judgingKeysCount = Buffer.of(0x01);
			const overlappingKeysCount = Buffer.of(0x02);
			const judgedKeysCount = Buffer.of(0x01);
			const opinionElementCount = Buffer.of(0x04, 0x00);
			const key1 = createByteArray(0x08);
			const key2 = createByteArray(0x09);
			const key3 = createByteArray(0x0A);
			const key4 = createByteArray(0x0B);
			const signature1 = createByteArray(0x0C, 64);
			const signature2 = createByteArray(0x0D, 64);
			const signature3 = createByteArray(0x0E, 64);
			const presentOpinions = Buffer.of(0x0F, 0x10);
			const opinions = Buffer.of(
				0x11, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0,
				0x12, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0,
				0x13, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0,
				0x14, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0,
			);

			test.binary.test.addAll(codec, 2 * 32 + 5 + 4 * 32 + 3 * 64 + 2 + 4 * 8, () => ({
				buffer: Buffer.concat([
					downloadChannelId,
					approvalTrigger,
					judgingKeysCount,
					overlappingKeysCount,
					judgedKeysCount,
					opinionElementCount,
					key1,
					key2,
					key3,
					key4,
					signature1,
					signature2,
					signature3,
					presentOpinions,
					opinions,
				]),
				object: {
					downloadChannelId,
					approvalTrigger,
					judgingKeysCount: 0x01,
					overlappingKeysCount: 0x02,
					judgedKeysCount: 0x01,
					opinionElementCount: 0x04,
					publicKeys: [ key1, key2, key3, key4 ],
					signatures: [ signature1, signature2, signature3 ],
					presentOpinions: [ 0x0F, 0x10 ],
					opinions: [ [ 0x11, 0x0 ], [ 0x12, 0x0 ], [ 0x13, 0x0 ], [ 0x14, 0x0 ] ],
				}
			}));
		});

		describe('supports drive closure transaction', () => {
			const codec = getCodecs()[EntityType.driveClosure];
			const driveKey = createByteArray(0x01);

			test.binary.test.addAll(codec, 32, () => ({
				buffer: Buffer.concat([
					driveKey,
				]),
				object: {
					driveKey,
				}
			}));
		});

		describe('supports end drive verification transaction', () => {
			const codec = getCodecs()[EntityType.endDriveVerificationV2];
			const driveKey = createByteArray(0x01);
			const trigger = createByteArray(0x02);
			const shardId = Buffer.of(0x05, 0x0);
			const keyCount = Buffer.of(0x02);
			const signatureCount = Buffer.of(0x02);
			const keyOne = createByteArray(0x11);
			const keyTwo = createByteArray(0x20);
			const signatureOne = createByteArray(0x11, 64);
			const signatureTwo = createByteArray(0x21, 64);
			const opinions = Buffer.of(0x4);

            it('can be serialized', () => {
                // Arrange:
                const serializationObject = {
                    driveKey: driveKey,
                    verificationTrigger: trigger,
					shardId: 0x05,
                    publicKeys: [keyOne, keyTwo],
                    signatures: [signatureOne, signatureTwo],
                    opinions: 0x4,
                }
                const serializedBuffer = Buffer.concat([
                    driveKey,
                    trigger,
                    shardId,
                    keyCount,
                    signatureCount,
                    keyOne,
                    keyTwo,
                    signatureOne,
                    signatureTwo,
                    opinions
                ])
                const serializationSize = 32 + 32 + 2 + 1 + 1 + (2 * 32) + (2 * 64) + 1;

                // Assert:
                test.binary.assertSerialization(codec, serializationSize, serializationObject, serializedBuffer);
            });

			it('can be deserialized', () => {
        // Arrange:
        const deserializationObject = {
          driveKey: driveKey,
          verificationTrigger: trigger,
          shardId: 0x05,
          publicKeys: [keyOne, keyTwo],
          signatures: [signatureOne, signatureTwo],
          opinions: 0x4,
        }
        const deserializedBuffer = Buffer.concat([
          driveKey,
          trigger,
          shardId,
          keyCount,
					signatureCount,
          keyOne,
          keyTwo,
          signatureOne,
          signatureTwo,
          opinions
        ])
        const deserializationSize = 32 + 32 + 2 + 1 + 1 + (2 * 32) + (2 * 64) + 1;

				// Assert:
				test.binary.assertDeserialization(codec, deserializationSize, deserializedBuffer, deserializationObject);
			});
		});

		describe('supports replicators cleanup transaction', () => {
			const codec = getCodecs()[EntityType.replicatorsCleanup];
			const replicatorCount = Buffer.of(0x04, 0x00);
			const key1 = createByteArray(0x05, 32);
			const key2 = createByteArray(0x06, 32);
			const key3 = createByteArray(0x07, 32);
			const key4 = createByteArray(0x08, 32);

			test.binary.test.addAll(codec, 2 + 4 * 32, () => ({
				buffer: Buffer.concat([
					replicatorCount,
					key1,
					key2,
					key3,
					key4,
				]),
				object: {
					replicatorCount: 0x04,
					replicatorKeys: [ key1, key2, key3, key4 ],
				}
			}));
		});

		describe('supports replicator tree rebuild transaction', () => {
			const codec = getCodecs()[EntityType.replicatorTreeRebuild];
			const replicatorCount = Buffer.of(0x04, 0x00);
			const key1 = createByteArray(0x05, 32);
			const key2 = createByteArray(0x06, 32);
			const key3 = createByteArray(0x07, 32);
			const key4 = createByteArray(0x08, 32);

			test.binary.test.addAll(codec, 2 + 4 * 32, () => ({
				buffer: Buffer.concat([
					replicatorCount,
					key1,
					key2,
					key3,
					key4,
				]),
				object: {
					replicatorCount: 0x04,
					replicatorKeys: [ key1, key2, key3, key4 ],
				}
			}));
		});
	});
});
