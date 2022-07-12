/**
 *** Copyright 2019 ProximaX Limited. All rights reserved.
 *** Use of this source code is governed by the Apache 2.0
 *** license that can be found in the LICENSE file.
 **/

const lockfund = require('../../src/plugins/lockfund');
const LockFundDb = require('../../src/plugins/db/LockFundDb');
const pluginTest = require('./utils/pluginTestUtils');
const { test } = require('../routes/utils/routeTestUtils');

describe('lockfund plugin', () => {
	pluginTest.assertThat.pluginCreatesDb(lockfund, LockFundDb);
	pluginTest.assertThat.pluginDoesNotRegisterAdditionalTransactionStates(lockfund);
	pluginTest.assertThat.pluginDoesNotRegisterAdditionalMessageChannels(lockfund);

	describe('register routes', () => {
		it('registers lockFund GET routes', () => {
			// Arrange:
			const routes = [];
			const server = test.setup.createCapturingMockServer('get', routes);

			// Act:
			lockfund.registerRoutes(server, {});

			// Assert:
			test.assert.assertRoutes(routes, [
				'/lockfund/height/:height',
				'/lockfund/account/:publicKey'
			]);
		});
	});
});
