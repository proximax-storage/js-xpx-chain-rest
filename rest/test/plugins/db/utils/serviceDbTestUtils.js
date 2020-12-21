/**
 *** Copyright 2019 ProximaX Limited. All rights reserved.
 *** Use of this source code is governed by the Apache 2.0
 *** license that can be found in the LICENSE file.
 **/

const dbTestUtils = require('../../../db/utils/dbTestUtils');
const MongoDb = require('mongodb');
const ServiceDb = require('../../../../src/plugins/db/ServiceDb');
const test = require('../../../testUtils');
const { convertToLong } = require('../../../../src/db/dbUtils');

const { Binary, Long } = MongoDb;

const createDriveEntry = (id, multisig, owner, replicators, start, state) => ({
	_id: dbTestUtils.db.createObjectId(id),
	drive: {
		multisig: new Binary(multisig.publicKey),
		multisigAddress: new Binary(multisig.address),
		owner: owner ? new Binary(owner) : null,
		start: start ? convertToLong(start) : null,
		state: state ? state : 0,
		replicators: replicators && replicators.length ?
			replicators.map(key => { return { replicator: new Binary(key) }}) : null
	}
});

const createDriveEntries = (driveInfos) => {
	let i = 0;
	return driveInfos.map(driveInfo => createDriveEntry(++i, driveInfo.multisig, driveInfo.owner, driveInfo.replicators));
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

const driveDbTestUtils = {
	db: {

		createDriveEntry,
		createDriveEntries,
		createDownloadEntry,
		createDownloadEntries,
		runDbTest: (dbEntities, collectionName, issueDbCommand, assertDbCommandResult) =>
			dbTestUtils.db.runDbTest(dbEntities, collectionName, db => new ServiceDb(db), issueDbCommand, assertDbCommandResult)
	}
};
Object.assign(driveDbTestUtils, test);

module.exports = driveDbTestUtils;
