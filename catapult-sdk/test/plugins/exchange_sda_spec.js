/**
 *** Copyright 2022 ProximaX Limited. All rights reserved.
 *** Use of this source code is governed by the Apache 2.0
 *** license that can be found in the LICENSE file.
 **/

const EntityType = require('../../src/model/EntityType');
const ModelSchemaBuilder = require('../../src/model/ModelSchemaBuilder');
const test = require('../binaryTestUtils');
const { expect } = require('chai');

const exchangeSdaPlugin = require('../../src/plugins/exchange_sda');
const { object } = require('../../src/utils/SchemaType');

describe('exchange sda plugin', () => {
    describe('register schema', () => {
        it('adds exchange sda system schema', () => {
            // Arrange:
            const builder = new ModelSchemaBuilder();
            const numDefaultKeys = Object.keys(builder.build()).length;

            // Act:
            exchangeSdaPlugin.registerSchema(builder);
            const modelSchema = builder.build();

            // Assert:
            expect(Object.keys(modelSchema).length).to.equal(numDefaultKeys + 10);
            expect(modelSchema).to.contain.all.keys([
                'placeSdaExchangeOffer',
                'sdaOfferWithDuration',
                'removeSdaExchangeOffer',
                'sdaOfferMosaic',
                'sdaExchangeEntry',
                'sdaExchangeEntry.exchangesda',
                'sdaExchangeEntry.sdaOfferBalances',
                'sdaOfferGroupEntry',
                'sdaOfferGroupEntry.sdaoffergroups',
                'sdaOfferGroupEntry.sdaOfferGroup',
            ]);

            expect(Object.keys(modelSchema.placeSdaExchangeOffer).length).to.equal(Object.keys(modelSchema.transaction).length + 1);
            expect(modelSchema.placeSdaExchangeOffer).to.contain.all.keys(['offers']);

            expect(Object.keys(modelSchema['sdaOfferWithDuration']).length).to.equal(5);
            expect(modelSchema['sdaOfferWithDuration']).to.contain.all.keys(['mosaicIdGive', 'mosaicAmountGive', 'mosaicIdGet', 'mosaicAmountGet', 'duration']);

            expect(Object.keys(modelSchema.removeSdaExchangeOffer).length).to.equal(Object.keys(modelSchema.transaction).length + 1);
            expect(modelSchema.removeSdaExchangeOffer).to.contain.all.keys(['offers']);

            expect(Object.keys(modelSchema['sdaOfferMosaic']).length).to.equal(2);
            expect(modelSchema['sdaOfferMosaic']).to.contain.all.keys(['mosaicIdGive', 'mosaicIdGet']);

            expect(Object.keys(modelSchema['sdaExchangeEntry']).length).to.equal(1);
            expect(modelSchema['sdaExchangeEntry']).to.contain.all.keys(['exchangesda']);

            expect(Object.keys(modelSchema['sdaExchangeEntry.exchangesda']).length).to.equal(3);
            expect(modelSchema['sdaExchangeEntry.exchangesda']).to.contain.all.keys(['owner', 'ownerAddress', 'sdaOfferBalances']);

            expect(Object.keys(modelSchema['sdaExchangeEntry.sdaOfferBalances']).length).to.equal(8);
            expect(modelSchema['sdaExchangeEntry.sdaOfferBalances']).to.contain.all.keys(['mosaicIdGive', 'mosaicIdGet', 'currentMosaicGiveAmount', 'currentMosaicGetAmount', 'initialMosaicGiveAmount', 'initialMosaicGetAmount', 'deadline', 'owner']);

            expect(Object.keys(modelSchema['sdaOfferGroupEntry']).length).to.equal(2);
            expect(modelSchema['sdaOfferGroupEntry']).to.contain.all.keys(['sdaoffergroups', 'groupHash']);

            expect(Object.keys(modelSchema['sdaOfferGroupEntry.sdaoffergroups']).length).to.equal(1);
            expect(modelSchema['sdaOfferGroupEntry.sdaoffergroups']).to.contain.all.keys(['sdaOfferGroup']);

            expect(Object.keys(modelSchema['sdaOfferGroupEntry.sdaOfferGroup']).length).to.equal(3);
            expect(modelSchema['sdaOfferGroupEntry.sdaOfferGroup']).to.contain.all.keys(['owner', 'mosaicGiveAmount', 'deadline']);
        });
    });

    describe('register codecs', () => {
        const getCodecs = () => {
            const codecs = {};
            exchangeSdaPlugin.registerCodecs({
                addTransactionSupport: (type, codec) => { codecs[type] = codec; }
            });

            return codecs;
        };

        it('adds exchange sda codecs', () => {
            // Act:
            const codecs = getCodecs();

            // Assert: codec was registered
            expect(Object.keys(codecs).length).to.equal(2);
            expect(codecs).to.contain.all.keys([
                EntityType.placeSdaExchangeOffer.toString(),
                EntityType.removeSdaExchangeOffer.toString()
            ]);
        });

        describe('supports place sda exchange offer transaction', () => {
            const codec = getCodecs()[EntityType.placeSdaExchangeOffer];
            const sdaOffersCount = Buffer.of(0x02);
            const sdaOffer1 = Buffer.of(
                0x01, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0,
                0x02, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0,
                0x03, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0,
                0x04, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0);
            const sdaOfferDuration1 = Buffer.of(0x5, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0);
            const sdaOffer2 = Buffer.of(
                0x06, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0,
                0x07, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0,
                0x08, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0,
                0x09, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0);
            const sdaOfferDuration2 = Buffer.of(0xA, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0);

            test.binary.test.addAll(codec, 1 + 2 * (5 * 8), () => ({
                buffer: Buffer.concat([
                    sdaOffersCount,
                    sdaOffer1,
                    sdaOfferDuration1,
                    sdaOffer2,
                    sdaOfferDuration2
                ]),
                object: {
                    sdaOffersCount: 0x02,
                    offers: [
                        {
                            mosaicIdGive: [0x01, 0],
                            mosaicAmountGive: [0x02, 0],
                            mosaicIdGet: [0x03, 0],
                            mosaicAmountGet: [0x04, 0],
                            duration: [0x05, 0]
                        },
                        {
                            mosaicIdGive: [0x06, 0],
                            mosaicAmountGive: [0x07, 0],
                            mosaicIdGet: [0x08, 0],
                            mosaicAmountGet: [0x09, 0],
                            duration: [0x0A, 0]
                        }
                    ]
                }
            }));
        });

        describe('supports remove sda exchange offer transaction', () => {
            const codec = getCodecs()[EntityType.removeSdaExchangeOffer];
            const sdaOffersCount = Buffer.of(0x02);
            const sdaOffers = Buffer.of(
                0x01, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0,
                0x02, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0,
                0x03, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0,
                0x04, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0);

            test.binary.test.addAll(codec, 1 + 2 * (2 * 8), () => ({
                buffer: Buffer.concat([
                    sdaOffersCount,
                    sdaOffers
                ]),
                object: {
                    sdaOffersCount: 0x02,
                    offers: [
                        {
                            mosaicIdGive: [0x01, 0],
                            mosaicIdGet: [0x02, 0]
                        },
                        {
                            mosaicIdGive: [0x03, 0],
                            mosaicIdGet: [0x04, 0]
                        }
                    ]
                }
            }));
        });
    });
});