/**
 *** Copyright 2019 ProximaX Limited. All rights reserved.
 *** Use of this source code is governed by the Apache 2.0
 *** license that can be found in the LICENSE file.
 * */

const EntityType = require('../../src/model/EntityType');
const ModelSchemaBuilder = require('../../src/model/ModelSchemaBuilder');
const test = require('../binaryTestUtils');
const { expect } = require('chai');

const upgradePlugin = require('../../src/plugins/upgrade');

describe('upgrade plugin', () => {
	describe('register schema', () => {
		it('adds upgrade system schema', () => {
			// Arrange:
			const builder = new ModelSchemaBuilder();
			const numDefaultKeys = Object.keys(builder.build()).length;

			// Act:
			upgradePlugin.registerSchema(builder);
			const modelSchema = builder.build();

			// Assert:
			expect(Object.keys(modelSchema).length).to.equal(numDefaultKeys + 4);
			expect(modelSchema).to.contain.all.keys(['blockchainUpgrade', 'accountV2Upgrade','blockchainUpgradeEntry', 'blockchainUpgrade.height']);

			expect(Object.keys(modelSchema['blockchainUpgrade.height']).length).to.equal(2);
			expect(modelSchema['blockchainUpgrade.height'])
				.to.contain.all.keys(['height', 'blockChainVersion']);

			// - upgrade
			expect(Object.keys(modelSchema.blockchainUpgrade).length).to.equal(Object.keys(modelSchema.transaction).length + 2);
			expect(modelSchema.blockchainUpgrade).to.contain.all.keys(['upgradePeriod', 'newBlockchainVersion']);

			// - account V2 upgrade
			expect(Object.keys(modelSchema.accountV2Upgrade).length).to.equal(Object.keys(modelSchema.transaction).length + 1);
			expect(modelSchema.accountV2Upgrade).to.contain.all.keys(['newAccountPublicKey']);
		});
	});

	describe('register codecs', () => {
		const getCodecs = () => {
			const codecs = {};
			upgradePlugin.registerCodecs({
				addTransactionSupport: (type, codec) => { codecs[type] = codec; }
			});

			return codecs;
		};

		it('adds upgrade codec', () => {
			// Act:
			const codecs = getCodecs();

			// Assert: codec was registered
			expect(Object.keys(codecs).length).to.equal(2);
			expect(codecs).to.contain.all.keys([EntityType.blockchainUpgrade.toString(), EntityType.accountV2Upgrade.toString()]);
		});

		const codec = getCodecs()[EntityType.blockchainUpgrade];

		describe('supports upgrade transaction', () => {
			const upgradePeriod = Buffer.of(0x0, 0x0, 0x0, 0x0, 0x77, 0x0, 0x0, 0x0);
			const newBlockchainVersion = Buffer.of(0x00, 0x0, 0x0, 0x0, 0x4, 0x0, 0x0, 0x0);

			test.binary.test.addAll(codec, 8 + 8, () => ({
				buffer: Buffer.concat([
					upgradePeriod,
					newBlockchainVersion
				]),
				object: {
					upgradePeriod: [0, 119],
					newBlockchainVersion: [0, 4]
				}
			}));
		});

		describe('supports account V2 upgrade transaction', () => {
			const Key_Buffer = Buffer.from(test.random.bytes(test.constants.sizes.signer));

			test.binary.test.addAll(getCodecs()[EntityType.accountV2Upgrade], 32, () => ({
				buffer: Buffer.concat([
					Key_Buffer,
				]),

				object: {
					newAccountPublicKey: Key_Buffer
				}
			}));
		});
	});
});
