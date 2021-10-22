/**
 *** Copyright 2021 ProximaX Limited. All rights reserved.
*** Use of this source code is governed by the Apache 2.0
*** license that can be found in the LICENSE file.
**/

const dbTestUtils = require('../../../db/utils/dbTestUtils');
const MongoDb = require('mongodb');
const StorageDb = require('../../../../src/plugins/db/StorageDb');
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
    return bcDriveInfos.map(bcDriveInfo => createBcDriveEntry(++i, bcDriveInfo.multisig, bcDriveInfo.owner, bcDriveInfo.replicatorCount));
};

const createReplicatorEntry = (id, key, version, capacity, blsKey, drives) => ({
    _id: dbTestUtils.db.createObjectId(id),
    replicator: {
        key: new Binary(key),
        version: version ? convertToLong(version) : null,
        capacity: capacity ? convertToLong(capacity) : null,
        blsKey: new Binary(blsKey),
        drives: drives && drives.length ? 
            drives.map(drive => { return { 
                drive: new Binary(drive.drive),
                lastApprovedDataModificationId: new Binary(drive.lastApprovedDataModificationId),
                dataModificationIdIsValid: drive.dataModificationIdIsValid ? drive.dataModificationIdIsValid : 0,
                initialDownloadWork: convertToLong(drive.initialDownloadWork)
            }}) : null,
    }
});

const createReplicatorEntries = (replicatorInfos) => {
    let i = 0;
    return replicatorInfos.map(replicatorInfo => createReplicatorEntry(++i, replicatorInfo.key, replicatorInfo.version, replicatorInfo.capacity, replicatorInfo.blsKey, replicatorInfo.drives));
};

const createDownloadEntry = (id, downloadChannelId, consumer, downloadSize, downloadApprovalCount, listOfPublicKeys) => ({
    _id: dbTestUtils.db.createObjectId(id),
    downloadChannelInfo: {
        id: downloadChannelId ? new Binary(downloadChannelId) : null,
        consumer: new Binary(consumer),
        downloadSize: downloadSize ? convertToLong(downloadSize) : null,
        downloadApprovalCount: downloadApprovalCount ? convertToLong(downloadApprovalCount) : null,
        listOfPublicKeys: listOfPublicKeys && listOfPublicKeys.length ? 
            listOfPublicKeys.map(publicKey => { return new Binary(publicKey) }) : null
    }
});

const createDownloadEntries = (downloadInfos) => {
    let i = 0;
    return downloadInfos.map(downloadInfo => createDownloadEntry(++i, downloadInfo.id, downloadInfo.consumer, downloadInfo.downloadSize, downloadInfo.downloadApprovalCount, downloadInfo.listOfPublicKeys));
};

const createBlsKeyEntry = (id, blsKey, key) => ({
    _id: dbTestUtils.db.createObjectId(id),
    blsKeyDoc: {
        blsKey: new Binary(blsKey),
        version: Long.fromNumber(0),
        key: new Binary(key)
    }
});

const createBlsKeyEntries = (blsKeyInfos) => {
    let i = 0;
    return blsKeyInfos.map(blsKeyInfo => createBlsKeyEntry(++i, blsKeyInfo.blsKey, blsKeyInfo.key));
};


const storageDbTestUtils = {
    db: {
        createBcDriveEntry,
        createBcDriveEntries,
        createReplicatorEntry,
        createReplicatorEntries,
        createDownloadEntry,
        createDownloadEntries,
        createBlsKeyEntry,
        createBlsKeyEntries,
        runDbTest: (dbEntities, collectionName, issueDbCommand, assertDbCommandResult) =>
            dbTestUtils.db.runDbTest(dbEntities, collectionName, db => new StorageDb(db), issueDbCommand, assertDbCommandResult)
    }
};
Object.assign(storageDbTestUtils, test);

module.exports = storageDbTestUtils;
