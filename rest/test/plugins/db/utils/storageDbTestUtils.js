/**
 *** Copyright 2021 ProximaX Limited. All rights reserved.
*** Use of this source code is governed by the Apache 2.0
*** license that can be found in the LICENSE file.
**/

const dbTestUtils = require('../../../db/utils/dbTestUtils');
const MongoDb = require('mongodb');
const ServiceDb = require('../../../../src/plugins/db/StorageDb');
const test = require('../../../testUtils');
const { convertToLong } = require('../../../../src/db/dbUtils');

const { Binary, Long } = MongoDb;

const createBcDriveEntry = (id, multisig, owner, replicatorCount) => ({
    _id: dbTestUtils.db.createObjectId(id),
    drive: {
        multisig: new Binary(multisig.publicKey),
        multisigAddress: new Binary(multisig.address),
        owner: owner ? new Binary(owner) : null,
        replicatorCount: replicatorCount ? convertToLong(replicatorCount) : null
    }
});

const createBcDriveEntries = (bcDriveInfos) => {
    let i = 0;
    return bcDriveInfos.map(bcDriveInfo => createDriveEntry(++i, bcDriveInfo.multisig, bcDriveInfo.owner, bcDriveInfo.replicatorCount));
};

const createReplicatorEntry = (id, multisig, drives) => ({
    _id: dbTestUtils.db.createObjectId(id),
    replicator: {
        multisig: new Binary(multisig.publicKey),
        multisigAddress: new Binary(multisig.address),
        drives: drives && drives.length ? 
            drives.map(lastApprovedDataModificationId => { return { drive: new Binary(lastApprovedDataModificationId) } }) : null,
    }
});

const createReplicatorEntries = (replicatorInfos) => {
    let i = 0;
    return replicatorInfos.map(replicatorInfo => createReplicatorEntry(++i, replicatorInfo.multisig, replicatorInfo.drives));
};

const createDownloadEntry = (id, account, operationToken, fileRecipient, files) => ({
    _id: dbTestUtils.db.createObjectId(id),
    downloadInfo: {
        driveKey: new Binary(account.publicKey),
        driveAddress: new Binary(account.address),
        operationToken: new Binary(operationToken),
        fileRecipient: new Binary(fileRecipient),
        height: Long.fromNumber(0),
        files: files && files.length ?
            files.map(file => { return {
                fileHash: new Binary(file.fileHash),
                fileSize: Long.fromNumber(file.fileSize)
            }}) : null,
    }
});

const createDownloadEntries = (downloadInfos) => {
    let i = 0;
    return downloadInfos.map(downloadInfo => createDownloadEntry(
        ++i,
        downloadInfo.account,
        downloadInfo.operationToken,
        downloadInfo.fileRecipient,
        downloadInfo.files
    ));
};

const storageDbTestUtils = {
    db: {
        createBcDriveEntry,
        createBcDriveEntries,
        createReplicatorEntry,
        createReplicatorEntries,
        createDownloadEntry,
        createDownloadEntries,
        runDbTest: (dbEntities, collectionName, issueDbCommand, assertDbCommandResult) =>
            dbTestUtils.db.runDbTest(dbEntities, collectionName, db => new ServiceDb(db), issueDbCommand, assertDbCommandResult)
    }
};
Object.assign(storageDbTestUtils, test);

module.exports = storageDbTestUtils;
