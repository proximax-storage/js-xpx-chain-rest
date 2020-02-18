/*
 * Copyright (c) 2016-present,
 * Jaguar0625, gimre, BloodyRookie, Tech Bureau, Corp. All rights reserved.
 *
 * This file is part of Catapult.
 *
 * Catapult is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Lesser General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * Catapult is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License
 * along with Catapult.  If not, see <http://www.gnu.org/licenses/>.
 */

const richlistRoutes = require('../../../src/plugins/routes/richlistRoutes');
const test = require('../../routes/utils/routeTestUtils');
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
