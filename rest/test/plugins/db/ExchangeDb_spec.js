/**
 *** Copyright 2019 ProximaX Limited. All rights reserved.
 *** Use of this source code is governed by the Apache 2.0
 *** license that can be found in the LICENSE file.
 **/

const AccountType = require('../../../src/plugins/AccountType');
const entriesByAccounts = require('./utils/entriesByAccountsTestUtils');
const test = require('./utils/exchangeDbTestUtils');
const { expect } = require('chai');

describe('exchange db', () => {
	describe('exchanges by public key', () =>
		entriesByAccounts.addTests({
			createEntry: (id, account) => test.db.createExchangeEntry(id, account),
			toDbApiId: owner => owner.publicKey,
			runDbTest: (entries, accountsToQuery, assertDbCommandResult) => test.db.runDbTest(
				entries,
				db => db.exchangesByIds(AccountType.publicKey, accountsToQuery),
				assertDbCommandResult
			)
		}));

	describe('exchanges by address', () =>
		entriesByAccounts.addTests({
			createEntry: (id, account) => test.db.createExchangeEntry(id, account),
			toDbApiId: owner => owner.address,
			runDbTest: (entries, accountsToQuery, assertDbCommandResult) => test.db.runDbTest(
				entries,
				db => db.exchangesByIds(AccountType.address, accountsToQuery),
				assertDbCommandResult
			)
		}));

	describe('exchanges by mosaics ids', () => {
		const extractOffer = (entries, fieldName, entryIndex, offerIndex, offerType) => {
			const exchange = entries[entryIndex].exchange;
			const offer = exchange[fieldName][offerIndex];
			offer.owner = exchange.owner;
			offer.type = offerType;

			return offer;
		};

		const sortOffers = (offer1, offer2, ordering) => {
			return (offer1.price > offer2.price) ? ordering : ((offer1.price < offer2.price) ? -ordering : 0);
		};

		const assertExchangesByMosaicIds = (offerTypeString, fieldName, offerType, ordering, mosaicIds, expectedIndexes) => {
			// Arrange:
			const accounts = [test.random.account(), test.random.account()];
			const entries = test.db.createExchangeEntries(accounts);
			const expectedOffers = [];
			for (let i = 0; i < expectedIndexes.length; ++i)
				expectedOffers.push(extractOffer(entries, fieldName, expectedIndexes[i][0], expectedIndexes[i][1], offerType));
			expectedOffers.sort((offer1, offer2) => sortOffers(offer1, offer2, ordering));

			// Assert:
			return test.db.runDbTest(
				entries,
				db => db.exchangesByMosaicIds(offerTypeString, mosaicIds, undefined, 0, ordering),
				entities => expect(entities).to.deep.equal(expectedOffers)
			);
		};

		describe('ascending buy offers', () => {
			const assertAscendingBuyOffers = (mosaicIds, expectedIndexes) => {
				return assertExchangesByMosaicIds('buy', 'buyOffers', 1, 1, mosaicIds, expectedIndexes);
			};
	
			it('returns empty array for unknown mosaic ids', () => {
				return assertAscendingBuyOffers([[123, 456]], []);
			});
	
			it('returns single matching offer', () => {
				return assertAscendingBuyOffers([[150, 0]], [[1, 0]]);
			});
	
			it('returns multiple matching offers', () => {
				return assertAscendingBuyOffers([[52, 0], [150, 0]], [[0, 2], [1, 0]]);
			});
	
			it('returns only offers with matching mosaic ids', () => {
				return assertAscendingBuyOffers([[52, 0], [123, 456], [150, 0]], [[0, 2], [1, 0]]);
			});
		});

		describe('descending buy offers', () => {
			const assertDescendingBuyOffers = (mosaicIds, expectedIndexes) => {
				return assertExchangesByMosaicIds('buy', 'buyOffers', 1, -1, mosaicIds, expectedIndexes);
			};
	
			it('returns empty array for unknown mosaic ids', () => {
				return assertDescendingBuyOffers([[123, 456]], []);
			});
	
			it('returns single matching offer', () => {
				return assertDescendingBuyOffers([[150, 0]], [[1, 0]]);
			});
	
			it('returns multiple matching offers', () => {
				return assertDescendingBuyOffers([[52, 0], [150, 0]], [[0, 2], [1, 0]]);
			});
	
			it('returns only offers with matching mosaic ids', () => {
				return assertDescendingBuyOffers([[52, 0], [123, 456], [150, 0]], [[0, 2], [1, 0]]);
			});
		});

		describe('ascending sell offers', () => {
			const assertAscendingSellOffers = (mosaicIds, expectedIndexes) => {
				return assertExchangesByMosaicIds('sell', 'sellOffers', 0, 1, mosaicIds, expectedIndexes);
			};

			it('returns empty array for unknown mosaic ids', () => {
				return assertAscendingSellOffers([[123, 456]], []);
			});

			it('returns single matching offer', () => {
				return assertAscendingSellOffers([[100, 0]], [[1, 0]]);
			});

			it('returns multiple matching offers', () => {
				return assertAscendingSellOffers([[1, 0], [100, 0]], [[0, 1], [1, 0]]);
			});

			it('returns only offers with matching mosaic ids', () => {
				return assertAscendingSellOffers([[1, 0], [123, 456], [100, 0]], [[0, 1], [1, 0]]);
			});
		});

		describe('descending sell offers', () => {
			const assertDescendingSellOffers = (mosaicIds, expectedIndexes) => {
				return assertExchangesByMosaicIds('sell', 'sellOffers', 0, -1, mosaicIds, expectedIndexes);
			};

			it('returns empty array for unknown mosaic ids', () => {
				return assertDescendingSellOffers([[123, 456]], []);
			});

			it('returns single matching offer', () => {
				return assertDescendingSellOffers([[100, 0]], [[1, 0]]);
			});

			it('returns multiple matching offers', () => {
				return assertDescendingSellOffers([[1, 0], [100, 0]], [[0, 1], [1, 0]]);
			});

			it('returns only offers with matching mosaic ids', () => {
				return assertDescendingSellOffers([[1, 0], [123, 456], [100, 0]], [[0, 1], [1, 0]]);
			});
		});

		describe('query respects supplied document id', () => {
			const assertExchangesByMosaicIdsWithDocumentId = (offerTypeString, fieldName, offerType, ordering) => {
				// Arrange:
				const accounts = [];
				for (let i = 0; i < 100; ++i)
					accounts.push(test.random.account());
				const entries = test.db.createExchangeEntriesWithMosaicId(accounts, 1234);
				const expectedOffers = [];
				for (let i = (ordering > 0 ? 10 : 0); i < (ordering > 0 ? 100 : 9); ++i)
					expectedOffers.push(extractOffer(entries, fieldName, i, 0, offerType));
				expectedOffers.sort((offer1, offer2) => sortOffers(offer1, offer2, ordering));
				const id = entries[9]._id.toString();

				// Assert:
				return test.db.runDbTest(
					entries,
					db => db.exchangesByMosaicIds(offerTypeString, [[1234, 0]], id, 100, ordering),
					entities => expect(entities).to.deep.equal(expectedOffers)
				);
			};

			it('ascending buy offers', () => {
				return assertExchangesByMosaicIdsWithDocumentId('buy', 'buyOffers', 1, 1);
			});

			it('descending buy offers', () => {
				return assertExchangesByMosaicIdsWithDocumentId('buy', 'buyOffers', 1, -1);
			});

			it('ascending sell offers', () => {
				return assertExchangesByMosaicIdsWithDocumentId('sell', 'sellOffers', 0, 1);
			});

			it('descending sell offers', () => {
				return assertExchangesByMosaicIdsWithDocumentId('sell', 'sellOffers', 0, -1);
			});
		});

		describe('paging', () => {
			const assertExchangesByMosaicIdsWithPaging = (offerTypeString, fieldName, offerType, ordering, pageSize, expectedSize) => {
				// Arrange:
				const accounts = [];
				for (let i = 0; i < 200; ++i)
					accounts.push(test.random.account());
				const entries = test.db.createExchangeEntriesWithMosaicId(accounts, 1234);

				// Assert:
				return test.db.runDbTest(
					entries,
					db => db.exchangesByMosaicIds(offerTypeString, [[1234, 0]], undefined, pageSize, ordering),
					entities => expect(entities.length).to.equal(expectedSize)
				);
			};

			describe('query respects page size', () => {
				it('ascending buy offers', () => {
					return assertExchangesByMosaicIdsWithPaging('buy', 'buyOffers', 1, 1, 50, 50);
				});

				it('descending buy offers', () => {
					return assertExchangesByMosaicIdsWithPaging('buy', 'buyOffers', 1, -1, 50, 50);
				});

				it('ascending sell offers', () => {
					return assertExchangesByMosaicIdsWithPaging('sell', 'sellOffers', 0, 1, 50, 50);
				});

				it('descending sell offers', () => {
					return assertExchangesByMosaicIdsWithPaging('sell', 'sellOffers', 0, -1, 50, 50);
				});
			});

			describe('query ensures minimum page size', () => {
				it('ascending buy offers', () => {
					return assertExchangesByMosaicIdsWithPaging('buy', 'buyOffers', 1, 1, 5, 10);
				});

				it('descending buy offers', () => {
					return assertExchangesByMosaicIdsWithPaging('buy', 'buyOffers', 1, -1, 5, 10);
				});

				it('ascending sell offers', () => {
					return assertExchangesByMosaicIdsWithPaging('sell', 'sellOffers', 0, 1, 5, 10);
				});

				it('descending sell offers', () => {
					return assertExchangesByMosaicIdsWithPaging('sell', 'sellOffers', 0, -1, 5, 10);
				});
			});

			describe('query ensures maximum page size', () => {
				it('ascending buy offers', () => {
					return assertExchangesByMosaicIdsWithPaging('buy', 'buyOffers', 1, 1, 150, 100);
				});

				it('descending buy offers', () => {
					return assertExchangesByMosaicIdsWithPaging('buy', 'buyOffers', 1, -1, 150, 100);
				});

				it('ascending sell offers', () => {
					return assertExchangesByMosaicIdsWithPaging('sell', 'sellOffers', 0, 1, 150, 100);
				});

				it('descending sell offers', () => {
					return assertExchangesByMosaicIdsWithPaging('sell', 'sellOffers', 0, -1, 150, 100);
				});
			});
		});
	});
});
