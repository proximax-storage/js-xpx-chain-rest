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

			expect(Object.keys(modelSchema['harvester']).length).to.equal(6);
			expect(modelSchema['harvester']).to.contain.all.keys([
				'key',
				'lastSigningBlockHeight',
				'effectiveBalance',
				'canHarvest',
				'activity',
				'greed'
			]);

			expect(Object.keys(modelSchema.addHarvester).length).to.equal(Object.keys(modelSchema.transaction).length);
			expect(Object.keys(modelSchema.removeHarvester).length).to.equal(Object.keys(modelSchema.transaction).length);
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
			test.binary.test.addAll(codec, 0, () => ({
				buffer: Buffer.alloc(0),
				object: {}
			}));
		});

		describe('supports remove harvester transaction', () => {
			const codec = getCodecs()[EntityType.removeHarvester];
			test.binary.test.addAll(codec, 0, () => ({
				buffer: Buffer.alloc(0),
				object: {}
			}));
		});
	});
});
