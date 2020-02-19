/**
 *** Copyright 2019 ProximaX Limited. All rights reserved.
 *** Use of this source code is governed by the Apache 2.0
 *** license that can be found in the LICENSE file.
 **/

const dbTestUtils = require('../../../db/utils/dbTestUtils');
const MongoDb = require('mongodb');
const RichlistDb = require('../../../../src/plugins/db/RichlistDb');
const test = require('../../../testUtils');

const { Long } = MongoDb;

const createMinimalAccountEntry = (id, mosaicId, mosaicAmount) => {

	const mosaics = [
		{ id: mosaicId, amount: Long.fromNumber(mosaicAmount) },
		{ id: Long.fromNumber(99999999), amount: Long.fromNumber(0) } // dummy to test
	];
	const publicKey = test.random.publicKey();

	const acct = dbTestUtils.db.createAccount(publicKey, false, mosaics, []);
	acct._id = dbTestUtils.db.createObjectId(id);
	return acct
};

const createMinimalAccountEntries = (mosaicId, mosaicAmounts) => {
	let i = 0;
	return mosaicAmounts.map(amt => createMinimalAccountEntry(++i, mosaicId, amt));

};

const richlistDbTestUtils = {
	db: {
		createMinimalAccountEntries,
		runDbTest: (dbEntities, issueDbCommand, assertDbCommandResult) =>
			dbTestUtils.db.runDbTest(dbEntities, 'accounts', db => new RichlistDb(db), issueDbCommand, assertDbCommandResult)
	}
};
Object.assign(richlistDbTestUtils, test);

module.exports = richlistDbTestUtils;
