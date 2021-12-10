/**
 *** Copyright 2019 ProximaX Limited. All rights reserved.
 *** Use of this source code is governed by the Apache 2.0
 *** license that can be found in the LICENSE file.
 * */

const EntityType = require('../../src/model/EntityType');
const ModelSchemaBuilder = require('../../src/model/ModelSchemaBuilder');
const test = require('../binaryTestUtils');
const { expect } = require('chai');

const exchangePlugin = require('../../src/plugins/exchange');

describe('exchange plugin', () => {
	describe('register schema', () => {
		it('adds exchange system schema', () => {
			// Arrange:
			const builder = new ModelSchemaBuilder();
			const numDefaultKeys = Object.keys(builder.build()).length;

			// Act:
			exchangePlugin.registerSchema(builder);
			const modelSchema = builder.build();

			// Assert:
			expect(Object.keys(modelSchema).length).to.equal(numDefaultKeys + 12);
			expect(modelSchema).to.contain.all.keys([
				'exchangeOffer',
				'offerWithDuration',
				'exchange',
				'matchedOffer',
				'removeExchangeOffer',
				'offerMosaic',
				'exchangeEntry',
				'exchangeEntry.exchange',
				'exchangeEntry.buyOffer',
				'exchangeEntry.sellOffer',
				'offerInfo',
			]);

			expect(Object.keys(modelSchema.exchangeOffer).length).to.equal(Object.keys(modelSchema.transaction).length + 1);
			expect(modelSchema.exchangeOffer).to.contain.all.keys(['offers']);

			expect(Object.keys(modelSchema['offerWithDuration']).length).to.equal(4);
			expect(modelSchema['offerWithDuration']).to.contain.all.keys(['mosaicId', 'mosaicAmount', 'cost', 'duration']);

			expect(Object.keys(modelSchema.exchange).length).to.equal(Object.keys(modelSchema.transaction).length + 1);
			expect(modelSchema.exchange).to.contain.all.keys(['offers']);

			expect(Object.keys(modelSchema['matchedOffer']).length).to.equal(4);
			expect(modelSchema['matchedOffer']).to.contain.all.keys(['mosaicId', 'mosaicAmount', 'cost', 'owner']);

			expect(Object.keys(modelSchema.removeExchangeOffer).length).to.equal(Object.keys(modelSchema.transaction).length + 1);
			expect(modelSchema.removeExchangeOffer).to.contain.all.keys(['offers']);

			expect(Object.keys(modelSchema['offerMosaic']).length).to.equal(1);
			expect(modelSchema['offerMosaic']).to.contain.all.keys(['mosaicId']);

			expect(Object.keys(modelSchema['exchangeEntry']).length).to.equal(1);
			expect(modelSchema['exchangeEntry']).to.contain.all.keys(['exchange']);

			expect(Object.keys(modelSchema['exchangeEntry.exchange']).length).to.equal(4);
			expect(modelSchema['exchangeEntry.exchange']).to.contain.all.keys([
				'owner', 'ownerAddress', 'buyOffers', 'sellOffers']);

			expect(Object.keys(modelSchema['exchangeEntry.buyOffer']).length).to.equal(6);
			expect(modelSchema['exchangeEntry.buyOffer']).to.contain.all.keys([
				'mosaicId', 'amount', 'initialAmount', 'initialCost', 'deadline', 'residualCost']);

			expect(Object.keys(modelSchema['exchangeEntry.sellOffer']).length).to.equal(5);
			expect(modelSchema['exchangeEntry.sellOffer']).to.contain.all.keys([
				'mosaicId', 'amount', 'initialAmount', 'initialCost', 'deadline']);

			expect(Object.keys(modelSchema['offerInfo']).length).to.equal(6);
			expect(modelSchema['offerInfo']).to.contain.all.keys([
				'mosaicId', 'amount', 'initialAmount', 'initialCost', 'deadline', 'owner']);
		});
	});

	describe('register codecs', () => {
		const getCodecs = () => {
			const codecs = {};
			exchangePlugin.registerCodecs({
				addTransactionSupport: (type, codec) => { codecs[type] = codec; }
			});

			return codecs;
		};

		it('adds exchange codecs', () => {
			// Act:
			const codecs = getCodecs();

			// Assert: codec was registered
			expect(Object.keys(codecs).length).to.equal(3);
			expect(codecs).to.contain.all.keys([
				EntityType.exchangeOffer.toString(),
				EntityType.exchange.toString(),
				EntityType.removeExchangeOffer.toString()
			]);
		});

		describe('supports exchange offer transaction', () => {
			const codec = getCodecs()[EntityType.exchangeOffer];
			const offersCount = Buffer.of(0x02);
			const offers = Buffer.of(
				0x01, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0,
				0x02, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0,
				0x03, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0,
				0x04,
				0x05, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0,
				0x06, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0,
				0x07, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0,
				0x08, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0,
				0x09,
				0x0A, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0);

			test.binary.test.addAll(codec, 1 + 2 * (4 * 8 + 1), () => ({
				buffer: Buffer.concat([
					offersCount,
					offers
				]),
				object: {
					offersCount: 0x02,
					offers: [
						{
							mosaicId: [0x01, 0],
							mosaicAmount: [0x02, 0],
							cost: [0x03, 0],
							type: 0x04,
							duration: [0x05, 0]
						},
						{
							mosaicId: [0x06, 0],
							mosaicAmount: [0x07, 0],
							cost: [0x08, 0],
							type: 0x09,
							duration: [0x0A, 0]
						}
					]
				}
			}));
		});

		describe('supports exchange transaction', () => {
			const codec = getCodecs()[EntityType.exchange];
			const offersCount = Buffer.of(0x02);
			const offer1 = Buffer.of(
				0x01, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0,
				0x02, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0,
				0x03, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0,
				0x04);
			const offerOwner1 = new Uint8Array(32);
			offerOwner1[0] = 0x05;
			const offer2 = Buffer.of(
				0x06, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0,
				0x07, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0,
				0x08, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0,
				0x09);
			const offerOwner2 = new Uint8Array(32);
			offerOwner2[0] = 0x0A;

			test.binary.test.addAll(codec, 1 + 2 * (3 * 8 + 1 + 32), () => ({
				buffer: Buffer.concat([
					offersCount,
					offer1,
					offerOwner1,
					offer2,
					offerOwner2
				]),
				object: {
					offersCount: 0x02,
					offers: [
						{
							mosaicId: [0x01, 0],
							mosaicAmount: [0x02, 0],
							cost: [0x03, 0],
							type: 0x04,
							owner: offerOwner1
						},
						{
							mosaicId: [0x06, 0],
							mosaicAmount: [0x07, 0],
							cost: [0x08, 0],
							type: 0x09,
							owner: offerOwner2
						}
					]
				}
			}));
		});

		describe('supports remove exchange offer transaction', () => {
			const codec = getCodecs()[EntityType.removeExchangeOffer];
			const offersCount = Buffer.of(0x02);
			const offers = Buffer.of(
				0x01, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0,
				0x02,
				0x03, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0,
				0x04);

			test.binary.test.addAll(codec, 1 + 2 * (8 + 1), () => ({
				buffer: Buffer.concat([
					offersCount,
					offers
				]),
				object: {
					offersCount: 0x02,
					offers: [
						{
							mosaicId: [0x01, 0],
							offerType: 0x02
						},
						{
							mosaicId: [0x03, 0],
							offerType: 0x04
						}
					]
				}
			}));
		});
	});
});
