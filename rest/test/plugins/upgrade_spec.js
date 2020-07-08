/**
 *** Copyright 2019 ProximaX Limited. All rights reserved.
 *** Use of this source code is governed by the Apache 2.0
 *** license that can be found in the LICENSE file.
 **/

const pluginTest = require('./utils/pluginTestUtils');
const { test } = require('../routes/utils/routeTestUtils');
const upgrade = require('../../src/plugins/upgrade');
const UpgradeDb = require('../../src/plugins/db/UpgradeDb');

describe('upgrade plugin', () => {
	pluginTest.assertThat.pluginCreatesDb(upgrade, UpgradeDb);
	pluginTest.assertThat.pluginDoesNotRegisterAdditionalTransactionStates(upgrade);
	pluginTest.assertThat.pluginDoesNotRegisterAdditionalMessageChannels(upgrade);

	describe('register routes', () => {
		it('registers upgrade GET routes', () => {
			// Arrange:
			const routes = [];
			const server = test.setup.createCapturingMockServer('get', routes);

			// Act:
			upgrade.registerRoutes(server, {});

			// Assert:
			test.assert.assertRoutes(routes, [
				'/upgrade/:height'
			]);
		});
	});
});
