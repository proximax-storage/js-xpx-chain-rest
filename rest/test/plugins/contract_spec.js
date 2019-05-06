/**
 *** Copyright 2019 ProximaX Limited. All rights reserved.
 *** Use of this source code is governed by the Apache 2.0
 *** license that can be found in the LICENSE file.
 **/

const contract = require('../../src/plugins/contract');
const ContractDb = require('../../src/plugins/db/ContractDb');
const pluginTest = require('./utils/pluginTestUtils');
const test = require('../routes/utils/routeTestUtils');

describe('contract plugin', () => {
	pluginTest.assertThat.pluginCreatesDb(contract, ContractDb);
	pluginTest.assertThat.pluginDoesNotRegisterAdditionalTransactionStates(contract);
	pluginTest.assertThat.pluginDoesNotRegisterAdditionalMessageChannels(contract);

	describe('register routes', () => {
		it('registers GET routes', () => {
			// Arrange:
			const routes = [];
			const server = test.setup.createCapturingMockServer('get', routes);

			// Act:
			contract.registerRoutes(server, {});

			// Assert:
			test.assert.assertRoutes(routes, [
				'/account/:accountId/contracts',
				'/contract/:accountId'
			]);
		});

		it('registers POST routes', () => {
			// Arrange:
			const routes = [];
			const server = test.setup.createCapturingMockServer('post', routes);

			// Act:
			contract.registerRoutes(server, {});

			// Assert:
			test.assert.assertRoutes(routes, [
				'/account/contracts',
				'/contract'
			]);
		});
	});
});
