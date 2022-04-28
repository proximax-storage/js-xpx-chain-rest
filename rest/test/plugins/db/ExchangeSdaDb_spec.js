/**
 *** Copyright 2022 ProximaX Limited. All rights reserved.
 *** Use of this source code is governed by the Apache 2.0
 *** license that can be found in the LICENSE file.
 * */

const { expect } = require('chai');
const AccountType = require('../../../src/plugins/AccountType');
const entriesByAccounts = require('./utils/entriesByAccountsTestUtils');
const mosaicDb = require('./utils/mosaicDbTestUtils');
const test = require('./utils/exchangeSdaDbTestUtils');

describe('exchange sda db', () => {
    describe('exchangesda by public key', () => entriesByAccounts.addTests({
        createEntry: (id, account) => test.db.createSdaExchangeEntry(id, account),
        toDbApiId: owner => owner.publicKey,
        runDbTest: (entries, accountsToQuery, assertDbCommandResult) => test.db.runDbTest(
            entries,
            'exchangesda',
            db => db.exchangesdaByIds(AccountType.publicKey, accountsToQuery),
            assertDbCommandResult
        )
    }));

    describe('exchangesda by address', () => entriesByAccounts.addTests({
        createEntry: (id, account) => test.db.createSdaExchangeEntry(id, account),
        toDbApiId: owner => owner.address,
        runDbTest: (entries, accountsToQuery, assertDbCommandResult) => test.db.runDbTest(
            entries,
            'exchangesda',
            db => db.exchangesdaByIds(AccountType.address, accountsToQuery),
            assertDbCommandResult
        )
    }));

    const extractSdaOffer = (entries, fieldName, entryIndex, offerIndex) => {
        const exchangesda = entries[entryIndex].exchangesda;
        const offer = exchangesda[fieldName][offerIndex];
        offer.owner = exchangesda.owner;

        return offer;
    };

    const sortSdaOffers = (offer1, offer2, fieldAmountType, ordering) => {
        return (`${offer1}.${fieldAmountType}` > `${offer2}.${fieldAmountType}`) ? ordering : ((`${offer1}.${fieldAmountType}` < `${offer2}.${fieldAmountType}`) ? -ordering : 0);
    };

    describe('exchangesda by mosaic ids give', () => {
        const assertSdaExchangesByMosaicIds = (ordering, mosaicIds, expectedIndexes) => {
            // Arrange:
            const accounts = [test.random.account(), test.random.account()];
            const entries = test.db.createSdaExchangeEntries(accounts);
            const expectedSdaOffers = [];
            for (let i = 0; i < expectedIndexes.length; ++i) 
                expectedSdaOffers.push(extractSdaOffer(entries, 'sdaOfferBalances', expectedIndexes[i][0], expectedIndexes[i][1]));
            expectedSdaOffers.sort((offer1, offer2) => sortSdaOffers(offer1, offer2, 'currentMosaicGive', ordering));

            // Assert:
            return test.db.runDbTest(
                entries,
                'exchangesda',
                db => db.exchangesdaByMosaicIdGive(mosaicIds, undefined, 0, ordering),
                entities => expect(entities).to.deep.equal(expectedSdaOffers)
            );
        };

        describe('ascending SDA-SDA offers', () => {
            const assertAscendingSdaOffers = (mosaicIds, expectedIndexes) => assertSdaExchangesByMosaicIds(1, mosaicIds, expectedIndexes);

            it('returns empty array for unknown mosaic ids', () => assertAscendingSdaOffers([[123, 456]], []));

            it('returns single matching offer', () => assertAscendingSdaOffers([[100, 0]], [[1, 0]]));

            it('returns multiple matching offers', () => assertAscendingSdaOffers([[1, 0], [100, 0]], [[0, 1], [1, 0]]));

            it('returns only offers with matching mosaic ids give', () => assertAscendingSdaOffers([[1, 0], [123, 456], [100, 0]], [[0, 1], [1, 0]]));
        });

        describe('descending SDA-SDA offers', () => {
            const assertDescendingSdaOffers = (mosaicIds, expectedIndexes) => assertSdaExchangesByMosaicIds(-1, mosaicIds, expectedIndexes);

            it('returns empty array for unknown mosaic ids', () => assertDescendingSdaOffers([[123, 456]], []));

            it('returns single matching offer', () => assertDescendingSdaOffers([[100, 0]], [[1, 0]]));

            it('returns multiple matching offers', () => assertDescendingSdaOffers([[1, 0], [100, 0]], [[0, 1], [1, 0]]));

            it('returns only offers with matching mosaic ids give', () => assertDescendingSdaOffers([[1, 0], [123, 456], [100, 0]], [[0, 1], [1, 0]]));
        });

        describe('query respects supplied document id', () => {
            const assertSdaExchangesByMosaicIdsWithDocumentId = (ordering) => {
                // Arrange:
                const accounts = [];
                for (let i = 0; 100 > i; ++i) accounts.push(test.random.account());
                const entries = test.db.createSdaExchangeEntriesWithMosaicIds(accounts, 1234, 5678);
                const expectedSdaOffers = [];
                for (let i = (0 < ordering ? 10 : 0); i < (0 < ordering ? 100 : 9); ++i)
                    expectedSdaOffers.push(extractSdaOffer(entries, 'sdaOfferBalances', i, 0));
                expectedSdaOffers.sort((offer1, offer2) =>  sortSdaOffers(offer1, offer2, 'currentMosaicGive', ordering));
                const id = entries[9]._id.toString();

                // Assert:
                return test.db.runDbTest(
                    entries,
                    'exchangesda',
                    db => db.exchangesdaByMosaicIdGive([[1234, 0]], id, 100, ordering),
                    entities => expect(entities).to.deep.equal(expectedSdaOffers)
                );
            };

            it('ascending SDA-SDA offers', () => assertSdaExchangesByMosaicIdsWithDocumentId(1));

            it('descending SDA-SDA offers', () => assertSdaExchangesByMosaicIdsWithDocumentId(-1));
        });

        describe('paging', () => {
            const assertSdaExchangesByMosaicIdsWithPaging = (ordering, pageSize, expectedSize) => {
                // Arrange:
                const accounts = [];
                for (let i = 0; 200 > i; ++i) accounts.push(test.random.account());
                const entries = test.db.createSdaExchangeEntriesWithMosaicIds(accounts, 1234, 5678);

                // Assert:
                return test.db.runDbTest(
                    entries,
                    'exchangesda',
                    db => db.exchangesdaByMosaicIdGive([[1234, 0]], undefined, pageSize, ordering),
                    entities => expect(entities.length).to.equal(expectedSize)
                );
            };

            describe('query respects page size', () => {
                it('ascending SDA-SDA offers', () => assertSdaExchangesByMosaicIdsWithPaging(1, 50, 50));

                it('ascending SDA-SDA offers', () => assertSdaExchangesByMosaicIdsWithPaging(-1, 50, 50));
            });

            describe('query ensures minimum page size', () => {
                it('ascending SDA-SDA offers', () => assertSdaExchangesByMosaicIdsWithPaging(1, 5, 10));

                it('descending SDA-SDA offers', () => assertSdaExchangesByMosaicIdsWithPaging(-1, 5, 10));
            });

            describe('query ensures maximum page size', () => {
                it('ascending SDA-SDA offers', () => assertSdaExchangesByMosaicIdsWithPaging(1, 150, 100));

                it('descending SDA-SDA offers', () => assertSdaExchangesByMosaicIdsWithPaging(-1, 150, 100));
            });
        });
    });

    describe('exchangesda by mosaic ids get', () => {
        const assertSdaExchangesByMosaicIds = (ordering, mosaicIds, expectedIndexes) => {
            // Arrange:
            const accounts = [test.random.account(), test.random.account()];
            const entries = test.db.createSdaExchangeEntries(accounts);
            const expectedSdaOffers = [];
            for (let i = 0; i < expectedIndexes.length; ++i) 
                expectedSdaOffers.push(extractSdaOffer(entries, 'sdaOfferBalances', expectedIndexes[i][0], expectedIndexes[i][1]));
            expectedSdaOffers.sort((offer1, offer2) => sortSdaOffers(offer1, offer2, 'currentMosaicGet', ordering));

            // Assert:
            return test.db.runDbTest(
                entries,
                'exchangesda',
                db => db.exchangesdaByMosaicIdGet(mosaicIds, undefined, 0, ordering),
                entities => expect(entities).to.deep.equal(expectedSdaOffers)
            );
        };

        describe('ascending SDA-SDA offers', () => {
            const assertAscendingSdaOffers = (mosaicIds, expectedIndexes) => assertSdaExchangesByMosaicIds(1, mosaicIds, expectedIndexes);

            it('returns empty array for unknown mosaic ids', () => assertAscendingSdaOffers([[123, 456]], []));

            it('returns single matching offer', () => assertAscendingSdaOffers([[100, 0]], [[1, 0]]));

            it('returns multiple matching offers', () => assertAscendingSdaOffers([[1, 0], [100, 0]], [[0, 1], [1, 0]]));

            it('returns only offers with matching mosaic ids give', () => assertAscendingSdaOffers([[1, 0], [123, 456], [100, 0]], [[0, 1], [1, 0]]));
        });

        describe('descending SDA-SDA offers', () => {
            const assertDescendingSdaOffers = (mosaicIds, expectedIndexes) => assertSdaExchangesByMosaicIds(-1, mosaicIds, expectedIndexes);

            it('returns empty array for unknown mosaic ids', () => assertDescendingSdaOffers([[123, 456]], []));

            it('returns single matching offer', () => assertDescendingSdaOffers([[100, 0]], [[1, 0]]));

            it('returns multiple matching offers', () => assertDescendingSdaOffers([[1, 0], [100, 0]], [[0, 1], [1, 0]]));

            it('returns only offers with matching mosaic ids give', () => assertDescendingSdaOffers([[1, 0], [123, 456], [100, 0]], [[0, 1], [1, 0]]));
        });

        describe('query respects supplied document id', () => {
            const assertSdaExchangesByMosaicIdsWithDocumentId = (ordering) => {
                // Arrange:
                const accounts = [];
                for (let i = 0; 100 > i; ++i) accounts.push(test.random.account());
                const entries = test.db.createSdaExchangeEntriesWithMosaicIds(accounts, 1234, 5678);
                const expectedSdaOffers = [];
                for (let i = (0 < ordering ? 10 : 0); i < (0 < ordering ? 100 : 9); ++i)
                    expectedSdaOffers.push(extractSdaOffer(entries, 'sdaOfferBalances', i, 0));
                expectedSdaOffers.sort((offer1, offer2) =>  sortSdaOffers(offer1, offer2, 'currentMosaicGet', ordering));
                const id = entries[9]._id.toString();

                // Assert:
                return test.db.runDbTest(
                    entries,
                    'exchangesda',
                    db => db.exchangesdaByMosaicIdGet([[1234, 0]], id, 100, ordering),
                    entities => expect(entities).to.deep.equal(expectedSdaOffers)
                );
            };

            it('ascending SDA-SDA offers', () => assertSdaExchangesByMosaicIdsWithDocumentId(1));

            it('descending SDA-SDA offers', () => assertSdaExchangesByMosaicIdsWithDocumentId(-1));
        });

        describe('paging', () => {
            const assertSdaExchangesByMosaicIdsWithPaging = (ordering, pageSize, expectedSize) => {
                // Arrange:
                const accounts = [];
                for (let i = 0; 200 > i; ++i) accounts.push(test.random.account());
                const entries = test.db.createSdaExchangeEntriesWithMosaicIds(accounts, 1234, 5678);

                // Assert:
                return test.db.runDbTest(
                    entries,
                    'exchangesda',
                    db => db.exchangesdaByMosaicIdGet([[1234, 0]], undefined, pageSize, ordering),
                    entities => expect(entities.length).to.equal(expectedSize)
                );
            };

            describe('query respects page size', () => {
                it('ascending SDA-SDA offers', () => assertSdaExchangesByMosaicIdsWithPaging(1, 50, 50));

                it('ascending SDA-SDA offers', () => assertSdaExchangesByMosaicIdsWithPaging(-1, 50, 50));
            });

            describe('query ensures minimum page size', () => {
                it('ascending SDA-SDA offers', () => assertSdaExchangesByMosaicIdsWithPaging(1, 5, 10));

                it('descending SDA-SDA offers', () => assertSdaExchangesByMosaicIdsWithPaging(-1, 5, 10));
            });

            describe('query ensures maximum page size', () => {
                it('ascending SDA-SDA offers', () => assertSdaExchangesByMosaicIdsWithPaging(1, 150, 100));

                it('descending SDA-SDA offers', () => assertSdaExchangesByMosaicIdsWithPaging(-1, 150, 100));
            });
        });
    });

    describe('minimal sda offers info by group hash', () => {
        
    });
});
