/**
 *** Copyright 2019 ProximaX Limited. All rights reserved.
 *** Use of this source code is governed by the Apache 2.0
 *** license that can be found in the LICENSE file.
 **/

const dbTestUtils = require('../../../db/utils/dbTestUtils');
const MongoDb = require('mongodb');
const LockFundDb = require('../../../../src/plugins/db/LockFundDb');
const test = require('../../../testUtils');
const { convertToLong } = require('../../../../src/db/dbUtils');
const { Binary, Long } = MongoDb;

const createLockFundKeyRecordEntry = (id, identifierKey) => ({
	_id: dbTestUtils.db.createObjectId(id),
	lockFundRecordGroup: {
		identifier: new Binary(identifierKey),
		records: [
			{
				key: Long.fromNumber(100),
				activeMosaics: [
					{
						id: Long.fromNumber(100),
						amount: Long.fromNumber(100)
					}
				],
				inactiveRecords: [
					[
						{
							id: Long.fromNumber(100),
							amount: Long.fromNumber(100)
						}
					],
				]
			},
			{
				key: Long.fromNumber(101),
				activeMosaics: [
					{
						id: Long.fromNumber(100),
						amount: Long.fromNumber(100)
					}
				],
				inactiveRecords: [
					[
						{
							id: Long.fromNumber(100),
							amount: Long.fromNumber(100)
						}
					],
				]
			}
		]
	}
});

const createLockFundHeightRecordEntry = (id, height) => ({
	_id: dbTestUtils.db.createObjectId(id),
	lockFundRecordGroup: {
		identifier: convertToLong(height),
		records: [
			{
				key: new Binary("6d28cf8e17e4682fbe6285e72b21aa26f094d8dbd18f7828358f822b428d069f"),
				activeMosaics: [
					{
						id: Long.fromNumber(100),
						amount: Long.fromNumber(100)
					}
				],
				inactiveRecords: [
					[
						{
							id: Long.fromNumber(100),
							amount: Long.fromNumber(100)
						}
					],
				]
			},
			{
				key: new Binary("6d28cf8e17e4682fbe6285e72b21aa26f094d8dbd18f7828358f822b428d069d"),
				activeMosaics: [
					{
						id: Long.fromNumber(100),
						amount: Long.fromNumber(100)
					}
				],
				inactiveRecords: [
					[
						{
							id: Long.fromNumber(100),
							amount: Long.fromNumber(100)
						}
					],
				]
			}
		]
	}
});

const lockfundDbTestUtils = {
	db: {
		createLockFundKeyRecordEntry,
		createLockFundHeightRecordEntry,
		runDbHeightTest: (dbEntities, issueDbCommand, assertDbCommandResult) =>
			dbTestUtils.db.runDbTest(dbEntities, 'lockFundHeightRecords', db => new LockFundDb(db), issueDbCommand, assertDbCommandResult),
		runDbKeyTest: (dbEntities, issueDbCommand, assertDbCommandResult) =>
			dbTestUtils.db.runDbTest(dbEntities, 'lockFundKeyRecords', db => new LockFundDb(db), issueDbCommand, assertDbCommandResult)
	}
};
Object.assign(lockfundDbTestUtils, test);

module.exports = lockfundDbTestUtils;
