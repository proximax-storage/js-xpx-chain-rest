/**
 *** Copyright 2019 ProximaX Limited. All rights reserved.
 *** Use of this source code is governed by the Apache 2.0
 *** license that can be found in the LICENSE file.
 * */

const EntityType = require('../../src/model/EntityType');
const ModelSchemaBuilder = require('../../src/model/ModelSchemaBuilder');
const test = require('../binaryTestUtils');
const { expect } = require('chai');

const supercontractPlugin = require('../../src/plugins/supercontract');

describe('supercontract plugin', () => {
	describe('register schema', () => {
		it('adds supercontract system schema', () => {
			// Arrange:
			const builder = new ModelSchemaBuilder();
			const numDefaultKeys = Object.keys(builder.build()).length;

			// Act:
			supercontractPlugin.registerSchema(builder);
			const modelSchema = builder.build();

			// Assert:
			expect(Object.keys(modelSchema).length).to.equal(numDefaultKeys + 8);
			expect(modelSchema).to.contain.all.keys([
				'deploy',
				'startExecute',
				'endExecute',
				'uploadFile',
				'execute.mosaic',
				'superContractEntry',
				'supercontract',
			]);

			expect(Object.keys(modelSchema.deploy).length).to.equal(Object.keys(modelSchema.transaction).length + 4);
			expect(modelSchema.deploy).to.contain.all.keys([
				'drive',
				'owner',
				'fileHash',
				'vmVersion',
			]);

			expect(Object.keys(modelSchema.startExecute).length).to.equal(Object.keys(modelSchema.transaction).length + 4);
			expect(modelSchema.startExecute).to.contain.all.keys([
				'superContract',
				'function',
				'data',
				'mosaics',
			]);

			expect(Object.keys(modelSchema.endExecute).length).to.equal(Object.keys(modelSchema.transaction).length + 2);
			expect(modelSchema.endExecute).to.contain.all.keys([
				'operationToken',
				'mosaics',
			]);

			expect(Object.keys(modelSchema.uploadFile).length).to.equal(Object.keys(modelSchema.transaction).length + 5);
			expect(modelSchema.uploadFile).to.contain.all.keys([
				'driveKey',
				'rootHash',
				'xorRootHash',
				'addActions',
				'removeActions'
			]);

			expect(Object.keys(modelSchema['execute.mosaic']).length).to.equal(2);
			expect(modelSchema['execute.mosaic']).to.contain.all.keys([
				'id',
				'amount',
			]);

			expect(Object.keys(modelSchema['superContractEntry']).length).to.equal(1);
			expect(modelSchema['superContractEntry']).to.contain.all.keys([
				'supercontract',
			]);

			expect(Object.keys(modelSchema['supercontract']).length).to.equal(7);
			expect(modelSchema['supercontract']).to.contain.all.keys([
				'multisig',
				'multisigAddress',
				'start',
				'end',
				'mainDriveKey',
				'fileHash',
				'vmVersion',
			]);

			expect(Object.keys(modelSchema['uploadFile.addfiles']).length).to.equal(2);
			expect(modelSchema['uploadFile.addfiles']).to.contain.all.keys([
				'fileHash',
				'fileSize'
			]);
		});
	});

	describe('register codecs', () => {
		const getCodecs = () => {
			const codecs = {};
			supercontractPlugin.registerCodecs({
				addTransactionSupport: (type, codec) => { codecs[type] = codec; }
			});

			return codecs;
		};

		const createByteArray = (number) => {
			const hash = new Uint8Array(32);
			hash[0] = number;

			return hash;
		};

		it('adds supercontract codec', () => {
			// Act:
			const codecs = getCodecs();

			// Assert: codec was registered
			expect(Object.keys(codecs).length).to.equal(4);
			expect(codecs).to.contain.all.keys([
				EntityType.deploy.toString(),
				EntityType.startExecute.toString(),
				EntityType.endExecute.toString(),
				EntityType.uploadFile.toString(),
			]);
		});

		describe('supports deploy transaction', () => {
			const codec = getCodecs()[EntityType.deploy];
			const drive = createByteArray(0x01);
			const owner = createByteArray(0x02);
			const fileHash = createByteArray(0x03);
			const vmVersion = Buffer.of(0x4, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0);

			test.binary.test.addAll(codec, 32 + 32 + 32 + 8, () => ({
				buffer: Buffer.concat([
					drive,
					owner,
					fileHash,
					vmVersion,
				]),
				object: {
					drive,
					owner,
					fileHash,
					vmVersion: [0x04, 0x0],
				}
			}));
		});

		describe('supports start execute transaction', () => {
			const codec = getCodecs()[EntityType.startExecute];
			const mosaicsCount = Buffer.of(0x2);
			const superContract = createByteArray(0x01);
			const functionSize = Buffer.of(0x4);
			const dataSize = Buffer.of(0x6, 0x0);
			const mosaicId1 = Buffer.of(0x02, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0);
			const mosaicAmount1 = Buffer.of(0x03, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0);
			const mosaicId2 = Buffer.of(0x04, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0);
			const mosaicAmount2 = Buffer.of(0x05, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0);
			const functionName = Buffer.of(0x6, 0x7, 0x8, 0x9);
			const data = Buffer.of(0xA, 0xB, 0xC, 0xD, 0xE, 0xF);

			test.binary.test.addAll(codec, 1 + 32 + 1 + 2 + 2 * (8 + 8) + 4 + 6, () => ({
				buffer: Buffer.concat([
					mosaicsCount,
					superContract,
					functionSize,
					dataSize,
					mosaicId1,
					mosaicAmount1,
					mosaicId2,
					mosaicAmount2,
					functionName,
					data,
				]),
				object: {
					mosaicsCount: 2,
					superContract,
					functionSize: 4,
					dataSize: 6,
					mosaics: [
						{
							id: [0x2, 0x0],
							amount: [0x3, 0x0]
						},
						{
							id: [0x4, 0x0],
							amount: [0x5, 0x0]
						}
					],
					function: functionName,
					data,
				}
			}));
		});

		describe('supports end execute transaction', () => {
			const codec = getCodecs()[EntityType.endExecute];
			const mosaicsCount = Buffer.of(0x2);
			const operationToken = createByteArray(0x01);
			const result = Buffer.of(0x6, 0x0);
			const mosaicId1 = Buffer.of(0x02, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0);
			const mosaicAmount1 = Buffer.of(0x03, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0);
			const mosaicId2 = Buffer.of(0x04, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0);
			const mosaicAmount2 = Buffer.of(0x05, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0);

			test.binary.test.addAll(codec, 1 + 32 + 2 + 2 * (8 + 8), () => ({
				buffer: Buffer.concat([
					mosaicsCount,
					operationToken,
					result,
					mosaicId1,
					mosaicAmount1,
					mosaicId2,
					mosaicAmount2,
				]),
				object: {
					mosaicsCount: 2,
					operationToken,
					result: 6,
					mosaics: [
						{
							id: [0x2, 0x0],
							amount: [0x3, 0x0]
						},
						{
							id: [0x4, 0x0],
							amount: [0x5, 0x0]
						}
					],
				}
			}));
		});

		describe('supports upload file transaction', () => {
			const codec = getCodecs()[EntityType.uploadFile];
			const driveKey = createByteArray(0x01);
			const rootHash = createByteArray(0x02);
			const xorRootHash = createByteArray(0x03);
			const addActionsCount = Buffer.of(0x02, 0x0);
			const addedFileHash1 = createByteArray(0x04);
			const addedFileSize1 = Buffer.of(0x05, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0);
			const addedFileHash2 = createByteArray(0x06);
			const addedFileSize2 = Buffer.of(0x07, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0);
			const removeActionsCount = Buffer.of(0x03, 0x0);
			const removedFileHash1 = createByteArray(0x08);
			const removedFileSize1 = Buffer.of(0x09, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0);
			const removedFileHash2 = createByteArray(0x0A);
			const removedFileSize2 = Buffer.of(0x0B, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0);
			const removedFileHash3 = createByteArray(0x0C);
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
	});
});
