/**
 *** Copyright 2019 ProximaX Limited. All rights reserved.
 *** Use of this source code is governed by the Apache 2.0
 *** license that can be found in the LICENSE file.
 * */

const test = require('../../routes/utils/routeTestUtils');
const upgradeRoutes = require('../../../src/plugins/routes/upgradeRoutes');
const { expect } = require('chai');

describe('upgrade routes', () => {
	describe('get upgrade by height', () => {
		it('/upgrade/:height', () => {
			// Arrange:
			const keyGroups = [];
			const db = test.setup.createCapturingDb('upgradsLessOrEqualThanHeight', keyGroups, [{ value: 'this is nonsense' }]);

			// Act:
			const registerRoutes = upgradeRoutes.register;
			return test.route.executeSingle(
				registerRoutes,
				'/upgrade/:height',
				'get',
				{ height: '12' },
				db,
				null,
				response => {
					// Assert:
					expect(keyGroups).to.deep.equal([12 /* height */, 1 /* limit */]);
					expect(response).to.deep.equal({ payload: { value: 'this is nonsense' }, type: 'blockchainUpgradeEntry' });
				}
			);
		});
	});
});
