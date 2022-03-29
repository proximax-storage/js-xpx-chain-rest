/**
 *** Copyright 2019 ProximaX Limited. All rights reserved.
 *** Use of this source code is governed by the Apache 2.0
 *** license that can be found in the LICENSE file.
 * */

const EntityType = require('../../src/model/EntityType');
const ModelSchemaBuilder = require('../../src/model/ModelSchemaBuilder');
const test = require('../binaryTestUtils');
const { expect } = require('chai');

const lockFundPlugin = require('../../src/plugins/lockfund');

const constants = {
	sizes: {
		lockFundTransfer: 8+1+1,
		lockFundCancel: 8,
		mosaics: 0x50
	}
};

describe('lockfund plugin', () => {
	describe('register schema', () => {
		it('adds supercontract system schema', () => {
			// Arrange:
			const builder = new ModelSchemaBuilder();
			const numDefaultKeys = Object.keys(builder.build()).length;

			// Act:
			lockFundPlugin.registerSchema(builder);
			const modelSchema = builder.build();

			// Assert:
			expect(Object.keys(modelSchema).length).to.equal(numDefaultKeys + 9);
			expect(modelSchema).to.contain.all.keys([
				'lockFundCancelUnlock',
				'lockFundTransfer',
				'lockFundRecordGroupEntry_height',
				'lockFundRecordGroupEntry_key',
				'inactiveRecord',
				'lockfundrecordgroup_height',
				'lockfundrecordgroup_key',
				'lockfundrecord_height',
				'lockfundrecord_key',
			]);
			expect(Object.keys(modelSchema.lockFundTransfer).length).to.equal(Object.keys(modelSchema.transaction).length + 3);
			expect(modelSchema.lockFundTransfer).to.contain.all.keys([
				'duration',
				'action',
				'mosaics',
			]);
			expect(Object.keys(modelSchema.lockFundCancelUnlock).length).to.equal(Object.keys(modelSchema.transaction).length + 1);
			expect(modelSchema.lockFundCancelUnlock).to.contain.all.keys([
				'targetHeight'
			]);

			expect(Object.keys(modelSchema['lockfundrecord_height']).length).to.equal(3);
			expect(modelSchema['lockfundrecord_height']).to.contain.all.keys([
				'key',
				'activeRecord',
				'inactiveRecords'
			]);

			expect(Object.keys(modelSchema['lockfundrecord_key']).length).to.equal(3);
			expect(modelSchema['lockfundrecord_key']).to.contain.all.keys([
				'key',
				'activeRecord',
				'inactiveRecords'
			]);

			expect(Object.keys(modelSchema['lockFundRecordGroupEntry_height']).length).to.equal(1);
			expect(modelSchema['lockFundRecordGroupEntry_height']).to.contain.all.keys([
				'lockfundrecordgroup',
			]);

			expect(Object.keys(modelSchema['lockFundRecordGroupEntry_key']).length).to.equal(1);
			expect(modelSchema['lockFundRecordGroupEntry_key']).to.contain.all.keys([
				'lockfundrecordgroup',
			]);

			expect(Object.keys(modelSchema['lockfundrecordgroup_height']).length).to.equal(2);
			expect(modelSchema['lockfundrecordgroup_height']).to.contain.all.keys([
				'identifier',
				'records',
			]);

			expect(Object.keys(modelSchema['lockfundrecordgroup_key']).length).to.equal(2);
			expect(modelSchema['lockfundrecordgroup_key']).to.contain.all.keys([
				'identifier',
				'records',
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
			lockFundPlugin.registerCodecs({
				addTransactionSupport: (type, codec) => { codecs[type] = codec; }
			});

			return codecs;
		};

		const createByteArray = (number) => {
			const hash = new Uint8Array(32);
			hash[0] = number;

			return hash;
		};

		it('adds lockfund codec', () => {
			// Act:
			const codecs = getCodecs();

			// Assert: codec was registered
			expect(Object.keys(codecs).length).to.equal(5);
			expect(codecs).to.contain.all.keys([
				EntityType.lockFundCancelUnlock.toString(),
				EntityType.lockFundTransfer.toString(),
			]);
		});

		describe('supports lock fund transfer transaction', () => {
			const codec = getCodecs()[EntityType.lockFundTransfer];

			test.binary.test.addAll(codec, constants.sizes.mosaics+constants.sizes.lockFundTransfer, () => {
				const data = {
					buffer: Buffer.from([0xED, 0x3E, 0x8A, 0xAD, 0xEC, 0xAD, 0xDA, 0x3F, 0x00,0x00]),
					object: {
						duration : [0xAD8A3EED, 0x3FDAADEC],
						action : 0,
						mosaics : [
							{ id: [0xAD8A3EED, 0x3FDAADEC], amount: [0x3C490533, 0x94AE976C] },
							{ id: [0xFEEA00A3, 0xFA5CBDDA], amount: [0x1D944B0D, 0xB151BB15] },
							{ id: [0x427264B4, 0x0011FFF1], amount: [0x8F9AD09F, 0xF887353D] },
							{ id: [0xCDFED760, 0x1AD744C6], amount: [0xA402AD6B, 0x000C9655] },
							{ id: [0x822DE012, 0xF386548E], amount: [0xA9708103, 0x2F1233FE] }
						]
					}
				};
				const Mosaics_Buffer = Buffer.from([
					0xED, 0x3E, 0x8A, 0xAD, 0xEC, 0xAD, 0xDA, 0x3F, 0x33, 0x05, 0x49, 0x3C, 0x6C, 0x97, 0xAE, 0x94,
					0xA3, 0x00, 0xEA, 0xFE, 0xDA, 0xBD, 0x5C, 0xFA, 0x0D, 0x4B, 0x94, 0x1D, 0x15, 0xBB, 0x51, 0xB1,
					0xB4, 0x64, 0x72, 0x42, 0xF1, 0xFF, 0x11, 0x00, 0x9F, 0xD0, 0x9A, 0x8F, 0x3D, 0x35, 0x87, 0xF8,
					0x60, 0xD7, 0xFE, 0xCD, 0xC6, 0x44, 0xD7, 0x1A, 0x6B, 0xAD, 0x02, 0xA4, 0x55, 0x96, 0x0C, 0x00,
					0x12, 0xE0, 0x2D, 0x82, 0x8E, 0x54, 0x86, 0xF3, 0x03, 0x81, 0x70, 0xA9, 0xFE, 0x33, 0x12, 0x2F
				]);
				data.buffer.writeUInt8(5, constants.sizes.lockFundTransfer - 1);
				data.buffer.writeUInt8(1, constants.sizes.lockFundTransfer - 2);
				data.buffer = Buffer.concat([
					data.buffer,
					Mosaics_Buffer
				]);
				return data;
			});
		});

		describe('supports lock fund cancel unlock transaction', () => {
			const codec = getCodecs()[EntityType.lockFundCancelUnlock];

			test.binary.test.addAll(codec, constants.sizes.lockFundCancel, () => ({
				buffer: Buffer.concat([
					0xED, 0x3E, 0x8A, 0xAD, 0xEC, 0xAD, 0xDA, 0x3F
				]),
				object: {
					targetHeight: [0xAD8A3EED, 0x3FDAADEC]
				}
			}));
		});
	});
});
