/**
 *** Copyright 2019 ProximaX Limited. All rights reserved.
 *** Use of this source code is governed by the Apache 2.0
 *** license that can be found in the LICENSE file.
 * */

const EntityType = require('../../src/model/EntityType');
const ModelSchemaBuilder = require('../../src/model/ModelSchemaBuilder');
const test = require('../binaryTestUtils');
const { expect } = require('chai');

const servicePlugin = require('../../src/plugins/service');

describe('service plugin', () => {
	describe('register schema', () => {
		it('adds service system schema', () => {
			// Arrange:
			const builder = new ModelSchemaBuilder();
			const numDefaultKeys = Object.keys(builder.build()).length;

			// Act:
			servicePlugin.registerSchema(builder);
			const modelSchema = builder.build();

			// Assert:
			expect(Object.keys(modelSchema).length).to.equal(numDefaultKeys + 23);
			expect(modelSchema).to.contain.all.keys([
				'prepareDrive',
				'joinToDrive',
				'driveFileSystem',
				'filesDeposit',
				'endDrive',
				'startDriveVerification',
				'endDriveVerification',
				'drive.verificationFailure',
				'driveFilesReward',
				'driveFilesReward.uploadInfo',
				'driveFileSystem.addfiles',
				'filesDeposit.files',
				'driveEntry',
				'paymentInformation',
				'billingPeriodDescription',
				'fileInfo',
				'inactiveFilesWithoutDeposit',
				'replicatorInfo',
				'drive',
				'service.driveStateWithMetadata',
				'startFileDownload',
				'endFileDownload',
			]);

			expect(Object.keys(modelSchema.prepareDrive).length).to.equal(Object.keys(modelSchema.transaction).length + 8);
			expect(modelSchema.prepareDrive).to.contain.all.keys([
				'owner',
				'duration',
				'billingPeriod',
				'billingPrice',
				'driveSize',
				'replicas',
				'minReplicators',
				'percentApprovers'
			]);

			expect(Object.keys(modelSchema.joinToDrive).length).to.equal(Object.keys(modelSchema.transaction).length + 1);
			expect(modelSchema.joinToDrive).to.contain.all.keys(['driveKey']);

			expect(Object.keys(modelSchema.driveFileSystem).length).to.equal(Object.keys(modelSchema.transaction).length + 5);
			expect(modelSchema.driveFileSystem).to.contain.all.keys([
				'driveKey',
				'rootHash',
				'xorRootHash',
				'addActions',
				'removeActions'
			]);

			expect(Object.keys(modelSchema.filesDeposit).length).to.equal(Object.keys(modelSchema.transaction).length + 2);
			expect(modelSchema.filesDeposit).to.contain.all.keys(['driveKey', 'files']);

			expect(Object.keys(modelSchema.endDrive).length).to.equal(Object.keys(modelSchema.transaction).length + 1);
			expect(modelSchema.endDrive).to.contain.all.keys(['driveKey']);

			expect(Object.keys(modelSchema.startDriveVerification).length).to.equal(Object.keys(modelSchema.transaction).length + 1);
			expect(modelSchema.startDriveVerification).to.contain.all.keys(['driveKey']);

			expect(Object.keys(modelSchema.endDriveVerification).length).to.equal(Object.keys(modelSchema.transaction).length + 1);
			expect(modelSchema.endDriveVerification).to.contain.all.keys(['verificationFailures']);

			expect(Object.keys(modelSchema['drive.verificationFailure']).length).to.equal(3);
			expect(modelSchema['drive.verificationFailure']).to.contain.all.keys(['size', 'replicator', 'blockHashes']);

			expect(Object.keys(modelSchema.driveFilesReward).length).to.equal(Object.keys(modelSchema.transaction).length + 1);
			expect(modelSchema.driveFilesReward).to.contain.all.keys(['uploadInfos']);

			expect(Object.keys(modelSchema['driveFilesReward.uploadInfo']).length).to.equal(2);
			expect(modelSchema['driveFilesReward.uploadInfo']).to.contain.all.keys(['participant', 'uploaded']);

			expect(Object.keys(modelSchema['driveFileSystem.addfiles']).length).to.equal(2);
			expect(modelSchema['driveFileSystem.addfiles']).to.contain.all.keys(['fileHash', 'fileSize']);

			expect(Object.keys(modelSchema['filesDeposit.files']).length).to.equal(1);
			expect(modelSchema['filesDeposit.files']).to.contain.all.keys(['fileHash']);

			expect(Object.keys(modelSchema['driveEntry']).length).to.equal(1);
			expect(modelSchema['driveEntry']).to.contain.all.keys(['drive']);

			expect(Object.keys(modelSchema['paymentInformation']).length).to.equal(3);
			expect(modelSchema['paymentInformation']).to.contain.all.keys(['receiver', 'amount', 'height']);

			expect(Object.keys(modelSchema['billingPeriodDescription']).length).to.equal(3);
			expect(modelSchema['billingPeriodDescription']).to.contain.all.keys(['start', 'end', 'payments']);

			expect(Object.keys(modelSchema['fileInfo']).length).to.equal(2);
			expect(modelSchema['fileInfo']).to.contain.all.keys(['fileHash', 'size']);

			expect(Object.keys(modelSchema['inactiveFilesWithoutDeposit']).length).to.equal(2);
			expect(modelSchema['inactiveFilesWithoutDeposit']).to.contain.all.keys(['fileHash', 'heights']);

			expect(Object.keys(modelSchema['replicatorInfo']).length).to.equal(5);
			expect(modelSchema['replicatorInfo']).to.contain.all.keys([
				'replicator',
				'start',
				'end',
				'activeFilesWithoutDeposit',
				'inactiveFilesWithoutDeposit'
			]);

			expect(Object.keys(modelSchema['drive']).length).to.equal(18);
			expect(modelSchema['drive']).to.contain.all.keys([
				'multisig',
				'multisigAddress',
				'owner',
				'start',
				'end',
				'rootHash',
				'duration',
				'billingPeriod',
				'billingPrice',
				'size',
				'occupiedSpace',
				'replicas',
				'minReplicators',
				'billingHistory',
				'files',
				'replicators',
				'removedReplicators',
				'uploadPayments'
			]);

			expect(Object.keys(modelSchema['service.driveStateWithMetadata']).length).to.equal(2);
			expect(modelSchema['service.driveStateWithMetadata']).to.contain.all.keys(['driveKey', 'meta']);

			expect(Object.keys(modelSchema.startFileDownload).length).to.equal(Object.keys(modelSchema.transaction).length + 2);
			expect(modelSchema.startFileDownload).to.contain.all.keys(['driveKey', 'files']);

			expect(Object.keys(modelSchema.endFileDownload).length).to.equal(Object.keys(modelSchema.transaction).length + 2);
			expect(modelSchema.endFileDownload).to.contain.all.keys(['recipient', 'files']);

			expect(Object.keys(modelSchema['endFileDownload.files']).length).to.equal(1);
			expect(modelSchema['endFileDownload.files']).to.contain.all.keys(['fileHash']);
		});
	});

	describe('register codecs', () => {
		const getCodecs = () => {
			const codecs = {};
			servicePlugin.registerCodecs({
				addTransactionSupport: (type, codec) => { codecs[type] = codec; }
			});

			return codecs;
		};

		const createHash = (number) => {
			const hash = new Uint8Array(32);
			hash[0] = number;

			return hash;
		};

		it('adds service codec', () => {
			// Act:
			const codecs = getCodecs();

			// Assert: codec was registered
			expect(Object.keys(codecs).length).to.equal(10);
			expect(codecs).to.contain.all.keys([
				EntityType.prepareDrive.toString(),
				EntityType.joinToDrive.toString(),
				EntityType.endDrive.toString(),
				EntityType.startDriveVerification.toString(),
				EntityType.endDriveVerification.toString(),
				EntityType.driveFileSystem.toString(),
				EntityType.filesDeposit.toString(),
				EntityType.driveFilesReward.toString(),
				EntityType.startFileDownload.toString(),
				EntityType.endFileDownload.toString(),
			]);
		});

		describe('supports prepare drive transaction', () => {
			const codec = getCodecs()[EntityType.prepareDrive];
			const owner = createHash(0x01);
			const duration = Buffer.of(0x02, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00);
			const billingPeriod = Buffer.of(0x03, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00);
			const billingPrice = Buffer.of(0x04, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00);
			const driveSize = Buffer.of(0x05, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00);
			const replicas = Buffer.of(0x06, 0x00);
			const minReplicators = Buffer.of(0x07, 0x00);
			const percentApprovers = Buffer.of(0x08);

			test.binary.test.addAll(codec, 32 + 4 * 8 + 2 * 2 + 1, () => ({
				buffer: Buffer.concat([
					owner,
					duration,
					billingPeriod,
					billingPrice,
					driveSize,
					replicas,
					minReplicators,
					percentApprovers
				]),
				object: {
					owner,
					duration: [0x02, 0x0],
					billingPeriod: [0x03, 0x0],
					billingPrice: [0x04, 0x0],
					driveSize: [0x05, 0x0],
					replicas: 0x06,
					minReplicators: 0x07,
					percentApprovers: 0x08
				}
			}));
		});

		const assertDriveKey = (entityType) => {
			const codec = getCodecs()[entityType];
			const driveKey = createHash(0x01);
			test.binary.test.addAll(codec, 32, () => ({
				buffer: Buffer.from(driveKey),
				object: {
					driveKey
				}
			}));
		};

		describe('supports join to drive transaction', () => {
			assertDriveKey(EntityType.joinToDrive);
		});

		describe('supports end drive transaction', () => {
			assertDriveKey(EntityType.endDrive);
		});

		describe('supports start drive verification transaction', () => {
			assertDriveKey(EntityType.startDriveVerification);
		});

		describe('supports end drive verification transaction', () => {
			const codec = getCodecs()[EntityType.endDriveVerification];
			const size1 = Buffer.of(0x64, 0x0, 0x0, 0x0);
			const replicator1 = createHash(0x01);
			const blockHash1 = createHash(0x02);
			const blockHash2 = createHash(0x03);
			const size2 = Buffer.of(0x84, 0x0, 0x0, 0x0);
			const replicator2 = createHash(0x04);
			const blockHash3 = createHash(0x05);
			const blockHash4 = createHash(0x06);
			const blockHash5 = createHash(0x07);

			test.binary.test.addAll(codec, 2 * (4 + 32) + 5 * 32, () => ({
				buffer: Buffer.concat([
					size1,
					replicator1,
					blockHash1,
					blockHash2,
					size2,
					replicator2,
					blockHash3,
					blockHash4,
					blockHash5
				]),
				object: {
					verificationFailures: [
						{
							size: 100,
							replicator: replicator1,
							blockHashes: [ blockHash1, blockHash2 ]
						},
						{
							size: 132,
							replicator: replicator2,
							blockHashes: [ blockHash3, blockHash4, blockHash5 ]
						}
					]
				}
			}));
		});

		describe('supports drive file system transaction', () => {
			const codec = getCodecs()[EntityType.driveFileSystem];
			const driveKey = createHash(0x01);
			const rootHash = createHash(0x02);
			const xorRootHash = createHash(0x03);
			const addActionsCount = Buffer.of(0x02, 0x0);
			const addedFileHash1 = createHash(0x04);
			const addedFileSize1 = Buffer.of(0x05, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0);
			const addedFileHash2 = createHash(0x06);
			const addedFileSize2 = Buffer.of(0x07, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0);
			const removeActionsCount = Buffer.of(0x03, 0x0);
			const removedFileHash1 = createHash(0x08);
			const removedFileSize1 = Buffer.of(0x09, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0);
			const removedFileHash2 = createHash(0x0A);
			const removedFileSize2 = Buffer.of(0x0B, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0);
			const removedFileHash3 = createHash(0x0C);
			const removedFileSize3 = Buffer.of(0x0D, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0);

			test.binary.test.addAll(codec, 3 * 32 + 2 * 2 + 5 * (32 + 8), () => ({
				buffer: Buffer.concat([
					driveKey,
					rootHash,
					xorRootHash,
					addActionsCount,
					removeActionsCount,
					addedFileHash1,
					addedFileSize1,
					addedFileHash2,
					addedFileSize2,
					removedFileHash1,
					removedFileSize1,
					removedFileHash2,
					removedFileSize2,
					removedFileHash3,
					removedFileSize3
				]),
				object: {
					driveKey,
					rootHash,
					xorRootHash,
					addActionsCount: 0x02,
					addActions: [
						{
							fileHash: addedFileHash1,
							fileSize: [0x05, 0x0]
						},
						{
							fileHash: addedFileHash2,
							fileSize: [0x07, 0x0]
						}
					],
					removeActionsCount: 0x03,
					removeActions: [
						{
							fileHash: removedFileHash1,
							fileSize: [0x09, 0x0]
						},
						{
							fileHash: removedFileHash2,
							fileSize: [0x0B, 0x0]
						},
						{
							fileHash: removedFileHash3,
							fileSize: [0x0D, 0x0]
						}
					]
				}
			}));
		});

		describe('supports files deposit transaction', () => {
			const codec = getCodecs()[EntityType.filesDeposit];
			const driveKey = createHash(0x01);
			const filesCount = Buffer.of(0x02, 0x0);
			const fileHash1 = createHash(0x02);
			const fileHash2 = createHash(0x03);

			test.binary.test.addAll(codec, 32 + 2 + 2 * 32, () => ({
				buffer: Buffer.concat([
					driveKey,
					filesCount,
					fileHash1,
					fileHash2
				]),
				object: {
					driveKey,
					filesCount: 0x02,
					files: [
						{
							fileHash: fileHash1
						},
						{
							fileHash: fileHash2
						}
					]
				}
			}));
		});

		describe('supports drive files reward transaction', () => {
			const codec = getCodecs()[EntityType.driveFilesReward];
			const uploadInfosCount = Buffer.of(0x02, 0x0);
			const participant1 = createHash(0x01);
			const uploaded1 = Buffer.of(0x02, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0);
			const participant2 = createHash(0x03);
			const uploaded2 = Buffer.of(0x04, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0);

			test.binary.test.addAll(codec, 2 + 2 * (32 + 8), () => ({
				buffer: Buffer.concat([
					uploadInfosCount,
					participant1,
					uploaded1,
					participant2,
					uploaded2
				]),
				object: {
					uploadInfosCount: 0x02,
					uploadInfos: [
						{
							participant: participant1,
							uploaded: [0x02, 0x0]
						},
						{
							participant: participant2,
							uploaded: [0x04, 0x0]
						}
					]
				}
			}));
		});

		describe('supports start file download transaction', () => {
			const codec = getCodecs()[EntityType.startFileDownload];
			const driveKey = createHash(0x01);
			const fileCount = Buffer.of(0x02, 0x0);
			const fileHash1 = createHash(0x02);
			const size1 = Buffer.of(0x03, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0);
			const fileHash2 = createHash(0x04);
			const size2 = Buffer.of(0x05, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0);

			test.binary.test.addAll(codec, 32 + 2 + 2 * (32 + 8), () => ({
				buffer: Buffer.concat([
					driveKey,
					fileCount,
					fileHash1,
					size1,
					fileHash2,
					size2
				]),
				object: {
					driveKey,
					fileCount: 0x02,
					files: [
						{
							fileHash: fileHash1,
							size: [0x03, 0x0]
						},
						{
							fileHash: fileHash2,
							size: [0x05, 0x0]
						}
					]
				}
			}));
		});

		describe('supports end file download transaction', () => {
			const codec = getCodecs()[EntityType.endFileDownload];
			const recipient = createHash(0x01);
			const fileCount = Buffer.of(0x02, 0x0);
			const fileHash1 = createHash(0x02);
			const fileHash2 = createHash(0x03);

			test.binary.test.addAll(codec, 32 + 2 + 2 * 32, () => ({
				buffer: Buffer.concat([
					recipient,
					fileCount,
					fileHash1,
					fileHash2
				]),
				object: {
					recipient,
					fileCount: 0x02,
					files: [
						{
							fileHash: fileHash1
						},
						{
							fileHash: fileHash2
						}
					]
				}
			}));
		});
	});
});
