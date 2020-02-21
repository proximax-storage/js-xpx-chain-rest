/**
 *** Copyright 2019 ProximaX Limited. All rights reserved.
 *** Use of this source code is governed by the Apache 2.0
 *** license that can be found in the LICENSE file.
 * */

const EntityType = require('../../src/model/EntityType');
const ModelSchemaBuilder = require('../../src/model/ModelSchemaBuilder');
const test = require('../binaryTestUtils');
const { expect } = require('chai');

const operationPlugin = require('../../src/plugins/operation');

describe('operation plugin', () => {
	describe('register schema', () => {
		it('adds operation system schema', () => {
			// Arrange:
			const builder = new ModelSchemaBuilder();
			const numDefaultKeys = Object.keys(builder.build()).length;

			// Act:
			operationPlugin.registerSchema(builder);
			const modelSchema = builder.build();

			// Assert:
			expect(Object.keys(modelSchema).length).to.equal(numDefaultKeys + 6);
			expect(modelSchema).to.contain.all.keys([
				'operationIdentify',
				'startOperation',
				'endOperation',
				'operation.mosaic',
				'operationEntry',
				'operation',
			]);

			expect(Object.keys(modelSchema.operationIdentify).length).to.equal(Object.keys(modelSchema.transaction).length + 1);
			expect(modelSchema.operationIdentify).to.contain.all.keys([
				'operationToken',
			]);

			expect(Object.keys(modelSchema.startOperation).length).to.equal(Object.keys(modelSchema.transaction).length + 4);
			expect(modelSchema.startOperation).to.contain.all.keys([
				'operationToken',
				'duration',
				'mosaics',
				'executors',
			]);

			expect(Object.keys(modelSchema.endOperation).length).to.equal(Object.keys(modelSchema.transaction).length + 2);
			expect(modelSchema.endOperation).to.contain.all.keys([
				'operationToken',
				'mosaics',
			]);

			expect(Object.keys(modelSchema['operation.mosaic']).length).to.equal(2);
			expect(modelSchema['operation.mosaic']).to.contain.all.keys([
				'id',
				'amount',
			]);

			expect(Object.keys(modelSchema['operationEntry']).length).to.equal(1);
			expect(modelSchema['operationEntry']).to.contain.all.keys([
				'operation',
			]);

			expect(Object.keys(modelSchema['operation']).length).to.equal(8);
			expect(modelSchema['operation']).to.contain.all.keys([
				'account',
				'accountAddress',
				'height',
				'mosaics',
				'token',
				'result',
				'executors',
				'transactionHashes',
			]);
		});
	});

	describe('register codecs', () => {
		const getCodecs = () => {
			const codecs = {};
			operationPlugin.registerCodecs({
				addTransactionSupport: (type, codec) => { codecs[type] = codec; }
			});

			return codecs;
		};

		const createByteArray = (number) => {
			const hash = new Uint8Array(32);
			hash[0] = number;

			return hash;
		};

		it('adds operation codec', () => {
			// Act:
			const codecs = getCodecs();

			// Assert: codec was registered
			expect(Object.keys(codecs).length).to.equal(3);
			expect(codecs).to.contain.all.keys([
				EntityType.operationIdentify.toString(),
				EntityType.startOperation.toString(),
				EntityType.endOperation.toString(),
			]);
		});

		describe('supports operation identify transaction', () => {
			const codec = getCodecs()[EntityType.operationIdentify];
			const operationToken = createByteArray(0x01);

			test.binary.test.addAll(codec, 32, () => ({
				buffer: Buffer.concat([
					operationToken,
				]),
				object: {
					operationToken,
				}
			}));
		});

		describe('supports start operation transaction', () => {
			const codec = getCodecs()[EntityType.startOperation];
			const mosaicCount = Buffer.of(0x2);
			const operationToken = createByteArray(0x01);
			const duration = Buffer.of(0x2, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0);
			const executorCount = Buffer.of(0x3);
			const mosaicId1 = Buffer.of(0x02, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0);
			const mosaicAmount1 = Buffer.of(0x03, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0);
			const mosaicId2 = Buffer.of(0x04, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0);
			const mosaicAmount2 = Buffer.of(0x05, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0);
			const executor1 = createByteArray(0x06);
			const executor2 = createByteArray(0x07);
			const executor3 = createByteArray(0x08);

			test.binary.test.addAll(codec, 1 + 32 + 8 + 1 + 2 * (8 + 8) + 3 * 32, () => ({
				buffer: Buffer.concat([
					mosaicCount,
					operationToken,
					duration,
					executorCount,
					mosaicId1,
					mosaicAmount1,
					mosaicId2,
					mosaicAmount2,
					executor1,
					executor2,
					executor3,
				]),
				object: {
					mosaicCount: 2,
					operationToken,
					duration: [0x2, 0x0],
					executorCount: 3,
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
					executors: [executor1, executor2, executor3],
				}
			}));
		});

		describe('supports end operation transaction', () => {
			const codec = getCodecs()[EntityType.endOperation];
			const mosaicCount = Buffer.of(0x2);
			const operationToken = createByteArray(0x01);
			const result = Buffer.of(0x6, 0x0);
			const mosaicId1 = Buffer.of(0x02, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0);
			const mosaicAmount1 = Buffer.of(0x03, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0);
			const mosaicId2 = Buffer.of(0x04, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0);
			const mosaicAmount2 = Buffer.of(0x05, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0);

			test.binary.test.addAll(codec, 1 + 32 + 2 + 2 * (8 + 8), () => ({
				buffer: Buffer.concat([
					mosaicCount,
					operationToken,
					result,
					mosaicId1,
					mosaicAmount1,
					mosaicId2,
					mosaicAmount2,
				]),
				object: {
					mosaicCount: 2,
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
	});
});
