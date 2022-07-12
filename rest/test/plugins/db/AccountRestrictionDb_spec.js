/**
 *** Copyright 2019 ProximaX Limited. All rights reserved.
 *** Use of this source code is governed by the Apache 2.0
 *** license that can be found in the LICENSE file.
 **/

const test = require('./utils/restrictionsDbTestUtils');
const { expect } = require('chai');

describe('accountRestriction db', () => {
	const removeMongoId = entity => {
		delete entity.meta.id;
		return entity;
	};

	it('returns undefined for unknown account', () => {
		// Arrange:
		const { address } = test.random.account();
		const accountRestrictions1 = test.accountDb.createAccountRestrictions(address, {
			numAddresses: 3, numMosaics: 3, numOperations: 3
		});

		// Assert:
		return test.accountDb.runDbTest(
			accountRestrictions1,
			db => db.accountRestrictionsByAddresses([[123, 456]]),
			entities => { expect(entities).to.deep.equal([]); }
		);
	});

	it('returns found empty account restrictions for single account', () => {
		// Arrange:
		const { address } = test.random.account();
		const randomAddress1 = test.random.account().address;
		const randomAddress2 = test.random.account().address;
		const accountRestrictions1 = test.accountDb.createAccountRestrictions(
			randomAddress1,
			{ numAddresses: 0, numMosaics: 0, numOperations: 0 }
		);
		const accountRestrictions2 = test.accountDb.createAccountRestrictions(
			address,
			{ numAddresses: 0, numMosaics: 0, numOperations: 0 }
		);
		const accountRestrictions3 = test.accountDb.createAccountRestrictions(
			randomAddress2,
			{ numAddresses: 0, numMosaics: 0, numOperations: 0 }
		);

		// Assert:
		return test.accountDb.runDbTest(
			[accountRestrictions1, accountRestrictions2, accountRestrictions3],
			db => db.accountRestrictionsByAddresses([address]),
			entities => { expect(entities).to.deep.equal([removeMongoId(accountRestrictions2)]); }
		);
	});

	it('returns found populated account restrictions for single account', () => {
		// Arrange:
		const { address } = test.random.account();
		const randomAddress1 = test.random.account().address;
		const randomAddress2 = test.random.account().address;
		const accountRestrictions1 = test.accountDb.createAccountRestrictions(
			randomAddress1,
			{ numAddresses: 3, numMosaics: 6, numOperations: 2 }
		);
		const accountRestrictions2 = test.accountDb.createAccountRestrictions(
			address,
			{ numAddresses: 3, numMosaics: 6, numOperations: 2 }
		);
		const accountRestrictions3 = test.accountDb.createAccountRestrictions(
			randomAddress2,
			{ numAddresses: 3, numMosaics: 6, numOperations: 2 }
		);

		// Assert:
		return test.accountDb.runDbTest(
			[accountRestrictions1, accountRestrictions2, accountRestrictions3],
			db => db.accountRestrictionsByAddresses([address]),
			entities => { expect(entities[0]).to.deep.equal(removeMongoId(accountRestrictions2)); }
		);
	});

	it('returns found populated account restrictions for multiple accounts', () => {
		// Arrange:
		const { address } = test.random.account();
		const randomAddress1 = test.random.account().address;
		const accountRestrictions1 = test.accountDb.createAccountRestrictions(
			address,
			{ numAddresses: 3, numMosaics: 6, numOperations: 2 }
		);
		const accountRestrictions2 = test.accountDb.createAccountRestrictions(
			randomAddress1,
			{ numAddresses: 3, numMosaics: 6, numOperations: 2 }
		);
		const accountRestrictions3 = test.accountDb.createAccountRestrictions(
			address,
			{ numAddresses: 1, numMosaics: 4, numOperations: 3 }
		);

		// Assert:
		return test.accountDb.runDbTest(
			[accountRestrictions1, accountRestrictions2, accountRestrictions3],
			db => db.accountRestrictionsByAddresses([address]),
			entities => { expect(entities).to.deep.equal([removeMongoId(accountRestrictions1), removeMongoId(accountRestrictions3)]); }
		);
	});
});
