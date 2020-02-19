/**
 *** Copyright 2019 ProximaX Limited. All rights reserved.
 *** Use of this source code is governed by the Apache 2.0
 *** license that can be found in the LICENSE file.
 **/

const pluginTest = require('./utils/pluginTestUtils');
const richlist = require('../../src/plugins/richlist');
const RichlistDb = require('../../src/plugins/db/RichlistDb');
const test = require('../routes/utils/routeTestUtils');

describe('richlist plugin', () => {
	pluginTest.assertThat.pluginCreatesDb(richlist, RichlistDb);
	pluginTest.assertThat.pluginDoesNotRegisterAdditionalTransactionStates(richlist);
	pluginTest.assertThat.pluginDoesNotRegisterAdditionalMessageChannels(richlist);

	describe('richlist routes', () => {
		it('registers richlist GET routes', () => {
			// Arrange:
			const routes = [];
			const server = test.setup.createCapturingMockServer('get', routes);

			// Act:
			richlist.registerRoutes(server, {}, { config: {} });

			// Assert:
			test.assert.assertRoutes(routes, [
				'/mosaic/:mosaicId/richlist'
			]);
		});
	});
});
