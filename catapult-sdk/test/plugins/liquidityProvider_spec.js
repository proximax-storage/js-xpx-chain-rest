/**
 *** Copyright 2022 ProximaX Limited. All rights reserved.
 *** Use of this source code is governed by the Apache 2.0
 *** license that can be found in the LICENSE file.
 * */

const EntityType = require('../../src/model/EntityType');
const ModelSchemaBuilder = require('../../src/model/ModelSchemaBuilder');
const test = require('../binaryTestUtils');
const { expect } = require('chai');

const liquidityProviderPlugin = require('../../src/plugins/liquidityProvider');

describe('liquidity provider plugin', () => {
	describe('register schema', () => {
		it('adds liquidity provider system schema', () => {
			// Arrange:
			const builder = new ModelSchemaBuilder();
			const numDefaultKeys = Object.keys(builder.build()).length;

			// Act:
			liquidityProviderPlugin.registerSchema(builder);
			const modelSchema = builder.build();

			// Assert:
			expect(Object.keys(modelSchema).length).to.equal(numDefaultKeys + 2);
			expect(modelSchema).to.contain.all.keys([
				'createLiquidityProvider',
				'manualRateChange',
			]);

			expect(Object.keys(modelSchema.createLiquidityProvider).length).to.equal(Object.keys(modelSchema.transaction).length + 8);
			expect(modelSchema.createLiquidityProvider).to.contain.all.keys([
				'providerMosaicId',
				'currencyDeposit',
				'initialMosaicsMinting',
				'slashingPeriod',
				'windowSize',
				'slashingAccount',
				'alpha',
				'beta',
			]);

			expect(Object.keys(modelSchema.manualRateChange).length).to.equal(Object.keys(modelSchema.transaction).length + 5);
			expect(modelSchema.manualRateChange).to.contain.all.keys([
				'providerMosaicId',
				'currencyBalanceIncrease',
				'currencyBalanceChange',
				'mosaicBalanceIncrease',
				'mosaicBalanceChange',
			]);
		});
	});

	describe('register codecs', () => {
		const getCodecs = () => {
			const codecs = {};
			liquidityProviderPlugin.registerCodecs({
				addTransactionSupport: (type, codec) => { codecs[type] = codec; }
			});

			return codecs;
		};

		it('adds liquidity provider codecs', () => {
			// Act:
			const codecs = getCodecs();

			// Assert: codec was registered
			expect(Object.keys(codecs).length).to.equal(2);
			expect(codecs).to.contain.all.keys([
				EntityType.createLiquidityProvider.toString(),
				EntityType.manualRateChange.toString(),
			]);
		});

		const createByteArray = (number, size = 32) => {
			const hash = new Uint8Array(size);
			hash[0] = number;

			return hash;
		};

		describe('supports create liquidity provider transaction', () => {
			const codec = getCodecs()[EntityType.createLiquidityProvider];
			const providerMosaicId = Buffer.of(0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00);
			const currencyDeposit = Buffer.of(0x02, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00);
			const initialMosaicsMinting = Buffer.of(0x03, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00);
			const slashingPeriod = Buffer.of(0x04, 0x00, 0x00, 0x00);
			const windowSize = Buffer.of(0x05, 0x00);
			const slashingAccount = createByteArray(0x06);
			const alpha = Buffer.of(0x07, 0x00, 0x00, 0x00);
			const beta = Buffer.of(0x08, 0x00, 0x00, 0x00);

			test.binary.test.addAll(codec, 3 * 8 + 4 + 2 + 32 + 2 * 4, () => ({
				buffer: Buffer.concat([
					providerMosaicId,
					currencyDeposit,
					initialMosaicsMinting,
					slashingPeriod,
					windowSize,
					slashingAccount,
					alpha,
					beta,
				]),
				object: {
					providerMosaicId: [0x01, 0x00],
					currencyDeposit: [0x02, 0x00],
					initialMosaicsMinting: [0x03, 0x00],
					slashingPeriod: 0x04,
					windowSize: 0x05,
					slashingAccount,
					alpha: 0x07,
					beta: 0x08,
				}
			}));
		});

		describe('supports manual rate change transaction', () => {
			const codec = getCodecs()[EntityType.manualRateChange];
			const providerMosaicId = Buffer.of(0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00);
			const currencyBalanceIncrease = Buffer.of(0x02);
			const currencyBalanceChange = Buffer.of(0x03, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00);
			const mosaicBalanceIncrease = Buffer.of(0x04);
			const mosaicBalanceChange = Buffer.of(0x05, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00);

			test.binary.test.addAll(codec, 8 + 1 + 8 + 1 + 8, () => ({
				buffer: Buffer.concat([
					providerMosaicId,
					currencyBalanceIncrease,
					currencyBalanceChange,
					mosaicBalanceIncrease,
					mosaicBalanceChange,
				]),
				object: {
					providerMosaicId: [0x01, 0x00],
					currencyBalanceIncrease: 0x02,
					currencyBalanceChange: [0x03, 0x0],
					mosaicBalanceIncrease: 0x04,
					mosaicBalanceChange: [0x05, 0x0],
				}
			}));
		});
	});
});
