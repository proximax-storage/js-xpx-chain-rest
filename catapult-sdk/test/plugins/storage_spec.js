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
			expect(Object.keys(modelSchema).length).to.equal(numDefaultKeys + 29);
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
				'endDriveVerification',
				'endDriveVerification.verificationOpinions',
				'replicatorEntry',
				'driveInfo',
				'replicators',
				'bcDriveEntry',
				'activeDataModification',
				'completedDataModification',
				'confirmedUsedSizes',
				'verificationOpinions',
				'verifications',
				'bcdrives',
				'downloadChannelEntry',
				'cumulativePayments',
				'downloadChannelInfo'
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

			expect(Object.keys(modelSchema.download).length).to.equal(Object.keys(modelSchema.transaction).length + 3);
			expect(modelSchema.download).to.contain.all.keys([
				'downloadSize',
				'feedbackFeeAmount',
				'listOfPublicKeys',
			]);

			expect(Object.keys(modelSchema.dataModificationApproval).length).to.equal(Object.keys(modelSchema.transaction).length + 10);
			expect(modelSchema.dataModificationApproval).to.contain.all.keys([
				'driveKey',
				'dataModificationId',
				'fileStructureCdi',
				'fileStructureSize',
				'metaFilesSize',
				'usedDriveSize',
				'publicKeys',
				'signatures',
				'presentOpinions',
				'opinions',
			]);

			expect(Object.keys(modelSchema.dataModificationCancel).length).to.equal(Object.keys(modelSchema.transaction).length + 2);
			expect(modelSchema.dataModificationCancel).to.contain.all.keys([
				'drive',
				'dataModificationId',
			]);

			expect(Object.keys(modelSchema.replicatorOnboarding).length).to.equal(Object.keys(modelSchema.transaction).length + 2);
			expect(modelSchema.replicatorOnboarding).to.contain.all.keys([
				'publicKey',
				'capacity',
			]);

			expect(Object.keys(modelSchema.replicatorOffboarding).length).to.equal(Object.keys(modelSchema.transaction).length);

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

			expect(Object.keys(modelSchema.downloadApproval).length).to.equal(Object.keys(modelSchema.transaction).length + 7);
			expect(modelSchema.downloadApproval).to.contain.all.keys([
				'downloadChannelId',
				'sequenceNumber',
				'responseToFinishDownloadTransaction',
				'publicKeys',
				'signatures',
				'presentOpinions',
				'opinions',
			]);

			expect(Object.keys(modelSchema.driveClosure).length).to.equal(Object.keys(modelSchema.transaction).length + 1);
			expect(modelSchema.driveClosure).to.contain.all.keys([
				'drive',
			]);

			expect(Object.keys(modelSchema.endDriveVerification).length).to.equal(Object.keys(modelSchema.transaction).length + 4);
			expect(modelSchema.endDriveVerification).to.contain.all.keys([
				'drive',
				'verificationTrigger',
				'provers',
				'verificationOpinions',
			]);

			expect(Object.keys(modelSchema['endDriveVerification.verificationOpinions']).length).to.equal(3);
			expect(modelSchema['endDriveVerification.verificationOpinions']).to.contain.all.keys([
				'verifier',
				'signature',
				'results'
			]);

			expect(Object.keys(modelSchema['replicatorEntry']).length).to.equal(1);
			expect(modelSchema['replicatorEntry']).to.contain.all.keys(['replicator']);

			expect(Object.keys(modelSchema['driveInfo']).length).to.equal(4);
			expect(modelSchema['driveInfo']).to.contain.all.keys([
				'drive', 
				'lastApprovedDataModificationId', 
				'dataModificationIdIsValid', 
				'initialDownloadWork'
			]);

			expect(Object.keys(modelSchema['replicators']).length).to.equal(4);
			expect(modelSchema['replicators']).to.contain.all.keys([
				'key',
				'version',
				'capacity',
				'drives'
			]);

			expect(Object.keys(modelSchema['bcDriveEntry']).length).to.equal(1);
			expect(modelSchema['bcDriveEntry']).to.contain.all.keys(['drive']);

			expect(Object.keys(modelSchema['activeDataModification']).length).to.equal(7);
			expect(modelSchema['activeDataModification']).to.contain.all.keys([
				'id',
				'owner',
				'downloadDataCdi',
				'expectedUploadSize',
				'actualUploadSize',
				'folderName',
				'readyForApproval'
			]);

			expect(Object.keys(modelSchema['completedDataModification']).length).to.equal(8);
			expect(modelSchema['completedDataModification']).to.contain.all.keys([
				'id',
				'owner',
				'downloadDataCdi',
				'expectedUploadSize',
				'actualUploadSize',
				'folderName',
				'readyForApproval',
				'state'
			]);

			expect(Object.keys(modelSchema['confirmedUsedSizes']).length).to.equal(2);
			expect(modelSchema['confirmedUsedSizes']).to.contain.all.keys([
				'replicator',
				'size'
			]);

			expect(Object.keys(modelSchema['verificationOpinions']).length).to.equal(2);
			expect(modelSchema['verificationOpinions']).to.contain.all.keys([
				'prover',
				'result'
			]);

			expect(Object.keys(modelSchema['verifications']).length).to.equal(3);
			expect(modelSchema['verifications']).to.contain.all.keys([
				'verificationTrigger',
				'state',
				'results'
			]);

			expect(Object.keys(modelSchema['bcdrives']).length).to.equal(14);
			expect(modelSchema['bcdrives']).to.contain.all.keys([
				'multisig',
				'multisigAddress',
				'owner',
				'rootHash',
				'size',
				'usedSize',
				'metaFilesSize',
				'replicatorCount',
				'ownerCumulativeUploadSize',
				'activeDataModifications',
				'completedDataModifications',
				'confirmedUsedSizes',
				'replicators',
				'verifications'
			]);

			expect(Object.keys(modelSchema['downloadChannelEntry']).length).to.equal(1);
			expect(modelSchema['downloadChannelEntry']).to.contain.all.keys(['downloadChannelInfo']);

			expect(Object.keys(modelSchema['cumulativePayments']).length).to.equal(2);
			expect(modelSchema['cumulativePayments']).to.contain.all.keys([
				'replicator',
				'payment'
			]);

			expect(Object.keys(modelSchema['downloadChannelInfo']).length).to.equal(6);
			expect(modelSchema['downloadChannelInfo']).to.contain.all.keys([
				'id',
				'consumer',
				'downloadSize',
				'downloadApprovalCount',
				'listOfPublicKeys',
				'cumulativePayments'
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
			expect(Object.keys(codecs).length).to.equal(15);
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
				EntityType.endDriveVerification.toString(),
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
			const downloadSize = Buffer.of(0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00);
			const feedbackFeeAmount = Buffer.of(0x02, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00);
			const publicKeyCount = Buffer.of(0x03, 0x00);
			const key1 = createByteArray(0x04);
			const key2 = createByteArray(0x05);
			const key3 = createByteArray(0x06);

			test.binary.test.addAll(codec, 2 * 8 + 2 + 3 * 32, () => ({
				buffer: Buffer.concat([
					downloadSize,
					feedbackFeeAmount,
					publicKeyCount,
					key1,
					key2,
					key3,
				]),
				object: {
					downloadSize: [0x01, 0x0],
					feedbackFeeAmount: [0x02, 0x0],
					publicKeyCount: 0x03,
					listOfPublicKeys: [ key1, key2, key3 ],
				}
			}));
		});

		describe('supports data modification approval transaction', () => {
			const codec = getCodecs()[EntityType.dataModificationApproval];
			const driveKey = createByteArray(0x01);
			const dataModificationId = createByteArray(0x02);
			const fileStructureCdi = createByteArray(0x03);
			const fileStructureSize = Buffer.of(0x04, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00);
			const metaFilesSize = Buffer.of(0x05, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00);
			const usedDriveSize = Buffer.of(0x06, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00);
			const judgingKeysCount = Buffer.of(0x02);
			const overlappingKeysCount = Buffer.of(0x00);
			const judgedKeysCount = Buffer.of(0x01);
			const opinionElementCount = Buffer.of(0x03);
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

			test.binary.test.addAll(codec, 3 * 32 + 3 * 8 + 4 + 3 * 32 + 2 * 64 + 1 + 3 * 8, () => ({
				buffer: Buffer.concat([
					driveKey,
					dataModificationId,
					fileStructureCdi,
					fileStructureSize,
					metaFilesSize,
					usedDriveSize,
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
					fileStructureSize: [ 0x04, 0x0 ],
					metaFilesSize: [ 0x05, 0x0 ],
					usedDriveSize: [ 0x06, 0x0 ],
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
			const drive = createByteArray(0x01);
			const dataModificationId = createByteArray(0x02);

			test.binary.test.addAll(codec, 2 * 32, () => ({
				buffer: Buffer.concat([
					drive,
					dataModificationId,
				]),
				object: {
					drive,
					dataModificationId,
				}
			}));
		});

		describe('supports replicator onboarding transaction', () => {
			const codec = getCodecs()[EntityType.replicatorOnboarding];
			const publicKey = createByteArray(0x01);
			const capacity = Buffer.of(0x02, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00);

			test.binary.test.addAll(codec, 32 + 8, () => ({
				buffer: Buffer.concat([
					publicKey,
					capacity,
				]),
				object: {
					publicKey,
					capacity: [ 0x02, 0x0 ],
				}
			}));
		});

		describe('supports replicator offboarding transaction', () => {
			const codec = getCodecs()[EntityType.replicatorOffboarding];

			test.binary.test.addAll(codec, 0, () => ({
				buffer: Buffer.concat([]),
				object: {},
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
			const sequenceNumber = Buffer.of(0x02, 0x00);
			const responseToFinishDownloadTransaction = Buffer.of(0x03);
			const judgingKeysCount = Buffer.of(0x01);
			const overlappingKeysCount = Buffer.of(0x02);
			const judgedKeysCount = Buffer.of(0x01);
			const opinionElementCount = Buffer.of(0x04);
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

			test.binary.test.addAll(codec, 32 + 2 + 5 + 4 * 32 + 3 * 64 + 2 + 4 * 8, () => ({
				buffer: Buffer.concat([
					downloadChannelId,
					sequenceNumber,
					responseToFinishDownloadTransaction,
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
					sequenceNumber: 0x02,
					responseToFinishDownloadTransaction: 0x03,
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
			const drive = createByteArray(0x01);

			test.binary.test.addAll(codec, 32, () => ({
				buffer: Buffer.concat([
					drive,
				]),
				object: {
					drive,
				}
			}));
		});

		describe('supports end drive verification transaction', () => {
			const codec = getCodecs()[EntityType.endDriveVerification];
			const drive = createByteArray(0x01);
			const verificationTrigger = createByteArray(0x02);
			const proversCount = Buffer.of(0x03, 0x00);
			const verificationOpinionsCount = Buffer.of(0x02, 0x00);
			const prover1 = createByteArray(0x05);
			const prover2 = createByteArray(0x06);
			const prover3 = createByteArray(0x07);
			const verifier1 = createByteArray(0x08);
			const signature1 = createByteArray(0x09, 64);
			const result1 = Buffer.of(0x0A);
			const verifier2 = createByteArray(0x0B);
			const signature2 = createByteArray(0x0C, 64);
			const result2 = Buffer.of(0x0D);

			test.binary.test.addAll(codec, 2 * 32 + 2 + 2 + 3 * 32 + 2 * (32 + 64 + 2 * (32 + 1)), () => ({
				buffer: Buffer.concat([
					drive,
					verificationTrigger,
					proversCount,
					verificationOpinionsCount,
					prover1,
					prover2,
					prover3,
					verifier1,
					signature1,
					prover1,
					result1,
					prover2,
					result2,
					verifier2,
					signature2,
					prover1,
					result1,
					prover2,
					result2,
				]),
				object: {
					drive,
					verificationTrigger,
					proversCount: 0x03,
					verificationOpinionsCount: 0x02,
					provers: [ prover1, prover2, prover3 ],
					verificationOpinions: [
						{
							verifier: verifier1,
							signature: signature1,
							results: [
								{
									prover: prover1,
									result: 0x0A,
								},
								{
									prover: prover2,
									result: 0x0D,
								}
							]
						},
						{
							verifier: verifier2,
							signature: signature2,
							results: [
								{
									prover: prover1,
									result: 0x0A,
								},
								{
									prover: prover2,
									result: 0x0D,
								}
							]
						} 
					],
				}
			}));
		});
	});
});
