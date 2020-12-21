/**
 *** Copyright 2019 ProximaX Limited. All rights reserved.
 *** Use of this source code is governed by the Apache 2.0
 *** license that can be found in the LICENSE file.
 * */

const exchangeRoutes = require('../../../src/plugins/routes/exchangeRoutes');
const catapult = require('catapult-sdk');
const { test } = require('../../routes/utils/routeTestUtils');
const { expect } = require('chai');

const { address } = catapult.model;
const { addresses, publicKeys } = test.sets;
const { convert, uint64 } = catapult.utils;

describe('exchange routes', () => {
	describe('/account/:accountId/exchange', () => {
		const assertGetExchangeByAccountId = traits => {
			// Arrange:
			const keyGroups = [];
			const db = test.setup.createCapturingDb('exchangesByIds', keyGroups, [{value: 'this is nonsense'}]);

			// Act:
			const registerRoutes = exchangeRoutes.register;
			return test.route.executeSingle(
				registerRoutes,
				'/account/:accountId/exchange',
				'get',
				{accountId: traits.accountId},
				db,
				null,
				response => {
					// Assert:
					expect(keyGroups).to.deep.equal(traits.expected);
					expect(response).to.deep.equal({payload: {value: 'this is nonsense'}, type: 'exchangeEntry'});
				}
			);
		};

		it('with public key', () => assertGetExchangeByAccountId({
			accountId: publicKeys.valid[0],
			expected: ['publicKey', [convert.hexToUint8(publicKeys.valid[0])]]
		}));

		it('with address', () => assertGetExchangeByAccountId({
			accountId: addresses.valid[0],
			expected: ['address', [address.stringToAddress(addresses.valid[0])]]
		}));
	});

	describe('/exchange/:type/:mosaicId', () => {
		const namespaceId = 'BC4F8D0EB4743851';
		const mosaicId = '26514E2A1EF33824';
		const assetId = uint64.fromHex(mosaicId);
		const assetIds = [assetId];

		const factory = {
			createExchangePagingRouteInfo: (routeName, routeCaptureMethod, mosaicId) => ({
				routes: exchangeRoutes,
				routeName,
				createDb: (keyGroups, documents) => ({
					getCatapultDb: () => {
						return test.setup.createCapturingDb('queryDocument', [],
							!mosaicId ? undefined : Object.assign({ namespace: { alias: { mosaicId: mosaicId } }
						}));
					},
					exchangesByMosaicIds: (type, assetIds, pageId, pageSize, ordering) => {
						keyGroups.push({
							type,
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
				factory.createExchangePagingRouteInfo('/exchange/:type/:mosaicId', 'get', traits.mosaicId),
				traits.params,
				traits.expected,
				'offerInfo'
			);

			pagingTestsFactory.addDefault();
			pagingTestsFactory.addNonPagingParamFailureTest('type', 'invalidOfferType');
			pagingTestsFactory.addNonPagingParamFailureTest('ordering', 'invalidOrdering');
		};

		describe('buy offer type with mosaic id', () => {
			describe('descending order by default', () => addGetTests({
				params: {mosaicId, type: 'buy'},
				expected: {type: 'buy', assetIds, ordering: -1}
			}));

			describe('set descending order', () => addGetTests({
				params: {mosaicId, type: 'buy', ordering: '-id'},
				expected: {type: 'buy', assetIds, ordering: -1}
			}));

			describe('set ascending order', () => addGetTests({
				params: {mosaicId, type: 'buy', ordering: 'id'},
				expected: {type: 'buy', assetIds, ordering: 1}
			}));
		});

		describe('sell offer type with mosaic id', () => {
			describe('ascending order by default', () => addGetTests({
				params: {mosaicId, type: 'sell'},
				expected: {type: 'sell', assetIds, ordering: 1}
			}));

			describe('set ascending order', () => addGetTests({
				params: {mosaicId, type: 'sell', ordering: 'id'},
				expected: {type: 'sell', assetIds, ordering: 1}
			}));

			describe('set descending order', () => addGetTests({
				params: {mosaicId, type: 'sell', ordering: '-id'},
				expected: {type: 'sell', assetIds, ordering: -1}
			}));
		});

		describe('buy offer type with namespace id', () => {
			describe('descending order by default', () => addGetTests({
				params: {mosaicId: namespaceId, type: 'buy'},
				expected: {type: 'buy', assetIds, ordering: -1},
				mosaicId: assetId
			}));

			describe('set descending order', () => addGetTests({
				params: {mosaicId: namespaceId, type: 'buy', ordering: '-id'},
				expected: {type: 'buy', assetIds, ordering: -1},
				mosaicId: assetId
			}));

			describe('set ascending order', () => addGetTests({
				params: {mosaicId: namespaceId, type: 'buy', ordering: 'id'},
				expected: {type: 'buy', assetIds, ordering: 1},
				mosaicId: assetId
			}));
		});

		describe('sell offer type with namespace id', () => {
			describe('ascending order by default', () => addGetTests({
				params: {mosaicId: namespaceId, type: 'sell'},
				expected: {type: 'sell', assetIds, ordering: 1},
				mosaicId: assetId
			}));

			describe('set ascending order', () => addGetTests({
				params: {mosaicId: namespaceId, type: 'sell', ordering: 'id'},
				expected: {type: 'sell', assetIds, ordering: 1},
				mosaicId: assetId
			}));

			describe('set descending order', () => addGetTests({
				params: {mosaicId: namespaceId, type: 'sell', ordering: '-id'},
				expected: {type: 'sell', assetIds, ordering: -1},
				mosaicId: assetId
			}));
		});
	});
});
