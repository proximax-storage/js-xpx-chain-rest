/**
 *** Copyright 2023 ProximaX Limited. All rights reserved.
*** Use of this source code is governed by the Apache 2.0
*** license that can be found in the LICENSE file.
**/

const dbTestUtils = require('../../../db/utils/dbTestUtils');
const MongoDb = require('mongodb');
const SuperContractV2Db = require('../../../../src/plugins/db/SuperContractV2Db');
const test = require('../../../testUtils');

const { Binary } = MongoDb;

const createSuperContractV2Entry = (id, account, driveKey, executionPaymentKey, assignee, creator, deploymentBaseModificationId) => ({
    _id: dbTestUtils.db.createObjectId(id),
    supercontract: {
    contractKey: new Binary(account.publicKey),
    contractAddress: new Binary(account.address),
    driveKey: new Binary(driveKey),
    executionPaymentKey: new Binary(executionPaymentKey),
    assignee: new Binary(assignee),
    creator: new Binary(creator),
    deploymentBaseModificationId: new Binary(deploymentBaseModificationId),
    }
});

const supercontractV2DbTestUtils = {
    db: {
    createSuperContractV2Entry,
    runDbTest: (dbEntities, issueDbCommand, assertDbCommandResult) =>
        dbTestUtils.db.runDbTest(dbEntities, 'supercontracts', db => new SuperContractV2Db(db), issueDbCommand, assertDbCommandResult)
    }
};
Object.assign(supercontractV2DbTestUtils, test);

module.exports = supercontractV2DbTestUtils;
