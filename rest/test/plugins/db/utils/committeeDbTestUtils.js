/**
 *** Copyright 2020 ProximaX Limited. All rights reserved.
 *** Use of this source code is governed by the Apache 2.0
 *** license that can be found in the LICENSE file.
 **/

const dbTestUtils = require('../../../db/utils/dbTestUtils');
const MongoDb = require('mongodb');
const CommitteeDb = require('../../../../src/plugins/db/CommitteeDb');
const test = require('../../../testUtils');

const { Binary, Long } = MongoDb;

const createCommitteeEntry = (id, harvester) => ({
	_id: dbTestUtils.db.createObjectId(id),
	harvester: {
		key: new Binary(harvester.publicKey),
		address: new Binary(harvester.address),
        lastSigningBlockHeight: Long.fromNumber(id + 1),
        effectiveBalance: Long.fromNumber(id * 10),
		canHarvest: true,
		activity: 0.5,
		greed: 0.1
	}
});

const committeeDbTestUtils = {
	db: {
		createCommitteeEntry,
		runDbTest: (dbEntities, issueDbCommand, assertDbCommandResult) =>
			dbTestUtils.db.runDbTest(dbEntities, 'harvesters', db => new CommitteeDb(db), issueDbCommand, assertDbCommandResult)
	}
};
Object.assign(committeeDbTestUtils, test);

module.exports = committeeDbTestUtils;
