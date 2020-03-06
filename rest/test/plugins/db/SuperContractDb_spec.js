/**
 *** Copyright 2019 ProximaX Limited. All rights reserved.
 *** Use of this source code is governed by the Apache 2.0
 *** license that can be found in the LICENSE file.
 **/

const AccountType = require('../../../src/plugins/AccountType');
const test = require('./utils/supercontractDbTestUtils');
const { expect } = require('chai');

describe('supercontract db', () => {
	const genAccount = test.random.account;

	const assertGetSuperContract = (driveKey, additionalAccounts, issueDbCommand) => {
		// Arrange:
		const entries = [];
		const expectedEntries = [];
		let i = 0;
		for (; i < 5; ++i)
			entries.push(test.db.createSuperContractEntry(i, genAccount(), genAccount().publicKey));
		additionalAccounts.forEach(account => {
			entries.push(test.db.createSuperContractEntry(i, account, driveKey));
			expectedEntries.push(test.db.createSuperContractEntry(i++, account, driveKey));
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
				return assertGetSuperContract(genAccount().publicKey, additionalAccounts,
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

	describe('supercontracts by drive public key', () => {
		const assertSuperContractsByDrivePublicKey = (driveKey, additionalAccounts) => {
			return assertGetSuperContract(driveKey, additionalAccounts, db => db.getSuperContractsByDrivePublicKey(driveKey));
		};

		it('returns empty array for unknown public key', () => {
			return assertSuperContractsByDrivePublicKey(genAccount().publicKey, []);
		});

		it('returns single matching entry', () => {
			return assertSuperContractsByDrivePublicKey(genAccount().publicKey, [genAccount()]);
		});

		it('returns multiple matching entries', () => {
			return assertSuperContractsByDrivePublicKey(genAccount().publicKey, [genAccount(), genAccount(), genAccount()]);
		});
	});
});
