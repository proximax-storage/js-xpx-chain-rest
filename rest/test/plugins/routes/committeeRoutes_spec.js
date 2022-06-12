/**
 *** Copyright 2020 ProximaX Limited. All rights reserved.
 *** Use of this source code is governed by the Apache 2.0
 *** license that can be found in the LICENSE file.
 * */

const committeeRoutes = require('../../../src/plugins/routes/committeeRoutes');
const catapult = require('catapult-sdk');
const { MockServer, test } = require('../../routes/utils/routeTestUtils');
const { expect } = require('chai');
const sinon = require('sinon');

const { address } = catapult.model;
const { addresses, publicKeys } = test.sets;
const { convert } = catapult.utils;

describe('committee routes', () => {
	describe('/account/:accountId/harvesting', () => {
		const assertGetHarvesterByAccountId = traits => {
			// Arrange:
			const keyGroups = [];
			const db = test.setup.createCapturingDb('getHarvesterByAccountId', keyGroups, [{value: 'this is nonsense'}]);

			// Act:
			const registerRoutes = committeeRoutes.register;
			return test.route.executeSingle(
				registerRoutes,
				'/account/:accountId/harvesting',
				'get',
				{accountId: traits.accountId},
				db,
				null,
				response => {
					// Assert:
					expect(keyGroups).to.deep.equal(traits.expected);
					expect(response).to.deep.equal({payload: [{value: 'this is nonsense'}], type: 'committeeEntry'});
				}
			);
		};

		it('with public key', () => assertGetHarvesterByAccountId({
			accountId: publicKeys.valid[0],
			expected: ['publicKey', convert.hexToUint8(publicKeys.valid[0])]
		}));

		it('with address', () => assertGetHarvesterByAccountId({
			accountId: addresses.valid[0],
			expected: ['address', address.stringToAddress(addresses.valid[0])]
		}));
	});

	describe('/harvesters', () => {
		const fakeHarvester = { meta: { id: "" }, harvester: {} };
		const fakePaginatedHarvester = {
			data: [fakeHarvester],
			pagination: {
				pageNumber: 1,
				pageSize: 10,
				totalEntries: 1,
				totalPages: 1
			}
		};
		const dbHarvestersFake = sinon.fake.resolves(fakePaginatedHarvester);

		const mockServer = new MockServer();
		const db = { harvesters: dbHarvestersFake };
		const services = {
			config: {
				pageSize: {
					min: 10,
					max: 100,
					default: 20
				}
			}
		};

		const registerRoutes = committeeRoutes.register(mockServer.server, db, services);
		const route = mockServer.getRoute('/harvesters').get();

		const req = {
			params: { sortField: '_id' }
		};

		it('returns correct structure with harvesters', () => {
			// Act:
			return mockServer.callRoute(route, req).then(() => {
				console.log(mockServer.send.call)
				// Assert:
				expect(mockServer.send.firstCall.args[0]).to.deep.equal({
					payload: fakePaginatedHarvester,
					type: 'committeeEntry',
					structure: 'page'
				});
				expect(mockServer.next.calledOnce).to.equal(true);
			});
		});
	});
});
