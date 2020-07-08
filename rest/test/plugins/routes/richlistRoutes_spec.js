/**
 *** Copyright 2019 ProximaX Limited. All rights reserved.
 *** Use of this source code is governed by the Apache 2.0
 *** license that can be found in the LICENSE file.
 **/

const richlistRoutes = require('../../../src/plugins/routes/richlistRoutes');
const { test } = require('../../routes/utils/routeTestUtils');
const restify = require('restify');
const sinon = require('sinon');
const { expect } = require('chai');

describe('richlist routes', () => {
	describe('get richlist', () => {
		it('/mosaic/:mosaicId/richlist', () => {
			// Arrange:
			const keyGroups = [];
			const dummyDbRes = [{
				'address': "B0CF8A95590ED878705A70DE397B45F58BD4FFE0F739900623",
				'amount': [
					3864353992,
					95248
				]
			}];

			const db = test.setup.createCapturingDb('descendingAccountMosaicBalances', keyGroups, dummyDbRes);

			// Act:
			const registerRoutes = richlistRoutes.register;
			test.route.executeSingle(
				registerRoutes,
				'/mosaic/:mosaicId/richlist',
				'get',
				{ mosaicId: '5CC0E4C7884FA22A', page: '1', pageSize: '10' },
				db,
				{},
				response => {
					// Assert:
					expect(keyGroups).to.deep.equal([[ 2286920234, 1556145351 ] /* mosaicId */, 1 /* page */, 10 /* pageSize */]);
					expect(response).to.deep.equal({ payload: dummyDbRes, type: 'richlistEntry' });
				}
			);
		});
	});
});
