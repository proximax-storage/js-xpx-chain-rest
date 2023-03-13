/**
 *** Copyright 2023 ProximaX Limited. All rights reserved.
 *** Use of this source code is governed by the Apache 2.0
 *** license that can be found in the LICENSE file.
 **/

const AccountType = require('../../../src/plugins/AccountType');
const test = require('./utils/supercontractV2DbTestUtils');
const { expect } = require('chai');

describe('supercontract v2 db', () => {
	const genAccount = test.random.account;
    const genHash = test.random.hash;

	const assertGetSuperContractV2 = (driveKey, executionPaymentKey, assignee, creator, deploymentBaseModificationId, additionalAccounts, issueDbCommand) => {
		// Arrange:
		const entries = [];
		const expectedEntries = [];
		let i = 0;
		for (; i < 5; ++i)
			entries.push(test.db.createSuperContractV2Entry(i, genAccount(), genAccount().publicKey, genAccount().publicKey, genAccount().publicKey, genAccount().publicKey, genHash()));
		additionalAccounts.forEach(account => {
			entries.push(test.db.createSuperContractV2Entry(i, account, driveKey, executionPaymentKey, assignee, creator, deploymentBaseModificationId));
			expectedEntries.push(test.db.createSuperContractV2Entry(i++, account, driveKey, executionPaymentKey, assignee, creator, deploymentBaseModificationId));
		});
		expectedEntries.forEach(entry => { delete entry._id; });

		// Assert:
		return test.db.runDbTest(
			entries,
			issueDbCommand,
			entities => expect(entities).to.deep.equal(expectedEntries)
		);
	};

	describe('supercontracts by account id', () => {
		const addSuperContractByAccountIdTests = traits => {
			const assertSuperContractByAccountId = (account, additionalAccounts) => {
				return assertGetSuperContractV2(genAccount().publicKey, genAccount().publicKey, genAccount().publicKey, genAccount().publicKey, genHash(), additionalAccounts,
					db => db.getSuperContractByAccountId(traits.type, traits.toDbApiId(account)));
			};

			it('returns empty array for unknown id', () => {
				return assertSuperContractByAccountId(genAccount(), []);
			});

			it('returns single matching entry', () => {
				const account = genAccount();
				return assertSuperContractByAccountId(account, [account]);
			});
		};

		describe('by public key', () => addSuperContractByAccountIdTests({
			type: AccountType.publicKey,
			toDbApiId: account => account.publicKey
		}));

		describe('by address', () => addSuperContractByAccountIdTests({
			type: AccountType.address,
			toDbApiId: account => account.address
		}));
	});
});
