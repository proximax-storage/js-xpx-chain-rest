/**
 *** Copyright 2019 ProximaX Limited. All rights reserved.
 *** Use of this source code is governed by the Apache 2.0
 *** license that can be found in the LICENSE file.
 **/

const dbTestUtils = require('../../../db/utils/dbTestUtils');
const MongoDb = require('mongodb');
const ConfigDb = require('../../../../src/plugins/db/ConfigDb');
const test = require('../../../testUtils');

const { Long } = MongoDb;

const createConfigEntry = (id, height) => ({
	_id: dbTestUtils.db.createObjectId(id),
	networkConfig: {
		height: Long.fromNumber(height)
	}
});

const createConfigEntries = (heights) => {
	let i = 0;
	return heights.map(height => createConfigEntry(++i, height));
};

const configDbTestUtils = {
	db: {
		createConfigEntries,
		runDbTest: (dbEntities, issueDbCommand, assertDbCommandResult) =>
			dbTestUtils.db.runDbTest(dbEntities, 'networkConfigs', db => new ConfigDb(db), issueDbCommand, assertDbCommandResult)
	}
};
Object.assign(configDbTestUtils, test);

module.exports = configDbTestUtils;
