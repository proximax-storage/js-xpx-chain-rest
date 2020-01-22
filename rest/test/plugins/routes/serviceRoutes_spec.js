/**
 *** Copyright 2019 ProximaX Limited. All rights reserved.
 *** Use of this source code is governed by the Apache 2.0
 *** license that can be found in the LICENSE file.
 * */

const serviceRoutes = require('../../../src/plugins/routes/serviceRoutes');
const catapult = require('catapult-sdk');
const test = require('../../routes/utils/routeTestUtils');
const { expect } = require('chai');

const { address } = catapult.model;
const { addresses, publicKeys, hashes256 } = test.sets;
const { convert } = catapult.utils;

describe('service routes', () => {
	describe('/drive/:accountId', () => {
		const assertGetDriveByAccountId = traits => {
			// Arrange:
			const keyGroups = [];
			const db = test.setup.createCapturingDb('getDriveByAccountId', keyGroups, [{value: 'this is nonsense'}]);

			// Act:
			const registerRoutes = serviceRoutes.register;
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
					expect(response).to.deep.equal({payload: {value: 'this is nonsense'}, type: 'driveEntry'});
				}
			);
		};

		it('with public key', () => assertGetDriveByAccountId({
			accountId: publicKeys.valid[0],
			expected: ['publicKey', convert.hexToUint8(publicKeys.valid[0])]
		}));

		it('with address', () => assertGetDriveByAccountId({
			accountId: addresses.valid[0],
			expected: ['address', address.stringToAddress(addresses.valid[0])]
		}));
	});

	describe('/account/:accountId/drive', () => {
		const driveStates = [
			{ role: ['owner', 'replicator'], routePostfix: '' },
			{ role: ['owner'], routePostfix: '/owner' },
			{ role: ['replicator'], routePostfix: '/replicator' },
		];

		describe('able to get drives by public key', () => {
			const assertGetDrivesByPublicKeyAndRole = state => {
				// Arrange:
				const keyGroups = [];
				const db = test.setup.createCapturingDb('getDrivesByPublicKeyAndRole', keyGroups, [{value: 'this is nonsense'}]);

				// Act:
				const registerRoutes = serviceRoutes.register;
				return test.route.executeSingle(
					registerRoutes,
					`/account/:accountId/drive${state.routePostfix}`,
					'get',
					{accountId: publicKeys.valid[0]},
					db,
					null,
					response => {
						// Assert:
						expect(keyGroups).to.deep.equal([convert.hexToUint8(publicKeys.valid[0]), state.role]);
						expect(response).to.deep.equal({payload: [{value: 'this is nonsense'}], type: 'driveEntry'});
					}
				);
			};

			it('both owner and replicator', () => assertGetDrivesByPublicKeyAndRole(driveStates[0]));
			it('only owner', () => assertGetDrivesByPublicKeyAndRole(driveStates[1]));
			it('only replicator', () => assertGetDrivesByPublicKeyAndRole(driveStates[2]));
		});

		describe('unable to get drives by address', () => {
			const assertGetDrivesByAddressAndRole = state => {
				// Arrange:
				const keyGroups = [];
				const db = test.setup.createCapturingDb('getDrivesByPublicKeyAndRole', keyGroups, [{value: 'this is nonsense'}]);

				// Act:
				const registerRoutes = serviceRoutes.register;
				return test.route.executeThrows(
					registerRoutes,
					`/account/:accountId/drive${state.routePostfix}`,
					'get',
					{ accountId: addresses.valid[0] },
					db,
					null,
					'Allowed only publicKey',
					409
				);
			};

			it('both owner and replicator', () => assertGetDrivesByAddressAndRole(driveStates[0]));
			it('only owner', () => assertGetDrivesByAddressAndRole(driveStates[1]));
			it('only replicator', () => assertGetDrivesByAddressAndRole(driveStates[2]));
		});
	});

	describe('/drive/:accountId/downloads', () => {
		const addGetDriveDownloadsByDriveId = traits => {
			// Arrange:
			const keyGroups = [];
			const db = test.setup.createCapturingDb('getDownloadsByDriveId', keyGroups, [{value: 'this is nonsense'}]);

			// Act:
			const registerRoutes = serviceRoutes.register;
			return test.route.executeSingle(
				registerRoutes,
				'/drive/:accountId/downloads',
				'get',
				{accountId: traits.accountId},
				db,
				null,
				response => {
					// Assert:
					expect(keyGroups).to.deep.equal(traits.expected);
					expect(response).to.deep.equal({payload: {value: 'this is nonsense'}, type: 'downloadEntry'});
				}
			);
		};

		it('with public key', () => addGetDriveDownloadsByDriveId({
			accountId: publicKeys.valid[0],
			expected: ['publicKey', convert.hexToUint8(publicKeys.valid[0])]
		}));

		it('with address', () => addGetDriveDownloadsByDriveId({
			accountId: addresses.valid[0],
			expected: ['address', address.stringToAddress(addresses.valid[0])]
		}));
	});

	const factory = {
		createDownloadsPagingRouteInfo: (routeName) => ({
			routes: serviceRoutes,
			routeName,
			createDb: (keyGroups, documents) => ({
				getDownloadsByFileRecipient: (fileRecipient, pageId, pageSize, options) => {
					keyGroups.push({
						fileRecipient,
						pageId,
						pageSize,
						options
					});
					return Promise.resolve(documents);
				},
				getDownloadsByOperationToken: (operationToken, pageId, pageSize, options) => {
					keyGroups.push({
						operationToken,
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
			'downloadEntry'
		);

		pagingTestsFactory.addDefault();
		pagingTestsFactory.addFailureTest(traits.invalid.name, traits.invalid.params, traits.invalid.error);
	};

	describe('/account/:accountId/downloads', () => addGetTests({
		routeName: '/account/:accountId/downloads',
		valid: {
			params: { accountId: publicKeys.valid[0] },
			expected: { fileRecipient: convert.hexToUint8(publicKeys.valid[0]), options: undefined }
		},
		invalid: {
			name: 'accountId is invalid',
			params: { ['accountId']: addresses.valid[0] },
			error: 'Allowed only publicKey'
		}
	}));

	describe('/downloads/:operationToken', () => addGetTests({
		routeName: '/downloads/:operationToken',
		valid: {
			params: { operationToken: hashes256.valid[0] },
			expected: { operationToken: convert.hexToUint8(hashes256.valid[0]), options: undefined }
		},
		invalid: {
			name: 'operationToken is invalid',
			params: { ['operationToken']: hashes256.invalid[0] },
			error: 'operationToken has an invalid format'
		}
	}));
});
