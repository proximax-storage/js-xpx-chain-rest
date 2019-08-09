/**
 *** Copyright 2019 ProximaX Limited. All rights reserved.
 *** Use of this source code is governed by the Apache 2.0
 *** license that can be found in the LICENSE file.
 * */

const EntityType = require('../../src/model/EntityType');
const ModelSchemaBuilder = require('../../src/model/ModelSchemaBuilder');
const test = require('../binaryTestUtils');
const { expect } = require('chai');

const configPlugin = require('../../src/plugins/config');

describe('config plugin', () => {
	describe('register schema', () => {
		it('adds config system schema', () => {
			// Arrange:
			const builder = new ModelSchemaBuilder();
			const numDefaultKeys = Object.keys(builder.build()).length;

			// Act:
			configPlugin.registerSchema(builder);
			const modelSchema = builder.build();

			// Assert:
			expect(Object.keys(modelSchema).length).to.equal(numDefaultKeys + 3);
			expect(modelSchema).to.contain.all.keys(['catapultConfig', 'catapultConfigEntry', 'catapultConfigEntry.height']);

			expect(Object.keys(modelSchema['catapultConfigEntry.height']).length).to.equal(3);
			expect(modelSchema['catapultConfigEntry.height'])
				.to.contain.all.keys(['height', 'blockChainConfig', 'supportedEntityVersions']);

			// - config
			expect(Object.keys(modelSchema.catapultConfig).length).to.equal(Object.keys(modelSchema.transaction).length + 3);
			expect(modelSchema.catapultConfig).to.contain.all.keys(['applyHeightDelta', 'blockChainConfig', 'supportedEntityVersions']);
		});
	});

	describe('register codecs', () => {
		const getCodecs = () => {
			const codecs = {};
			configPlugin.registerCodecs({
				addTransactionSupport: (type, codec) => { codecs[type] = codec; }
			});

			return codecs;
		};

		it('adds config codec', () => {
			// Act:
			const codecs = getCodecs();

			// Assert: codec was registered
			expect(Object.keys(codecs).length).to.equal(1);
			expect(codecs).to.contain.all.keys([EntityType.catapultConfig.toString()]);
		});

		const codec = getCodecs()[EntityType.catapultConfig];

		describe('supports config transaction', () => {
			const applyHeightDelta = Buffer.of(0x77, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0);
			const blockChainConfigSize = Buffer.of(0x06, 0x00);
			const supportedEntityVersionsSize = Buffer.of(0x05, 0x00);
			const blockChainConfig = Buffer.of(0x47, 0x0D, 0xB8, 0xFD, 0x2D, 0x81);
			const supportedEntityVersions = Buffer.of(0xCE, 0xE1, 0x81, 0x40, 0x83);

			test.binary.test.addAll(codec, 8 + 2 + 2 + 6 + 5, () => ({
				buffer: Buffer.concat([
					applyHeightDelta,
					blockChainConfigSize,
					supportedEntityVersionsSize,
					blockChainConfig,
					supportedEntityVersions
				]),
				object: {
					applyHeightDelta: [119, 0],
					blockChainConfigSize: 0x06,
					supportedEntityVersionsSize: 0x05,
					blockChainConfig,
					supportedEntityVersions
				}
			}));
		});
	});
});
