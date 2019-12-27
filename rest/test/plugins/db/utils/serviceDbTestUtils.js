/**
 *** Copyright 2019 ProximaX Limited. All rights reserved.
 *** Use of this source code is governed by the Apache 2.0
 *** license that can be found in the LICENSE file.
 **/

const dbTestUtils = require('../../../db/utils/dbTestUtils');
const MongoDb = require('mongodb');
const ServiceDb = require('../../../../src/plugins/db/ServiceDb');
const test = require('../../../testUtils');

const { Binary } = MongoDb;

const createDriveEntry = (id, multisig, owner, replicators) => ({
	_id: dbTestUtils.db.createObjectId(id),
	drive: {
		multisig: new Binary(multisig.publicKey),
		multisigAddress: new Binary(multisig.address),
		owner: owner ? new Binary(owner) : null,
		replicators: replicators && replicators.length ?
			replicators.map(key => { return { replicator: new Binary(key) }}) : null
	}
});

const createDriveEntries = (driveInfos) => {
	let i = 0;
	return driveInfos.map(driveInfo => createDriveEntry(++i, driveInfo.multisig, driveInfo.owner, driveInfo.replicators));
};

const driveDbTestUtils = {
	db: {
		createDriveEntry,
		createDriveEntries,
		runDbTest: (dbEntities, issueDbCommand, assertDbCommandResult) =>
			dbTestUtils.db.runDbTest(dbEntities, 'drives', db => new ServiceDb(db), issueDbCommand, assertDbCommandResult)
	}
};
Object.assign(driveDbTestUtils, test);

module.exports = driveDbTestUtils;
