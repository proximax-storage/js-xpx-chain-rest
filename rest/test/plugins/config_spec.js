/**
 *** Copyright 2019 ProximaX Limited. All rights reserved.
 *** Use of this source code is governed by the Apache 2.0
 *** license that can be found in the LICENSE file.
 **/

const config = require('../../src/plugins/config');
const ConfigDb = require('../../src/plugins/db/ConfigDb');
const pluginTest = require('./utils/pluginTestUtils');
const { test } = require('../routes/utils/routeTestUtils');

describe('config plugin', () => {
	pluginTest.assertThat.pluginCreatesDb(config, ConfigDb);
	pluginTest.assertThat.pluginDoesNotRegisterAdditionalTransactionStates(config);
	pluginTest.assertThat.pluginDoesNotRegisterAdditionalMessageChannels(config);

	describe('register routes', () => {
		it('registers config GET routes', () => {
			// Arrange:
			const routes = [];
			const server = test.setup.createCapturingMockServer('get', routes);

			// Act:
			config.registerRoutes(server, {});

			// Assert:
			test.assert.assertRoutes(routes, [
				'/config/:height',
				'/config'
			]);
		});
	});
});
