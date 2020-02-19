/**
 *** Copyright 2019 ProximaX Limited. All rights reserved.
 *** Use of this source code is governed by the Apache 2.0
 *** license that can be found in the LICENSE file.
 **/

const dbTestUtils = require('../../../db/utils/dbTestUtils');
const MongoDb = require('mongodb');
const SuperContractDb = require('../../../../src/plugins/db/SuperContractDb');
const test = require('../../../testUtils');

const { Binary } = MongoDb;

const createSuperContractEntry = (id, account, mainDriveKey) => ({
	_id: dbTestUtils.db.createObjectId(id),
	supercontract: {
		multisig: new Binary(account.publicKey),
		multisigAddress: new Binary(account.address),
		mainDriveKey: new Binary(mainDriveKey)
	}
});

const supercontractDbTestUtils = {
	db: {
		createSuperContractEntry,
		runDbTest: (dbEntities, issueDbCommand, assertDbCommandResult) =>
			dbTestUtils.db.runDbTest(dbEntities, 'supercontracts', db => new SuperContractDb(db), issueDbCommand, assertDbCommandResult)
	}
};
Object.assign(supercontractDbTestUtils, test);

module.exports = supercontractDbTestUtils;
