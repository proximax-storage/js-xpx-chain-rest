/**
 *** Copyright 2019 ProximaX Limited. All rights reserved.
 *** Use of this source code is governed by the Apache 2.0
 *** license that can be found in the LICENSE file.
 **/

const test = require('./utils/lockfundDbTestUtils');
const { expect } = require('chai');
const catapult = require('catapult-sdk');
describe('lockfund db', () => {
	const genAccount = test.random.account;

	const assertGetLockFundRecordGroupsByKey = (account) => {
		// Arrange:
		const entries = [];
		let i = 0;
		for (; i < 4; ++i)
			entries.push(test.db.createLockFundKeyRecordEntry(i, genAccount().publicKey));
		entries.push(test.db.createLockFundKeyRecordEntry(5, account));
		const expectedEntry = test.db.createLockFundKeyRecordEntry(5, account);
		// Assert:
		return test.db.runDbKeyTest(
			entries,
			db => db.getLockFundRecordGroupByKey(account),
			entity => expect(entity).to.deep.equal(expectedEntry)
		);
	};

	const assertGetLockFundRecordGroupsByHeight = (height) => {
		// Arrange:
		const entries = [];
		let i = 0;
		for (; i < 5; ++i)
			entries.push(test.db.createLockFundHeightRecordEntry(i, catapult.utils.uint64.fromUint(1000+i)));
		entries.push(test.db.createLockFundHeightRecordEntry(5, height));
		const expectedEntry = test.db.createLockFundHeightRecordEntry(5, height);
		// Assert:
		return test.db.runDbHeightTest(
			entries,
			db => db.getLockFundRecordGroupByHeight(height),
			entity => expect(entity).to.deep.equal(expectedEntry)
		);
	};

	describe('lockfund by account id', () => {
		describe('by public key', () => assertGetLockFundRecordGroupsByKey(genAccount().publicKey));
	});

	describe('lockfund by key id', () => {
		describe('by public key', () => assertGetLockFundRecordGroupsByHeight(catapult.utils.uint64.fromUint(150)));
	});
});
