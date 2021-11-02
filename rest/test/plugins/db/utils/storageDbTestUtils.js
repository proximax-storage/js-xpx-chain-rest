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

const createBcDriveEntry = (id, multisig, owner, rootHash, size, usedSize, metaFilesSize, replicatorCount) => ({
    _id: dbTestUtils.db.createObjectId(id),
    drive: {
        multisig: new Binary(multisig.publicKey),
        multisigAddress: new Binary(multisig.address),
        owner: owner ? new Binary(owner) : null,
        rootHash: rootHash ? new Binary(rootHash) : null,
        size: size ? convertToLong(size) : null,
        usedSize: usedSize ? convertToLong(usedSize) : null,
        metaFilesSize: metaFilesSize ? convertToLong(metaFilesSize) : null,
        replicatorCount: replicatorCount ? convertToLong(replicatorCount) : null,
    }
});

const createBcDriveEntries = (bcDriveInfos) => {
    let i = 0;
    return bcDriveInfos.map(bcDriveInfo => createBcDriveEntry(
        ++i, 
        bcDriveInfo.multisig, 
        bcDriveInfo.owner, 
        bcDriveInfo.rootHash,
        bcDriveInfo.size,
        bcDriveInfo.usedSize,
        bcDriveInfo.metaFilesSize,
        bcDriveInfo.replicatorCount));
};

const createReplicatorEntry = (id, key, version, capacity, blsKey, drives) => ({
    _id: dbTestUtils.db.createObjectId(id),
    replicator: {
        key: key ? new Binary(key) : null,
        version: version ? convertToLong(version) : null,
        capacity: capacity ? convertToLong(capacity) : null,
        blsKey: blsKey ? new Binary(blsKey) : null,
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

const createDownloadChannelEntry = (id, downloadChannelId, consumer, downloadSize, downloadApprovalCount, listOfPublicKeys) => ({
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

const createDownloadChannelEntries = (downloadInfos) => {
    let i = 0;
    return downloadInfos.map(downloadInfo => createDownloadChannelEntry(++i, downloadInfo.id, downloadInfo.consumer, downloadInfo.downloadSize, downloadInfo.downloadApprovalCount, downloadInfo.listOfPublicKeys));
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
        createDownloadChannelEntry,
        createDownloadChannelEntries,
        createBlsKeyEntry,
        createBlsKeyEntries,
        runDbTest: (dbEntities, collectionName, issueDbCommand, assertDbCommandResult) =>
            dbTestUtils.db.runDbTest(dbEntities, collectionName, db => new StorageDb(db), issueDbCommand, assertDbCommandResult)
    }
};
Object.assign(storageDbTestUtils, test);

module.exports = storageDbTestUtils;
