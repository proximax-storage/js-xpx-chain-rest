/**
 *** Copyright 2019 ProximaX Limited. All rights reserved.
 *** Use of this source code is governed by the Apache 2.0
 *** license that can be found in the LICENSE file.
 **/

const dbTestUtils = require('../../../db/utils/dbTestUtils');
const MongoDb = require('mongodb');
const MetadataDb = require('../../../../src/plugins/db/MetadataDb');
const test = require('../../../testUtils');

const { Binary } = MongoDb;

const createMetadataEntry = (id, metadataId) => ({
	_id: dbTestUtils.db.createObjectId(id),
	metadata: {
		metadataId: new Binary(metadataId)
	}
});

const createMetadataEntries = (metadataIds) => {
	let i = 0;
	return metadataIds.map(metadataId => createMetadataEntry(++i, metadataId));
};

const metadataDbTestUtils = {
	db: {
		createMetadataEntry,
		createMetadataEntries,
		runDbTest: (dbEntities, issueDbCommand, assertDbCommandResult) =>
			dbTestUtils.db.runDbTest(dbEntities, 'metadatas', db => new MetadataDb(db), issueDbCommand, assertDbCommandResult)
	}
};
Object.assign(metadataDbTestUtils, test);

module.exports = metadataDbTestUtils;
