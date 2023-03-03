/**
 *** Copyright 2020 ProximaX Limited. All rights reserved.
 *** Use of this source code is governed by the Apache 2.0
 *** license that can be found in the LICENSE file.
 * */

const EntityType = require('../../src/model/EntityType');
const ModelSchemaBuilder = require('../../src/model/ModelSchemaBuilder');
const test = require('../binaryTestUtils');
const { expect } = require('chai');

const committeePlugin = require('../../src/plugins/committee');

describe('committee plugin', () => {
	describe('register schema', () => {
		it('adds committee system schema', () => {
			// Arrange:
			const builder = new ModelSchemaBuilder();
			const numDefaultKeys = Object.keys(builder.build()).length;

			// Act:
			committeePlugin.registerSchema(builder);
			const modelSchema = builder.build();

			// Assert:
			expect(Object.keys(modelSchema).length).to.equal(numDefaultKeys + 4);
			expect(modelSchema).to.contain.all.keys([
				'addHarvester',
				'removeHarvester',
				'committeeEntry',
				'harvester'
			]);

			expect(Object.keys(modelSchema['harvester']).length).to.equal(9);
			expect(modelSchema['harvester']).to.contain.all.keys([
				'key',
				'address',
				'owner',
				'disabledHeight',
				'lastSigningBlockHeight',
				'effectiveBalance',
				'canHarvest',
				'activity',
				'greed'
			]);

			expect(Object.keys(modelSchema.addHarvester).length).to.equal(Object.keys(modelSchema.transaction).length + 1);
			expect(Object.keys(modelSchema.removeHarvester).length).to.equal(Object.keys(modelSchema.transaction).length + 1);
		});
	});

	describe('register codecs', () => {
		const getCodecs = () => {
			const codecs = {};
			committeePlugin.registerCodecs({
				addTransactionSupport: (type, codec) => { codecs[type] = codec; }
			});

			return codecs;
		};

		it('adds committee codecs', () => {
			// Act:
			const codecs = getCodecs();

			// Assert: codec was registered
			expect(Object.keys(codecs).length).to.equal(2);
			expect(codecs).to.contain.all.keys([
				EntityType.addHarvester.toString(),
				EntityType.removeHarvester.toString()
			]);
		});

		describe('supports add harvester transaction', () => {
			const codec = getCodecs()[EntityType.addHarvester];
			const harvesterKey = Buffer.of(
				0x77, 0xBE, 0xE1, 0xCA, 0xD0, 0x8E, 0x6E, 0x48, 0x95, 0xE8, 0x18, 0xB2, 0x7B, 0xD8, 0xFA, 0xC9,
				0x47, 0x0D, 0xB8, 0xFD, 0x2D, 0x81, 0x47, 0x6A, 0xC5, 0x61, 0xA4, 0xCE, 0xE1, 0x81, 0x40, 0x83
			);
			test.binary.test.addAll(codec, 32, () => ({
				buffer: Buffer.concat([
					harvesterKey,
				]),
				object: {
					harvesterKey,
				}
			}));
		});

		describe('supports remove harvester transaction', () => {
			const codec = getCodecs()[EntityType.removeHarvester];
			const harvesterKey = Buffer.of(
				0x77, 0xBE, 0xE1, 0xCA, 0xD0, 0x8E, 0x6E, 0x48, 0x95, 0xE8, 0x18, 0xB2, 0x7B, 0xD8, 0xFA, 0xC9,
				0x47, 0x0D, 0xB8, 0xFD, 0x2D, 0x81, 0x47, 0x6A, 0xC5, 0x61, 0xA4, 0xCE, 0xE1, 0x81, 0x40, 0x83
			);
			test.binary.test.addAll(codec, 32, () => ({
				buffer: Buffer.concat([
					harvesterKey,
				]),
				object: {
					harvesterKey,
				}
			}));
		});
	});
});
