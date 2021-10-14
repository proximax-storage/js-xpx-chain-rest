/**
 *** Copyright 2021 ProximaX Limited. All rights reserved.
 *** Use of this source code is governed by the Apache 2.0
 *** license that can be found in the LICENSE file.
 * */

 const storageRoutes = require('../../../src/plugins/routes/storageRoutes');
 const catapult = require('catapult-sdk');
 const { test } = require('../../routes/utils/routeTestUtils');
 const { expect } = require('chai');
 
 const { address } = catapult.model;
 const { addresses, publicKeys, hashes256 } = test.sets;
 const { convert } = catapult.utils;

 describe('storage routes', () => {
    describe('/drive/:accountId', () => {
		const assertGetBcDriveByAccountId = traits => {
			// Arrange:
			const keyGroups = [];
			const db = test.setup.createCapturingDb('getBcDriveByAccountId', keyGroups, [{value: 'this is nonsense'}]);

			// Act:
			const registerRoutes = storageRoutes.register;
			return test.route.executeSingle(
				registerRoutes,
				'/drive/:accountId',
				'get',
				{accountId: traits.accountId},
				db,
				null,
				response => {
					// Assert:
					expect(keyGroups).to.deep.equal(traits.expected);
					expect(response).to.deep.equal({payload: {value: 'this is nonsense'}, type: 'bcDriveEntry'});
				}
			);
		};

		it('with public key', () => assertGetBcDriveByAccountId({
			accountId: publicKeys.valid[0],
			expected: ['publicKey', convert.hexToUint8(publicKeys.valid[0])]
		}));

		it('with address', () => assertGetBcDriveByAccountId({
			accountId: addresses.valid[0],
			expected: ['address', address.stringToAddress(addresses.valid[0])]
		}));
	});

    describe('/downloads/:downloadChannelId', () => {
		const addGetDownloadsByDownloadChannelId = traits => {
			// Arrange:
			const keyGroups = [];
			const db = test.setup.createCapturingDb('getDownloadsByDownloadChannelId', keyGroups, [{value: 'this is nonsense'}]);

			// Act:
			const registerRoutes = storageRoutes.register;
			return test.route.executeSingle(
				registerRoutes,
				'/downloads/:downloadChannelId',
				'get',
				{downloadChannelId: traits.downloadChannelId},
				db,
				null,
				response => {
					// Assert:
					expect(keyGroups).to.deep.equal(traits.expected);
					expect(response).to.deep.equal({payload: {value: 'this is nonsense'}, type: 'downloadChannelEntry'});
				}
			);
		};

		it('with download channel id', () => addGetDownloadsByDownloadChannelId({
			downloadChannelId: hashes256.valid[0],
			expected: [convert.hexToUint8(hashes256.valid[0])]
		}));
	});

	describe('/replicator/:key', () => {
		const addGetReplicatorByPublicKey = traits => {
			// Arrange:
			const keyGroups = [];
			const db = test.setup.createCapturingDb('getReplicatorByPublicKey', keyGroups, [{value: 'this is nonsense'}]);

			// Act:
			const registerRoutes = storageRoutes.register;
			return test.route.executeSingle(
				registerRoutes,
				'/replicator/:key',
				'get',
				{blsKey: traits.blsKey},
				db,
				null,
				response => {
					// Assert:
					expect(keyGroups).to.deep.equal(traits.expected);
					expect(response).to.deep.equal({payload: {value: 'this is nonsense'}, type: 'replicatorEntry'});
				}
			);
		};

		it('with public key', () => addGetReplicatorByPublicKey({
			accountId: publicKeys.valid[0],
			expected: ['publicKey', convert.hexToUint8(publicKeys.valid[0])]
		}));
	});

	const factory = {
		createDownloadsPagingRouteInfo: (routeName) => ({
			routes: storageRoutes,
			routeName,
			createDb: (keyGroups, documents) => ({
				getDownloadsByConsumerPublicKey: (publicKey, pageId, pageSize, options) => {
					keyGroups.push({
						publicKey,
						pageId,
						pageSize,
						options
					});
					return Promise.resolve(documents);
				},
				getDownloadsByDownloadChannelId: (downloadChannelId, pageId, pageSize, options) => {
					keyGroups.push({
						downloadChannelId,
						pageId,
						pageSize,
						options
					});
					return Promise.resolve(documents);
				}
			}),
			routeCaptureMethod: 'get'
		})
	};

	const addGetTests = traits => {
		const pagingTestsFactory = test.setup.createPagingTestsFactory(
			factory.createDownloadsPagingRouteInfo(traits.routeName),
			traits.valid.params,
			traits.valid.expected,
			'downloadChannelEntry'
		);

		pagingTestsFactory.addDefault();
		if (traits.invalid)
			pagingTestsFactory.addFailureTest(traits.invalid.name, traits.invalid.params, traits.invalid.error);
	};

	describe('/account/:accountId/drive', () => addGetTests({
		routeName: '/account/:accountId/drive',
		valid: {
			params: { accountId: publicKeys.valid[0] },
			expected: { owner: convert.hexToUint8(publicKeys.valid[0]), options: undefined }
		},
		invalid: {
			name: 'accountId is invalid',
			params: { ['accountId']: addresses.valid[0] },
			error: 'Allowed only publicKey'
		}
    }));

	describe('/account/:accountId/replicator', () => addGetTests({
		routeName: '/account/:accountId/replicator',
		valid: {
			params: { accountId: publicKeys.valid[0] },
			expected: { key: convert.hexToUint8(publicKeys.valid[0]), options: undefined }
		},
		invalid: {
			name: 'accountId is invalid',
			params: { ['accountId']: addresses.valid[0] },
			error: 'Allowed only publicKey'
		}
    }));
 });