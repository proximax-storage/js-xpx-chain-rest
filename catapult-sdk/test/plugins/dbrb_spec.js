/**
 *** Copyright 2023 ProximaX Limited. All rights reserved.
 *** Use of this source code is governed by the Apache 2.0
 *** license that can be found in the LICENSE file.
 * */

const EntityType = require('../../src/model/EntityType');
const ModelSchemaBuilder = require('../../src/model/ModelSchemaBuilder');
const test = require('../binaryTestUtils');
const { expect } = require('chai');

const dbrbPlugin = require('../../src/plugins/dbrb');
const { uint16 } = require('../../src/model/ModelType');
const { signature } = require('../../src/modelBinary/sizes');

describe('dbrb plugin', () => {
	describe('register schema', () => {
		it('adds dbrb system schema', () => {
			// Arrange:
			const builder = new ModelSchemaBuilder();
			const numDefaultKeys = Object.keys(builder.build()).length;

			// Act:
			dbrbPlugin.registerSchema(builder);
			const modelSchema = builder.build();

			// Assert:
			expect(Object.keys(modelSchema).length).to.equal(numDefaultKeys + 4);
			expect(modelSchema).to.contain.all.keys([
				'installMessage',
				'sequenceEntry',
				'viewEntry',
				'certificateEntry',
			]);

			expect(Object.keys(modelSchema.installMessage).length).to.equal(Object.keys(modelSchema.transaction).length + 3);
			expect(modelSchema.installMessage).to.contain.all.keys([
				'messageHash',
				'sequence',
				'certificate',
			]);
		});
	});

	describe('register codecs', () => {
		const getCodecs = () => {
			const codecs = {};
			dbrbPlugin.registerCodecs({
				addTransactionSupport: (type, codec) => { codecs[type] = codec; }
			});

			return codecs;
		};

		it('adds dbrb codecs', () => {
			// Act:
			const codecs = getCodecs();

			// Assert: codec was registered
			expect(Object.keys(codecs).length).to.equal(1);
			expect(codecs).to.contain.all.keys([
				EntityType.installMessage.toString(),
			]);
		});

		const createByteArray = (number, size = 32) => {
			const hash = new Uint8Array(size);
			hash[0] = number;

			return hash;
		};

		describe('supports install message transaction', () => {
			const codec = getCodecs()[EntityType.installMessage];
			const messageHash = createByteArray(0x01, 32);
			const payloadSize = Buffer.of(0x0DC, 0x00, 0x00, 0x00);
			const sequenceSize = Buffer.of(0x02, 0x00 , 0x00, 0x00);

			const viewSize1 = Buffer.of(0x01, 0x00 , 0x00, 0x00);
			const processId1 = createByteArray(0x01, 32);
			const membershipChange1 = Buffer.of(0x00, 0x00 , 0x00, 0x00);

			const viewSize2 = Buffer.of(0x02, 0x00 , 0x00, 0x00);
			const processId2 = createByteArray(0x02, 32);
			const membershipChange2 = Buffer.of(0x01, 0x00 , 0x00, 0x00);

			const processId3 = createByteArray(0x03, 32);
			const membershipChange3 = Buffer.of(0x00, 0x00 , 0x00, 0x00);

			const certificateSize = Buffer.of(0x01, 0x00 , 0x00, 0x00);

			const processId4 = createByteArray(0x04, 32);
			const signature1 = createByteArray(0x01, 64);

			test.binary.test.addAll(codec, 32 + 4 + 120 + 4 + 32 + 64, () => ({
				buffer: Buffer.concat([
					messageHash,
					payloadSize,
					sequenceSize,
					viewSize1,
					processId1,
					membershipChange1,
					viewSize2,
					processId2,
					membershipChange2,
					processId3,
					membershipChange3,
					certificateSize,
					processId4,
					signature1,
				]),
				object: {
					messageHash: messageHash,
					payloadSize: 220,
					sequenceSize: 2, // 120
					sequence: [
						[
							{
								processId: processId1,
								membershipChange: 0x00
							}
						],
						[
							{
								processId: processId2,
								membershipChange: 0x01
							},
							{
								processId: processId3,
								membershipChange: 0x00
							}
						]
					],
					certificateSize: 1,
					certificate: [
						{
							processId: processId4,
							signature: signature1
						}
					],
				}
			}));
		});
	});
});
