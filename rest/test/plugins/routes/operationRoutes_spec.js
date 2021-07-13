/**
 *** Copyright 2019 ProximaX Limited. All rights reserved.
 *** Use of this source code is governed by the Apache 2.0
 *** license that can be found in the LICENSE file.
 * */

const operationRoutes = require('../../../src/plugins/routes/operationRoutes');
const catapult = require('catapult-sdk');
const { test } = require('../../routes/utils/routeTestUtils');
const { expect } = require('chai');

const { address } = catapult.model;
const { addresses, publicKeys, hashes256 } = test.sets;
const { convert } = catapult.utils;

describe('operation routes', () => {
	describe('/account/:accountId/operations', () => {
		const assertGetOperationsByAccountId = traits => {
			// Arrange:
			const keyGroups = [];
			const db = test.setup.createCapturingDb('getOperationsByAccountId', keyGroups, [{value: 'this is nonsense'}]);

			// Act:
			const registerRoutes = operationRoutes.register;
			return test.route.executeSingle(
				registerRoutes,
				'/account/:accountId/operations',
				'get',
				{accountId: traits.accountId},
				db,
				null,
				response => {
					// Assert:
					expect(keyGroups).to.deep.equal(traits.expected);
					expect(response).to.deep.equal({payload: [{value: 'this is nonsense'}], type: 'operationEntry'});
				}
			);
		};

		it('with public key', () => assertGetOperationsByAccountId({
			accountId: publicKeys.valid[0],
			expected: ['publicKey', convert.hexToUint8(publicKeys.valid[0])]
		}));

		it('with address', () => assertGetOperationsByAccountId({
			accountId: addresses.valid[0],
			expected: ['address', address.stringToAddress(addresses.valid[0])]
		}));
	});

	it('/operation/:hash256', () => {
		// Arrange:
		const keyGroups = [];
		const db = test.setup.createCapturingDb('getOperationByToken', keyGroups, [{value: 'this is nonsense'}]);

		// Act:
		const registerRoutes = operationRoutes.register;
		return test.route.executeSingle(
			registerRoutes,
			'/operation/:hash256',
			'get',
			{hash256: hashes256.valid[0]},
			db,
			null,
			response => {
				// Assert:
				expect(keyGroups).to.deep.equal([convert.hexToUint8(hashes256.valid[0])]);
				expect(response).to.deep.equal({payload: {value: 'this is nonsense'}, type: 'operationEntry'});
			}
		);
	});
});
