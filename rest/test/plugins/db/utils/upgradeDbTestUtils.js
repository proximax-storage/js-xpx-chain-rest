/**
 *** Copyright 2019 ProximaX Limited. All rights reserved.
 *** Use of this source code is governed by the Apache 2.0
 *** license that can be found in the LICENSE file.
 **/

const dbTestUtils = require('../../../db/utils/dbTestUtils');
const MongoDb = require('mongodb');
const UpgradeDb = require('../../../../src/plugins/db/UpgradeDb');
const test = require('../../../testUtils');

const { Long } = MongoDb;

const createUpgradeEntry = (id, height) => ({
	_id: dbTestUtils.db.createObjectId(id),
	blockchainUpgrade: {
		height: Long.fromNumber(height)
	}
});

const createUpgradeEntries = (heights) => {
	let i = 0;
	return heights.map(height => createUpgradeEntry(++i, height));
};

const upgradeDbTestUtils = {
	db: {
		createUpgradeEntries,
		runDbTest: (dbEntities, issueDbCommand, assertDbCommandResult) =>
			dbTestUtils.db.runDbTest(dbEntities, 'blockchainUpgrades', db => new UpgradeDb(db), issueDbCommand, assertDbCommandResult)
	}
};
Object.assign(upgradeDbTestUtils, test);

module.exports = upgradeDbTestUtils;
