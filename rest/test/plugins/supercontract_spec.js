/**
 *** Copyright 2019 ProximaX Limited. All rights reserved.
 *** Use of this source code is governed by the Apache 2.0
 *** license that can be found in the LICENSE file.
 **/

const supercontract = require('../../src/plugins/supercontract');
const SuperContractDb = require('../../src/plugins/db/SuperContractDb');
const pluginTest = require('./utils/pluginTestUtils');
const test = require('../routes/utils/routeTestUtils');

describe('supercontract plugin', () => {
	pluginTest.assertThat.pluginCreatesDb(supercontract, SuperContractDb);
	pluginTest.assertThat.pluginDoesNotRegisterAdditionalTransactionStates(supercontract);
	pluginTest.assertThat.pluginDoesNotRegisterAdditionalMessageChannels(supercontract);

	describe('register routes', () => {
		it('registers supercontract GET routes', () => {
			// Arrange:
			const routes = [];
			const server = test.setup.createCapturingMockServer('get', routes);

			// Act:
			supercontract.registerRoutes(server, {});

			// Assert:
			test.assert.assertRoutes(routes, [
				'/drive/:publicKey/supercontracts',
				'/supercontract/:accountId'
			]);
		});
	});
});
