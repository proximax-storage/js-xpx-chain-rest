/**
 *** Copyright 2019 ProximaX Limited. All rights reserved.
 *** Use of this source code is governed by the Apache 2.0
 *** license that can be found in the LICENSE file.
 **/

const operation = require('../../src/plugins/operation');
const OperationDb = require('../../src/plugins/db/OperationDb');
const pluginTest = require('./utils/pluginTestUtils');
const test = require('../routes/utils/routeTestUtils');

describe('operation plugin', () => {
	pluginTest.assertThat.pluginCreatesDb(operation, OperationDb);
	pluginTest.assertThat.pluginDoesNotRegisterAdditionalTransactionStates(operation);
	pluginTest.assertThat.pluginDoesNotRegisterAdditionalMessageChannels(operation);

	describe('register routes', () => {
		it('registers operation GET routes', () => {
			// Arrange:
			const routes = [];
			const server = test.setup.createCapturingMockServer('get', routes);

			// Act:
			operation.registerRoutes(server, {});

			// Assert:
			test.assert.assertRoutes(routes, [
				'/account/:accountId/operations',
				'/operation/:hash256'
			]);
		});
	});
});
