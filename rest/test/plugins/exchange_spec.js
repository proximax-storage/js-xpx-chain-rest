/**
 *** Copyright 2019 ProximaX Limited. All rights reserved.
 *** Use of this source code is governed by the Apache 2.0
 *** license that can be found in the LICENSE file.
 **/

const exchange = require('../../src/plugins/exchange');
const ExchangeDb = require('../../src/plugins/db/ExchangeDb');
const pluginTest = require('./utils/pluginTestUtils');
const { test } = require('../routes/utils/routeTestUtils');

describe('exchange plugin', () => {
	pluginTest.assertThat.pluginCreatesDb(exchange, ExchangeDb);
	pluginTest.assertThat.pluginDoesNotRegisterAdditionalTransactionStates(exchange);
	pluginTest.assertThat.pluginDoesNotRegisterAdditionalMessageChannels(exchange);

	describe('register routes', () => {
		it('registers exchange GET routes', () => {
			// Arrange:
			const routes = [];
			const server = test.setup.createCapturingMockServer('get', routes);

			// Act:
			exchange.registerRoutes(server, {});

			// Assert:
			test.assert.assertRoutes(routes, [
				'/account/:accountId/exchange',
				'/exchange/:type/:mosaicId',
				'/exchange/mosaics'
			]);
		});
	});
});
