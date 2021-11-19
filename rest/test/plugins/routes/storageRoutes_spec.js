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
 const { addresses, publicKeys, hashes256, blsPublicKey } = test.sets;
 const { convert } = catapult.utils;

 describe('storage routes', () => {
    describe('/drive_v2/:accountId', () => {
		const assertGetBcDriveByAccountId = traits => {
			// Arrange:
			const keyGroups = [];
			const db = test.setup.createCapturingDb('getBcDriveByAccountId', keyGroups, [{value: 'this is nonsense'}]);

			// Act:
			const registerRoutes = storageRoutes.register;
			return test.route.executeSingle(
				registerRoutes,
				'/drive_v2/:accountId',
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

	describe('/replicator_v2/:publicKey', () => {
		const addGetReplicatorByPublicKey = traits => {
			// Arrange:
			const keyGroups = [];
			const db = test.setup.createCapturingDb('getReplicatorByPublicKey', keyGroups, [{value: 'this is nonsense'}]);

			// Act:
			const registerRoutes = storageRoutes.register;
			return test.route.executeSingle(
				registerRoutes,
				'/replicator_v2/:publicKey',
				'get',
				{publicKey: traits.publicKey},
				db,
				null,
				response => {
					// Assert:
					expect(keyGroups).to.deep.equal(traits.expected);
					expect(response).to.deep.equal({payload: {value: 'this is nonsense'}, type: 'replicatorEntry'});
				}
			);
		};

		it('with replicator key', () => addGetReplicatorByPublicKey({
			publicKey: publicKeys.valid[0],
			expected: [convert.hexToUint8(publicKeys.valid[0])]
		}));
	});

	describe('/account_v2/:owner/drive', () => {
		const addGetBcDriveByOwnerPublicKey = traits => {
			// Arrange:
			const keyGroups = [];
			const db = test.setup.createCapturingDb('getBcDriveByOwnerPublicKey', keyGroups, [{value: 'this is nonsense'}]);
			
			// Act:
			const registerRoutes = storageRoutes.register;
			return test.route.executeSingle(
				registerRoutes,
				'/account_v2/:owner/drive',
				'get',
				{owner: traits.owner},
				db,
				null,
				response => {
					// Assert:
					expect(keyGroups).to.deep.equal(traits.expected);
					expect(response).to.deep.equal({payload: {value: 'this is nonsense'}, type: 'bcDriveEntry'});
				}
			);
		};

		it('with owner public key', () => addGetBcDriveByOwnerPublicKey({
			owner: publicKeys.valid[0],
			expected: [convert.hexToUint8(publicKeys.valid[0])]
		}));
    });

	describe('/account_v2/:blsKey/replicator', () => {
		const addGetReplicatorByBlsKey = traits => {
			// Arrange:
			const keyGroups = [];
			const db = test.setup.createCapturingDb('getReplicatorByBlsKey', keyGroups, [{value: 'this is nonsense'}]);
			
			// Act:
			const registerRoutes = storageRoutes.register;
			return test.route.executeSingle(
				registerRoutes,
				'/account_v2/:blsKey/replicator',
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

		it('with replicator bls key', () => addGetReplicatorByBlsKey({
			blsKey: blsPublicKey.valid[0],
			expected: [convert.hexToUint8(blsPublicKey.valid[0])]
		}));
	});

	const factory = {
		createDownloadChannelsPagingRouteInfo: (routeName) => ({
			routes: storageRoutes,
			routeName,
			createDb: (keyGroups, documents) => ({
				getDownloadsByDownloadChannelId: (downloadChannelId, pageId, pageSize, options) => {
					keyGroups.push({
						downloadChannelId,
						pageId,
						pageSize,
						options
					});
					return Promise.resolve(documents);
				},
				getDownloadsByConsumerPublicKey: (consumerKey, pageId, pageSize, options) => {
					keyGroups.push({
						consumerKey,
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
			factory.createDownloadChannelsPagingRouteInfo(traits.routeName),
			traits.valid.params,
			traits.valid.expected,
			'downloadChannelEntry'
		);

		pagingTestsFactory.addDefault();
		if (traits.invalid)
			pagingTestsFactory.addFailureTest(traits.invalid.name, traits.invalid.params, traits.invalid.error);
	};

	describe('/downloads_v2/:downloadChannelId', () => addGetTests({
		routeName: '/downloads_v2/:downloadChannelId',
		valid: {
			params: { downloadChannelId: hashes256.valid[0] },
			expected: { downloadChannelId: convert.hexToUint8(hashes256.valid[0]), options: undefined }
		}
	}));

	describe('/account_v2/:consumerKey/download', () => addGetTests({
		routeName: '/account_v2/:consumerKey/download',
		valid: {
			params: { consumerKey: publicKeys.valid[0] },
			expected: { consumerKey: convert.hexToUint8(publicKeys.valid[0]), options: undefined }
		}
	}));
});