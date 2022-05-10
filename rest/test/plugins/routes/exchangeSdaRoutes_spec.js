/**
 *** Copyright 2022 ProximaX Limited. All rights reserved.
 *** Use of this source code is governed by the Apache 2.0
 *** license that can be found in the LICENSE file.
 * */

 const exchangeSdaRoutes = require('../../../src/plugins/routes/exchangeSdaRoutes');
 const catapult = require('catapult-sdk');
 const { test } = require('../../routes/utils/routeTestUtils');
 const { expect } = require('chai');

const { address } = catapult.model;
const { addresses, publicKeys } = test.sets;
const { convert, uint64 } = catapult.utils;

 describe('exchange sda routes', () => {
    describe('/account/:accountId/exchangesda', () => {
        const assertGetExchangeSdaByAccountId = traits => {
            // Arrange:
            const keyGroups = [];
            const db = test.setup.createCapturingDb('exchangesdaByIds', keyGroups, [{value: 'this is nonsense'}]);

            // Act:
            const registerRoutes = exchangeSdaRoutes.register;
            return test.route.executeSingle(
                registerRoutes,
                '/account/:accountId/exchangesda',
                'get',
                {accountId: traits.accountId},
                db,
                null,
                response => {
                    // Assert:
                    expect(keyGroups).to.deep.equal(traits.expected);
                    expect(response).to.deep.equal({payload: {value: 'this is nonsense'}, type: 'sdaExchangeEntry'});
                }
            );
        };

        it('with public key', () => assertGetExchangeSdaByAccountId({
			accountId: publicKeys.valid[0],
			expected: ['publicKey', [convert.hexToUint8(publicKeys.valid[0])]]
		}));

		it('with address', () => assertGetExchangeSdaByAccountId({
			accountId: addresses.valid[0],
			expected: ['address', [address.stringToAddress(addresses.valid[0])]]
		}));
    });

    describe('/exchangesda/:type/:mosaicId', () => {
        const namespaceId = 'BC4F8D0EB4743851';
        const mosaicId = '26514E2A1EF33824';
		const assetId = uint64.fromHex(mosaicId);
		const assetIds = [assetId];

        const factory = {
			createSdaExchangePagingRouteInfo: (routeName, routeCaptureMethod, mosaicId) => ({
				routes: exchangeSdaRoutes,
				routeName,
				createDb: (keyGroups, documents) => ({
					getCatapultDb: () => {
						return test.setup.createCapturingDb('queryDocument', [],
							!mosaicId ? undefined : Object.assign({ namespace: { alias: { mosaicId: mosaicId } }
						}));
					},
					exchangesdaByMosaicIdGive: (assetIds, pageId, pageSize, ordering) => {
						keyGroups.push({
							assetIds,
							pageId,
							pageSize,
							ordering
						});
						return Promise.resolve(documents);
					},
                    exchangesdaByMosaicIdGet: (assetIds, pageId, pageSize, ordering) => {
						keyGroups.push({
							assetIds,
							pageId,
							pageSize,
							ordering
						});
						return Promise.resolve(documents);
					}
				}),
				routeCaptureMethod
			})
		};

        const addGetTests = traits => {
            const pagingTestsFactory = test.setup.createPagingTestsFactory(
				factory.createSdaExchangePagingRouteInfo('/exchangesda/:type/:mosaicId', 'get', traits.mosaicId),
				traits.params,
				traits.expected,
				'sdaOfferBalances'
			);

            pagingTestsFactory.addDefault();
			pagingTestsFactory.addNonPagingParamFailureTest('type', 'invalidOfferType');
			pagingTestsFactory.addNonPagingParamFailureTest('ordering', 'invalidOrdering');
        };

        describe('sda offer balances with mosaic id give', () => {
            describe('descending order by default', () => addGetTests({
				params: {mosaicId, type: 'give'},
				expected: {assetIds, ordering: -1}
			}));

            describe('set descending order', () => addGetTests({
				params: {mosaicId, type: 'give', ordering: '-1'},
				expected: {assetIds, ordering: -1}
			}));

			describe('set ascending order', () => addGetTests({
				params: {mosaicId, type: 'give', ordering: '1'},
				expected: {assetIds, ordering: 1}
			}));
        });

        describe('sda offer balances with mosaic id get', () => {
            describe('descending order by default', () => addGetTests({
				params: {mosaicId, type: 'get'},
				expected: {assetIds, ordering: -1}
			}));

            describe('set descending order', () => addGetTests({
				params: {mosaicId, type: 'get', ordering: '-1'},
				expected: {assetIds, ordering: -1}
			}));

			describe('set ascending order', () => addGetTests({
				params: {mosaicId, type: 'get', ordering: '1'},
				expected: {assetIds, ordering: 1}
			}));
        });

        describe('sda offer balances with namespace id give', () => {
            describe('descending order by default', () => addGetTests({
				params: {mosaicId: namespaceId, type: 'give'},
				expected: {assetIds, ordering: -1},
                mosaicId: assetId
			}));

            describe('set descending order', () => addGetTests({
				params: {mosaicId: namespaceId, type: 'give', ordering: '-1'},
				expected: {assetIds, ordering: -1},
                mosaicId: assetId
			}));

			describe('set ascending order', () => addGetTests({
				params: {mosaicId: namespaceId, type: 'give', ordering: '1'},
				expected: {assetIds, ordering: 1},
                mosaicId: assetId
			}));
        });

        describe('sda offer balances with namespace id get', () => {
            describe('descending order by default', () => addGetTests({
				params: {mosaicId: namespaceId, type: 'get'},
				expected: {assetIds, ordering: -1},
                mosaicId: assetId
			}));

            describe('set descending order', () => addGetTests({
				params: {mosaicId: namespaceId, type: 'get', ordering: '-1'},
				expected: {assetIds, ordering: -1},
                mosaicId: assetId
			}));

			describe('set ascending order', () => addGetTests({
				params: {mosaicId: namespaceId, type: 'get', ordering: '1'},
				expected: {assetIds, ordering: 1},
                mosaicId: assetId
			}));
        });
    });
 });