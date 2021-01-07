/**
 *** Copyright 2020 ProximaX Limited. All rights reserved.
 *** Use of this source code is governed by the Apache 2.0
 *** license that can be found in the LICENSE file.
 * */

const committeeRoutes = require('../../../src/plugins/routes/committeeRoutes');
const catapult = require('catapult-sdk');
const { test } = require('../../routes/utils/routeTestUtils');
const { expect } = require('chai');

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
});
