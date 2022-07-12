/**
 *** Copyright 2019 ProximaX Limited. All rights reserved.
 *** Use of this source code is governed by the Apache 2.0
 *** license that can be found in the LICENSE file.
 **/

const MosaicRestrictionsDb = require('../../src/plugins/db/MosaicRestrictionDb');
const mosaicRestriction = require('../../src/plugins/mosaicRestriction');
const { test } = require('../routes/utils/routeTestUtils');
const pluginTest = require('../plugins/utils/pluginTestUtils');

describe('mosaic restrictions plugin', () => {
	pluginTest.assertThat.pluginCreatesDb(mosaicRestriction, MosaicRestrictionsDb);
	pluginTest.assertThat.pluginDoesNotRegisterAdditionalTransactionStates(mosaicRestriction);
	pluginTest.assertThat.pluginDoesNotRegisterAdditionalMessageChannels(mosaicRestriction);

	describe('register routes', () => {
		it('registers restrictions GET routes', () => {
			// Arrange:
			const routes = [];
			const server = test.setup.createCapturingMockServer('get', routes);

			// Act:
			mosaicRestriction.registerRoutes(server, {}, { network: { name: 'testnet' } });

			// Assert:
			test.assert.assertRoutes(routes, [
				'/restrictions/mosaic',
				'/restrictions/mosaic/:compositeHash',
				'/restrictions/mosaic/:compositeHash/merkle'
			]);
		});

		it('registers POST routes', () => {
			// Arrange:
			const routes = [];
			const server = test.setup.createCapturingMockServer('post', routes);

			// Act:
			mosaicRestriction.registerRoutes(server, {});

			// Assert:
			test.assert.assertRoutes(routes, [
				'/restrictions/mosaic',
			]);
		});
	});
});
