/**
 *** Copyright 2019 ProximaX Limited. All rights reserved.
 *** Use of this source code is governed by the Apache 2.0
 *** license that can be found in the LICENSE file.
 * */

const supercontractRoutes = require('../../../src/plugins/routes/supercontractRoutes');
const catapult = require('catapult-sdk');
const test = require('../../routes/utils/routeTestUtils');
const { expect } = require('chai');

const { address } = catapult.model;
const { addresses, publicKeys } = test.sets;
const { convert } = catapult.utils;

describe('supercontract routes', () => {
	it('/drive/:publicKey/supercontracts', () => {
		// Arrange:
		const keyGroups = [];
		const db = test.setup.createCapturingDb('getSuperContractsByDrivePublicKey', keyGroups, [{value: 'this is nonsense'}]);

		// Act:
		const registerRoutes = supercontractRoutes.register;
		return test.route.executeSingle(
			registerRoutes,
			'/drive/:publicKey/supercontracts',
			'get',
			{publicKey: publicKeys.valid[0]},
			db,
			null,
			response => {
				// Assert:
				expect(keyGroups).to.deep.equal([convert.hexToUint8(publicKeys.valid[0])]);
				expect(response).to.deep.equal({payload: [{value: 'this is nonsense'}], type: 'superContractEntry'});
			}
		);
	});

	describe('/supercontract/:accountId', () => {
		const assertGetOperationsByAccountId = traits => {
			// Arrange:
			const keyGroups = [];
			const db = test.setup.createCapturingDb('getSuperContractByAccountId', keyGroups, [{value: 'this is nonsense'}]);

			// Act:
			const registerRoutes = supercontractRoutes.register;
			return test.route.executeSingle(
				registerRoutes,
				'/supercontract/:accountId',
				'get',
				{accountId: traits.accountId},
				db,
				null,
				response => {
					// Assert:
					expect(keyGroups).to.deep.equal(traits.expected);
					expect(response).to.deep.equal({payload: {value: 'this is nonsense'}, type: 'superContractEntry'});
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
});
