/**
 *** Copyright 2020 ProximaX Limited. All rights reserved.
 *** Use of this source code is governed by the Apache 2.0
 *** license that can be found in the LICENSE file.
 **/

const AccountType = require('../../../src/plugins/AccountType');
const test = require('./utils/committeeDbTestUtils');
const { expect } = require('chai');

describe('committee db', () => {
	const assertGetHarvester = (additionalAccounts, issueDbCommand) => {
		// Arrange:
		const entries = [];
		const expectedEntries = [];
		let i = 0;
		for (; i < 5; ++i)
			entries.push(test.db.createCommitteeEntry(i, test.random.account()));
        additionalAccounts.forEach(account => {
			entries.push(test.db.createCommitteeEntry(i, account));
			expectedEntries.push(test.db.createCommitteeEntry(i++, account));
		});
		expectedEntries.forEach(entry => { delete entry._id; });

		// Assert:
		return test.db.runDbTest(
			entries,
			issueDbCommand,
			entities =>
                expect(entities).to.deep.equal(expectedEntries)
		);
	};

	describe('harvesters by account id', () => {
		const addHarvestersByAccountIdTests = traits => {
			const assertHarvestersByAccountId = (account, additionalAccounts) => {
				return assertGetHarvester(additionalAccounts,
                        db => db.getHarvesterByAccountId(traits.type, traits.toDbApiId(account)));
			};

			it('returns empty array for unknown id', () => {
				return assertHarvestersByAccountId(test.random.account(), []);
			});

			it('returns single matching entry', () => {
			    const account = test.random.account();
				return assertHarvestersByAccountId(account, [account]);
			});
		};

		describe('by public key', () => addHarvestersByAccountIdTests({
			type: AccountType.publicKey,
			toDbApiId: account => account.publicKey
		}));

		describe('by address', () => addHarvestersByAccountIdTests({
			type: AccountType.address,
			toDbApiId: account => account.address
		}));
	});
});
