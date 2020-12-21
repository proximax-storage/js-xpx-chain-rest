/**
 *** Copyright 2018 ProximaX Limited. All rights reserved.
 *** Use of this source code is governed by the Apache 2.0
 *** license that can be found in the LICENSE file.
 **/

const catapult = require('catapult-sdk');
const contractRoutes = require('../../../src/plugins/routes/contractRoutes');
const { test } = require('../../routes/utils/routeTestUtils');
const { expect } = require('chai');

const Valid_Public_Key = test.sets.publicKeys.valid[0];

describe('contract routes', () => {

	describe('get contracts by account', () => {
		it('/account/:accountId/contracts', () => {
			// Arrange:
			const keyGroups = [];
			const db = test.setup.createCapturingDb('contractsByAccounts', keyGroups, [{ value: 'this is nonsense' }]);

			// Act:
			const registerRoutes = contractRoutes.register;
			return test.route.executeSingle(
				registerRoutes,
				'/account/:accountId/contracts',
				'get',
				{ accountId: Valid_Public_Key },
				db,
				null,
				response => {
					// Assert:
					expect(keyGroups).to.deep.equal([ [catapult.utils.convert.hexToUint8(Valid_Public_Key)] ]);
					expect(response).to.deep.equal({ payload: [{ value: 'this is nonsense' }], type: 'contractEntry' });
				}
			);
		});

		it('/contract/:contractId', () => {
			// Arrange:
			const keyGroups = [];
			const db = test.setup.createCapturingDb('contractsByIds', keyGroups, [{ value: 'this is nonsense' }]);

			// Act:
			const registerRoutes = contractRoutes.register;
			return test.route.executeSingle(
				registerRoutes,
				'/contract/:contractId',
				'get',
				{ contractId: Valid_Public_Key },
				db,
				null,
				response => {
					// Assert:
					expect(keyGroups).to.deep.equal(['publicKey', [catapult.utils.convert.hexToUint8(Valid_Public_Key)] ]);
					expect(response).to.deep.equal({ payload: { value: 'this is nonsense' }, type: 'contractEntry' });
				}
			);
		});
	});

	describe('get contracts by ids', () => {
		it('does not support publicKeys and addresses provided at the same time', () => {
			// Arrange:
			const keyGroups = [];
			const db = test.setup.createCapturingDb('contractsByIds', keyGroups, [{ value: 'this is nonsense' }]);

			// Act:
			const registerRoutes = contractRoutes.register;
			const errorMessage = 'publicKeys and addresses cannot both be provided';
			return test.route.executeThrows(
				registerRoutes,
				'/contract',
				'post',
				{ addresses: test.sets.addresses.valid, publicKeys: test.sets.publicKeys.valid },
				db,
				{ transactionStates: [] },
				errorMessage,
				409
			);
		});

		it('does not addresses, only publicKeys', () => {
			// Arrange:
			const keyGroups = [];
			const db = test.setup.createCapturingDb('contractsByAccounts', keyGroups, [{ value: 'this is nonsense' }]);

			// Act:
			const registerRoutes = contractRoutes.register;
			const errorMessage = 'addresses cannot both be provided. Allowed only publicKeys';
			return test.route.executeThrows(
				registerRoutes,
				'/account/contracts',
				'post',
				{ addresses: test.sets.addresses.valid },
				db,
				{ transactionStates: [] },
				errorMessage,
				409
			);
		});
	});
});
