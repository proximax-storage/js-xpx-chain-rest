/**
 *** Copyright 2019 ProximaX Limited. All rights reserved.
 *** Use of this source code is governed by the Apache 2.0
 *** license that can be found in the LICENSE file.
 * */

const configRoutes = require('../../../src/plugins/routes/configRoutes');
const test = require('../../routes/utils/routeTestUtils');
const { expect } = require('chai');

describe('config routes', () => {
	describe('get config by height', () => {
		it('/config/:height', () => {
			// Arrange:
			const keyGroups = [];
			const db = test.setup.createCapturingDb('configsLessOrEqualThanHeight', keyGroups, [{ value: 'this is nonsense' }]);

			// Act:
			const registerRoutes = configRoutes.register;
			return test.route.executeSingle(
				registerRoutes,
				'/config/:height',
				'get',
				{ height: '12' },
				db,
				null,
				response => {
					// Assert:
					expect(keyGroups).to.deep.equal([12 /* height */, 1 /* limit */]);
					expect(response).to.deep.equal({ payload: { value: 'this is nonsense' }, type: 'networkConfigEntry' });
				}
			);
		});
	});
});
