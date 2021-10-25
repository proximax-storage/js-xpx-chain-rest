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
			expect(Object.keys(modelSchema).length).to.equal(numDefaultKeys + 17);
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
				'endDriveVerificationV2',
				'endDriveVerification.verificationOpinions',
				'endDriveVerification.verificationOpinions.results'
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

			expect(Object.keys(modelSchema.dataModificationApproval).length).to.equal(Object.keys(modelSchema.transaction).length + 5);
			expect(modelSchema.dataModificationApproval).to.contain.all.keys([
				'driveKey',
				'dataModificationId',
				'fileStructureCdi',
				'fileStructureSize',
				'usedDriveSize',
			]);

			expect(Object.keys(modelSchema.dataModificationCancel).length).to.equal(Object.keys(modelSchema.transaction).length + 2);
			expect(modelSchema.dataModificationCancel).to.contain.all.keys([
				'driveKey',
				'dataModificationId',
			]);

			expect(Object.keys(modelSchema.replicatorOnboarding).length).to.equal(Object.keys(modelSchema.transaction).length + 2);
			expect(modelSchema.replicatorOnboarding).to.contain.all.keys([
				'capacity',
				'blsKey',
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

			expect(Object.keys(modelSchema.dataModificationSingleApproval).length).to.equal(Object.keys(modelSchema.transaction).length + 4);
			expect(modelSchema.dataModificationSingleApproval).to.contain.all.keys([
				'driveKey',
				'dataModificationId',
				'uploaderKeys',
				'uploadOpinion',
			]);

			expect(Object.keys(modelSchema.verificationPayment).length).to.equal(Object.keys(modelSchema.transaction).length + 2);
			expect(modelSchema.verificationPayment).to.contain.all.keys([
				'driveKey',
				'verificationFeeAmount',
			]);

			expect(Object.keys(modelSchema.downloadApproval).length).to.equal(Object.keys(modelSchema.transaction).length + 8);
			expect(modelSchema.downloadApproval).to.contain.all.keys([
				'downloadChannelId',
				'sequenceNumber',
				'responseToFinishDownloadTransaction',
				'publicKeys',
				'opinionIndices',
				'blsSignatures',
				'presentOpinions',
				'opinions',
			]);

			expect(Object.keys(modelSchema.driveClosure).length).to.equal(Object.keys(modelSchema.transaction).length + 1);
			expect(modelSchema.driveClosure).to.contain.all.keys([
				'driveKey',
			]);

			expect(Object.keys(modelSchema.endDriveVerificationV2).length).to.equal(Object.keys(modelSchema.transaction).length + 4);
			expect(modelSchema.endDriveVerificationV2).to.contain.all.keys([
				'driveKey',
				'verificationTrigger',
				'provers',
				'verificationOpinions',
			]);

			expect(Object.keys(modelSchema['endDriveVerification.verificationOpinions']).length).to.equal(3);
			expect(modelSchema['endDriveVerification.verificationOpinions']).to.contain.all.keys([
				'verifier',
				'blsSignature',
				'results'
			]);

			expect(Object.keys(modelSchema['endDriveVerification.verificationOpinions.results']).length).to.equal(2);
			expect(modelSchema['endDriveVerification.verificationOpinions.results']).to.contain.all.keys([
				'prover',
				'result'
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
				EntityType.endDriveVerificationV2.toString(),
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
			const usedDriveSize = Buffer.of(0x05, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00);

			test.binary.test.addAll(codec, 3 * 32 + 2 * 8, () => ({
				buffer: Buffer.concat([
					driveKey,
					dataModificationId,
					fileStructureCdi,
					fileStructureSize,
					usedDriveSize,
				]),
				object: {
					driveKey,
					dataModificationId,
					fileStructureCdi,
					fileStructureSize: [0x04, 0x0],
					usedDriveSize: [0x05, 0x0],
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
			const blsKey = createByteArray(0x02, 48);

			test.binary.test.addAll(codec, 8 + 48, () => ({
				buffer: Buffer.concat([
					capacity,
					blsKey,
				]),
				object: {
					capacity: [0x01, 0x0],
					blsKey,
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
			const uploadOpinionPairCount = Buffer.of(0x03, 0x00);
			const usedDriveSize = Buffer.of(0x04, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00);
			const key1 = createByteArray(0x05);
			const key2 = createByteArray(0x06);
			const key3 = createByteArray(0x07);
			const uploadOpinion = Buffer.of(0x08, 0x09, 0x0A);

			test.binary.test.addAll(codec, 2 * 32 + 2 + 8 + 3 * 32 + 3, () => ({
				buffer: Buffer.concat([
					driveKey,
					dataModificationId,
					uploadOpinionPairCount,
					usedDriveSize,
					key1,
					key2,
					key3,
					uploadOpinion,
				]),
				object: {
					driveKey,
					dataModificationId,
					uploadOpinionPairCount: 0x03,
					usedDriveSize: [0x04, 0x0],
					uploaderKeys: [ key1, key2, key3 ],
					uploadOpinion: [ 0x08, 0x09, 0x0A ],
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
			const opinionCount = Buffer.of(0x02);
			const judgingCount = Buffer.of(0x05);
			const judgedCount = Buffer.of(0x03);
			const opinionElementCount = Buffer.of(0x04);
			const key1 = createByteArray(0x08);
			const key2 = createByteArray(0x09);
			const key3 = createByteArray(0x0A);
			const opinionIndices = Buffer.of(0x0B, 0x0C, 0x0D, 0x0E, 0x0F);
			const blsSignature1 = createByteArray(0x10, 96);
			const blsSignature2 = createByteArray(0x11, 96);
			const presentOpinions = Buffer.of(0x12);
			const opinions = Buffer.of(
				0x13, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0,
				0x14, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0,
				0x15, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0,
				0x16, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0,
			);

			test.binary.test.addAll(codec, 32 + 2 + 5 + 3 * 32 + 5 + 2 * 96 + 1 + 4 * 8, () => ({
				buffer: Buffer.concat([
					downloadChannelId,
					sequenceNumber,
					responseToFinishDownloadTransaction,
					opinionCount,
					judgingCount,
					judgedCount,
					opinionElementCount,
					key1,
					key2,
					key3,
					opinionIndices,
					blsSignature1,
					blsSignature2,
					presentOpinions,
					opinions,
				]),
				object: {
					downloadChannelId,
					sequenceNumber: 0x02,
					responseToFinishDownloadTransaction: 0x03,
					opinionCount: 0x02,
					judgingCount: 0x05,
					judgedCount: 0x03,
					opinionElementCount: 0x04,
					publicKeys: [ key1, key2, key3 ],
					opinionIndices: [ 0x0B, 0x0C, 0x0D, 0x0E, 0x0F ],
					blsSignatures: [ blsSignature1, blsSignature2 ],
					presentOpinions: [ 0x12 ],
					opinions: [ [ 0x13, 0x0 ], [ 0x14, 0x0 ], [ 0x15, 0x0 ], [ 0x16, 0x0 ] ],
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
			const proversCount = Buffer.of(0x02, 0x0);
			const verificationOpinionsCount = Buffer.of(0x02, 0x0);
			const proverOne = createByteArray(0x11);
			const proverTwo = createByteArray(0x20);
			const blsSignatureOne = createByteArray(0x11, 96);
			const blsSignatureTwo = createByteArray(0x21, 96);
			const resultOne = Buffer.of(0x01);
			const resultTwo = Buffer.of(0x01);

			test.binary.test.addAll(codec, 32 + 32 + (2 + 32 * 2) + (2 + (32 + 96 + (32 + 1) * 2) * 2), () => ({
				buffer: Buffer.concat([
					driveKey,
					trigger,
					proversCount,
					verificationOpinionsCount,
					proverOne,
					proverTwo,
					proverOne,
					blsSignatureOne,
					proverOne,
					resultOne,
					proverTwo,
					resultTwo,
					proverTwo,
					blsSignatureTwo,
					proverOne,
					resultOne,
					proverTwo,
					resultTwo,
				]),
				object: {
					driveKey: driveKey,
					verificationTrigger: trigger,
					proversCount: 0x02,
					verificationOpinionsCount: 0x02,
					provers: [proverOne, proverTwo],
					verificationOpinions: [
						{
							verifier: proverOne,
							blsSignature: blsSignatureOne,
							results: [
								{prover: proverOne, result: 0x01},
								{prover: proverTwo, result: 0x01}
							]
						},
						{
							verifier: proverTwo,
							blsSignature: blsSignatureTwo,
							results: [
								{prover: proverOne, result: 0x01},
								{prover: proverTwo, result: 0x01}
							]
						},
					]
				}
			}));
		});
	});
});
