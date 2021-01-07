/**
 *** Copyright 2020 ProximaX Limited. All rights reserved.
 *** Use of this source code is governed by the Apache 2.0
 *** license that can be found in the LICENSE file.
 **/

const committee = require('../../src/plugins/committee');
const CommitteeDb = require('../../src/plugins/db/CommitteeDb');
const pluginTest = require('./utils/pluginTestUtils');
const { test } = require('../routes/utils/routeTestUtils');

describe('committee plugin', () => {
	pluginTest.assertThat.pluginCreatesDb(committee, CommitteeDb);
	pluginTest.assertThat.pluginDoesNotRegisterAdditionalTransactionStates(committee);
	pluginTest.assertThat.pluginDoesNotRegisterAdditionalMessageChannels(committee);

	describe('register routes', () => {
		it('registers committee GET routes', () => {
			// Arrange:
			const routes = [];
			const server = test.setup.createCapturingMockServer('get', routes);

			// Act:
			committee.registerRoutes(server, {});

			// Assert:
			test.assert.assertRoutes(routes, [
				'/account/:accountId/harvesting'
			]);
		});
	});
});
