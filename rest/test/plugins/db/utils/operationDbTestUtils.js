/**
 *** Copyright 2019 ProximaX Limited. All rights reserved.
 *** Use of this source code is governed by the Apache 2.0
 *** license that can be found in the LICENSE file.
 **/

const dbTestUtils = require('../../../db/utils/dbTestUtils');
const MongoDb = require('mongodb');
const OperationDb = require('../../../../src/plugins/db/OperationDb');
const test = require('../../../testUtils');

const { Binary } = MongoDb;

const createOperationEntry = (id, initiator, token) => ({
	_id: dbTestUtils.db.createObjectId(id),
	operation: {
		account: new Binary(initiator.publicKey),
		accountAddress: new Binary(initiator.address),
		token: new Binary(token)
	}
});

const operationDbTestUtils = {
	db: {
		createOperationEntry,
		runDbTest: (dbEntities, issueDbCommand, assertDbCommandResult) =>
			dbTestUtils.db.runDbTest(dbEntities, 'operations', db => new OperationDb(db), issueDbCommand, assertDbCommandResult)
	}
};
Object.assign(operationDbTestUtils, test);

module.exports = operationDbTestUtils;
