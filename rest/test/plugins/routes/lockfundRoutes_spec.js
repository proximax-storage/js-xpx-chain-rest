/**
 *** Copyright 2019 ProximaX Limited. All rights reserved.
 *** Use of this source code is governed by the Apache 2.0
 *** license that can be found in the LICENSE file.
 * */

const lockfundRoutes = require('../../../src/plugins/routes/lockFundRoutes');
const catapult = require('catapult-sdk');
const { test } = require('../../routes/utils/routeTestUtils');
const { expect } = require('chai');

const { publicKeys } = test.sets;
const { convert } = catapult.utils;

describe('lockfund routes', () => {
	it('/lockfund/height/:height', () => {
		// Arrange:
		const keyGroups = [];
		const db = test.setup.createCapturingDb('getLockFundRecordGroupByHeight', keyGroups, [{value: 'this is nonsense'}]);

		// Act:
		const registerRoutes = lockfundRoutes.register;
		return test.route.executeSingle(
			registerRoutes,
			'/lockfund/height/:height',
			'get',
			{height: "14202"},
			db,
			null,
			response => {
				// Assert:
				expect(keyGroups).to.deep.equal([[14202, 0]]);
				expect(response).to.deep.equal({payload: {value: 'this is nonsense'}, type: 'lockFundRecordGroupEntry_height'});
			}
		);
	});

	it('/lockfund/account/:publicKey', () => {
		// Arrange:
		const keyGroups = [];
		const db = test.setup.createCapturingDb('getLockFundRecordGroupByKey', keyGroups, [{value: 'this is nonsense'}]);

		// Act:
		const registerRoutes = lockfundRoutes.register;
		return test.route.executeSingle(
			registerRoutes,
			'/lockfund/account/:publicKey',
			'get',
			{publicKey: publicKeys.valid[0]},
			db,
			null,
			response => {
				// Assert:
				expect(keyGroups).to.deep.equal([convert.hexToUint8(publicKeys.valid[0])]);
				expect(response).to.deep.equal({payload: {value: 'this is nonsense'}, type: 'lockFundRecordGroupEntry_key'});
			}
		);
	});
});
