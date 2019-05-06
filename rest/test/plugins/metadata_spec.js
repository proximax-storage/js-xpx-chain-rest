/**
 *** Copyright 2019 ProximaX Limited. All rights reserved.
 *** Use of this source code is governed by the Apache 2.0
 *** license that can be found in the LICENSE file.
 **/

const metadata = require('../../src/plugins/metadata');
const MetadataDb = require('../../src/plugins/db/MetadataDb');
const pluginTest = require('./utils/pluginTestUtils');
const test = require('../routes/utils/routeTestUtils');

describe('metadata plugin', () => {
	pluginTest.assertThat.pluginCreatesDb(metadata, MetadataDb);
	pluginTest.assertThat.pluginDoesNotRegisterAdditionalTransactionStates(metadata);
	pluginTest.assertThat.pluginDoesNotRegisterAdditionalMessageChannels(metadata);

	describe('register routes', () => {
		it('registers GET routes', () => {
			// Arrange:
			const routes = [];
			const server = test.setup.createCapturingMockServer('get', routes);

			// Act:
			metadata.registerRoutes(server, {});

			// Assert:
			test.assert.assertRoutes(routes, [
				'/account/:accountId/metadata',
				'/mosaic/:mosaicId/metadata',
				'/namespace/:namespaceId/metadata',
				'/metadata/:metadataId'
			]);
		});

		it('registers POST routes', () => {
			// Arrange:
			const routes = [];
			const server = test.setup.createCapturingMockServer('post', routes);

			// Act:
			metadata.registerRoutes(server, {});

			// Assert:
			test.assert.assertRoutes(routes, [
				'/metadata'
			]);
		});
	});
});
