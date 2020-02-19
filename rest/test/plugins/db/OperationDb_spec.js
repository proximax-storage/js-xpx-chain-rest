/**
 *** Copyright 2019 ProximaX Limited. All rights reserved.
 *** Use of this source code is governed by the Apache 2.0
 *** license that can be found in the LICENSE file.
 **/

const AccountType = require('../../../src/plugins/AccountType');
const test = require('./utils/operationDbTestUtils');
const { expect } = require('chai');

describe('operation db', () => {
	const assertGetOperation = (account, additionalHashes, issueDbCommand) => {
		// Arrange:
		const entries = [];
		const expectedEntries = [];
		let i = 0;
		for (; i < 5; ++i)
			entries.push(test.db.createOperationEntry(i, test.random.account(), test.random.hash()));
		additionalHashes.forEach(hash => {
			entries.push(test.db.createOperationEntry(i, account, hash));
			expectedEntries.push(test.db.createOperationEntry(i++, account, hash));
		});
		expectedEntries.forEach(entry => { delete entry._id; });

		// Assert:
		return test.db.runDbTest(
			entries,
			issueDbCommand,
			entities => expect(entities).to.deep.equal(expectedEntries)
		);
	};

	describe('operations by account id', () => {
		const addOperationsByAccountIdTests = traits => {
			const assertOperationsByAccountId = (additionalHashes) => {
				const account = test.random.account();
				return assertGetOperation(account, additionalHashes, db => db.getOperationsByAccountId(traits.type, traits.toDbApiId(account)));
			};

			it('returns empty array for unknown id', () => {
				return assertOperationsByAccountId([]);
			});

			it('returns single matching entry', () => {
				return assertOperationsByAccountId([test.random.hash()]);
			});

			it('returns multiple matching entries', () => {
				return assertOperationsByAccountId([test.random.hash(), test.random.hash(), test.random.hash()]);
			});
		};

		describe('by public key', () => addOperationsByAccountIdTests({
			type: AccountType.publicKey,
			toDbApiId: account => account.publicKey
		}));

		describe('by address', () => addOperationsByAccountIdTests({
			type: AccountType.address,
			toDbApiId: account => account.address
		}));
	});

	describe('operations by token', () => {
		const assertOperationByToken = (token, additionalHashes) => {
			return assertGetOperation(test.random.account(), additionalHashes, db => db.getOperationByToken(token));
		};

		it('returns empty array for unknown token', () => {
			return assertOperationByToken(test.random.hash(), []);
		});

		it('returns single matching entry', () => {
			const token = test.random.hash();
			return assertOperationByToken(token, [token]);
		});
	});
});
