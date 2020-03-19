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

	const assertGetSuperContract = (driveKey, ownerKey, additionalAccounts, issueDbCommand) => {
		// Arrange:
		const entries = [];
		const expectedEntries = [];
		let i = 0;
		for (; i < 5; ++i)
			entries.push(test.db.createSuperContractEntry(i, genAccount(), genAccount().publicKey, genAccount().publicKey));
		additionalAccounts.forEach(account => {
			entries.push(test.db.createSuperContractEntry(i, account, driveKey, ownerKey));
			expectedEntries.push(test.db.createSuperContractEntry(i++, account, driveKey, ownerKey));
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
				return assertGetSuperContract(genAccount().publicKey, genAccount().publicKey, additionalAccounts,
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
			return assertGetSuperContract(driveKey, genAccount().publicKey, additionalAccounts, db => db.getSuperContractsByDrivePublicKey(driveKey));
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

	describe('supercontracts by owner public key', () => {
		const assertSuperContractsByOwnerPublicKey = (ownerKey, additionalAccounts) => {
			return assertGetSuperContract(genAccount().publicKey, ownerKey, additionalAccounts,
					db => db.getSuperContractsByOwnerPublicKey(ownerKey, undefined, 100, { sortOrder: 1 }));
		};

		it('returns empty array for unknown public key', () => {
			return assertSuperContractsByOwnerPublicKey(genAccount().publicKey, []);
		});

		it('returns single matching entry', () => {
			return assertSuperContractsByOwnerPublicKey(genAccount().publicKey, [genAccount()]);
		});

		it('returns multiple matching entries', () => {
			return assertSuperContractsByOwnerPublicKey(genAccount().publicKey, [genAccount(), genAccount(), genAccount()]);
		});

		describe('query respects supplied document id', () => {
			const assertGetSuperContractByOwnerPublicKeyWithDocumentId = (sortOrder) => {
				// Arrange:
				const ownerKey = genAccount().publicKey;
				const entries = [];
				let expectedEntries = [];
				let i = 0;
				for (; i < 100; ++i) {
					const multisig = genAccount();
					const driveKey = genAccount().publicKey;
					entries.push(test.db.createSuperContractEntry(i, multisig, driveKey, ownerKey));
					expectedEntries.push(test.db.createSuperContractEntry(i, multisig, driveKey, ownerKey));
				}
				const id = entries[9]._id.toString();
				expectedEntries = sortOrder > 0 ?
					expectedEntries.slice(10) :
					expectedEntries.slice(0, 9).reverse();
				expectedEntries.forEach(entry => { delete entry._id; });

				// Assert:
				return test.db.runDbTest(
					entries,
					db => db.getSuperContractsByOwnerPublicKey(ownerKey, id, 100, { sortOrder }),
					entities => expect(entities).to.deep.equal(expectedEntries)
				);
			};

			it('ascending order', () => {
				return assertGetSuperContractByOwnerPublicKeyWithDocumentId(1);
			});

			it('descending order', () => {
				return assertGetSuperContractByOwnerPublicKeyWithDocumentId(-1);
			});
		});

		describe('paging', () => {
			const assertGetSuperContractByOwnerPublicKeyWithPaging = (sortOrder, pageSize, expectedSize) => {
				// Arrange:
				const ownerKey = genAccount().publicKey;
				const entries = [];
				let i = 0;
				for (; i < 200; ++i)
					entries.push(test.db.createSuperContractEntry(i, genAccount(), genAccount().publicKey, ownerKey));

				// Assert:
				return test.db.runDbTest(
					entries,
					db => db.getSuperContractsByOwnerPublicKey(ownerKey, undefined, pageSize, { sortOrder }),
					entities => expect(entities.length).to.equal(expectedSize)
				);
			};

			describe('query respects page size', () => {
				it('ascending order', () => {
					return assertGetSuperContractByOwnerPublicKeyWithPaging(1, 50, 50);
				});

				it('descending order', () => {
					return assertGetSuperContractByOwnerPublicKeyWithPaging(-1, 50, 50);
				});
			});

			describe('query ensures minimum page size', () => {
				it('ascending order', () => {
					return assertGetSuperContractByOwnerPublicKeyWithPaging(1, 5, 10);
				});

				it('descending order', () => {
					return assertGetSuperContractByOwnerPublicKeyWithPaging(-1, 5, 10);
				});
			});

			describe('query ensures maximum page size', () => {
				it('ascending order', () => {
					return assertGetSuperContractByOwnerPublicKeyWithPaging(1, 150, 100);
				});

				it('descending order', () => {
					return assertGetSuperContractByOwnerPublicKeyWithPaging(-1, 150, 100);
				});
			});
		});
	});
});
