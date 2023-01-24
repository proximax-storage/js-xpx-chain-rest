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
			expect(Object.keys(modelSchema).length).to.equal(numDefaultKeys + 1);
			expect(modelSchema).to.contain.all.keys([
				'installMessage',
			]);

			expect(Object.keys(modelSchema.installMessage).length).to.equal(Object.keys(modelSchema.transaction).length + 9);
			expect(modelSchema.installMessage).to.contain.all.keys([
				'messageHash',
				'viewsCount',
				'mostRecentViewSize',
				'signaturesCount',
				'viewSizes',
				'viewProcessIds',
				'membershipChanges',
				'signaturesProcessIds',
				'signatures',
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
			const msgHash = createByteArray(0x01, 32);
			const messageHash = msgHash;
			const viewsCount = Buffer.of(0x03, 0x00, 0x00, 0x00);
			const mostRecentViewSize = Buffer.of(0x03, 0x00, 0x00, 0x00);
			const signaturesCount = Buffer.of(0x03, 0x00, 0x00, 0x00);
			const viewSizes = Buffer.of(0x04, 0x00 , 0x04, 0x00, 0x04, 0x00);
			const membershipChanges = Buffer.of(0x01, 0x01 , 0x01);

			const viewProcessId1 = createByteArray(0x05, 32);
			const viewProcessId2 = createByteArray(0x06, 32);
			const viewProcessId3 = createByteArray(0x07, 32);

			const signaturesProcessId1 = createByteArray(0x05, 32);
			const signaturesProcessId2 = createByteArray(0x06, 32);
			const signaturesProcessId3 = createByteArray(0x07, 32);

			const signature1 = createByteArray(0x05, 64);
			const signature2 = createByteArray(0x06, 64);
			const signature3 = createByteArray(0x07, 64);

			test.binary.test.addAll(codec, 32 + 3 * 4 + 2 * 3 + 32 * 3 + 3 + 32 * 3 + 64 * 3, () => ({
				buffer: Buffer.concat([
					messageHash,
					viewsCount,
					mostRecentViewSize,
					signaturesCount,
					viewSizes,
					viewProcessId1,
					viewProcessId2,
					viewProcessId3,
					membershipChanges,
					signaturesProcessId1,
					signaturesProcessId2,
					signaturesProcessId3,
					signature1,
					signature2,
					signature3
				]),
				object: {
					messageHash: msgHash,
					viewsCount: 0x03,
					mostRecentViewSize: 0x03,
					signaturesCount: 0x03,
					viewSizes: [0x04, 0x04, 0x04],
					viewProcessIds: [viewProcessId1, viewProcessId2, viewProcessId3],
					membershipChanges: [0x01, 0x01, 0x01],
					signaturesProcessIds: [signaturesProcessId1, signaturesProcessId2, signaturesProcessId3],
					signatures: [signature1, signature2, signature3]
				}
			}));
		});
	});
});
