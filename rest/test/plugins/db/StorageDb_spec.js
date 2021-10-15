/**
 *** Copyright 2021 ProximaX Limited. All rights reserved.
 *** Use of this source code is governed by the Apache 2.0
 *** license that can be found in the LICENSE file.
 **/

const AccountType = require('../../../src/plugins/AccountType');
const dbTestUtils = require('../../db/utils/dbTestUtils');
const CatapultDb = require('../../../src/db/CatapultDb');
const test = require('./utils/storageDbTestUtils');
const { expect } = require('chai');
const sinon = require('sinon');

describe('bcdrive db', () => {
    const generateAccount = test.random.account;
    const generateHash = test.random.hash;

    describe('bcdrive by account id', () => {
        const addBcDriveByAccountIdTests = traits => {
            const assertBcDriveByAccountId = (account, additionalAccounts) => {
                // Arrange:
                const bcDriveInfos = [];
                for (let i = 0; i < 5; ++i)
                    bcDriveInfos.push({ multisig: generateAccount() });
                const expectedEntries = [];
                additionalAccounts.forEach(account => {
                    bcDriveInfos.push({ multisig: account });
                    expectedEntries.push(test.db.createBcDriveEntry(bcDriveInfos.length, account));
                });
                expectedEntries.forEach(entry => { delete entry._id; });
                const entries = test.db.createBcDriveEntries(bcDriveInfos);

                // Assert:
                return test.db.runDbTest(
                    entries,
                    'bcdrives',
                    db => db.getBcDriveByAccountId(traits.type, traits.toDbApiId(account)),
                    entities => expect(entities).to.deep.equal(expectedEntries)
                );
            };

            it('returns empty array for unknown id', () => {
                return assertBcDriveByAccountId(generateAccount(), []);
            });

            it('returns matching entry', () => {
                const account = generateAccount();
                return assertBcDriveByAccountId(account, [account]);
            });
        };

        describe('by public key', () => addBcDriveByAccountIdTests({
            type: AccountType.publicKey,
            toDbApiId: account => account.publicKey
        }));

        describe('by address', () => addBcDriveByAccountIdTests({
            type: AccountType.address,
            toDbApiId: account => account.address
        }));
    });

    describe('bcdrives', () => {
        const drive1 = test.random.publicKey();
        const drive2 = test.random.publicKey();
        const owner = test.random.publicKey();

        const paginationOptions = {
            pageSize: 10,
            pageNumber: 1,
            sortField: 'id',
            sortDirection: -1
        };

        const createBcDrive = (objectId, drive, replicatorCount) => (
            test.db.createBcDriveEntry(objectId, drive, owner, replicatorCount)
        );

        const runTestAndVerifyIds = (dbTransactions, options, expectedIds) => {
            const expectedObjectIds = expectedIds.map(id => dbTestUtils.db.createObjectId(id));

            return test.db.runDbTest(
                dbTransactions,
                "bcdrives",
                db => db.bcdrives(options),
                transactionsPage => {
                    const returnedIds = transactionsPage.data.map(t => t.id);
                    expect(transactionsPage.data.length).to.equal(expectedObjectIds.length);
                    expect(returnedIds.sort()).to.deep.equal(expectedObjectIds.sort());
                }
            );
        };

        it('returns expected structure', () => {
            // Arrange:
            const dbTransactions = [
                createBcDrive(10, drive1, 2)
            ];

            // Act + Assert:
            return test.db.runDbTest(
                dbTransactions,
                "bcdrives",
                db => db.bcdrives(paginationOptions),
                page => {
                    const expected_keys = ['drive', 'id'];
                    expect(Object.keys(page.data[0]).sort()).to.deep.equal(expected_keys.sort());
                }
            );
        });

        describe('respects offset', () => {
            // Arrange:
            const dbTransactions = () => [
                createBcDrive(10, drive1, 5),
                createBcDrive(20, drive1, 5),
                createBcDrive(30, drive1, 7)
            ];

            const options = {
                pageSize: 10,
                pageNumber: 1,
                sortField: '_id',
                sortDirection: 1,
                offset: dbTestUtils.db.createObjectId(20)
            };

            it('gt', () => {
                options.sortDirection = 1;

                // Act + Assert:
                return runTestAndVerifyIds(dbTransactions(), options, [30]);
            });

            it('lt', () => {
                options.sortDirection = -1;

                // Act + Assert:
                return runTestAndVerifyIds(dbTransactions(), options, [10]);
            });
        });

        describe('respects sort conditions', () => {
            const { createObjectId } = dbTestUtils.db;
            // Arrange:
            const dbTransactions = () => [
                createBcDrive(10, drive2, 7),
                createBcDrive(20, drive2, 8),
                createBcDrive(30, drive2, 9)
            ];

            it('direction ascending', () => {
                const options = {
                    pageSize: 10,
                    pageNumber: 1,
                    sortField: '_id',
                    sortDirection: 1
                };

                // Act + Assert:
                return test.db.runDbTest(
                    dbTransactions(),
                    "bcdrives",
                    db => db.bcdrives(options),
                    transactionsPage => {
                        expect(transactionsPage.data[0].id).to.deep.equal(createObjectId(10));
                        expect(transactionsPage.data[1].id).to.deep.equal(createObjectId(20));
                        expect(transactionsPage.data[2].id).to.deep.equal(createObjectId(30));
                    }
                );
            });

            it('direction descending', () => {
                const options = {
                    pageSize: 10,
                    pageNumber: 1,
                    sortField: '_id',
                    sortDirection: -1
                };

                // Act + Assert:
                return test.db.runDbTest(
                    dbTransactions(),
                    "bcdrives",
                    db => db.bcdrives(options),
                    transactionsPage => {
                        expect(transactionsPage.data[0].id).to.deep.equal(createObjectId(30));
                        expect(transactionsPage.data[1].id).to.deep.equal(createObjectId(20));
                        expect(transactionsPage.data[2].id).to.deep.equal(createObjectId(10));
                    }
                );
            });

            it('sort field', () => {
				const queryPagedDocumentsSpy = sinon.spy(CatapultDb.prototype, 'queryPagedDocuments_2');
				const options = {
					pageSize: 10,
					offset: 1,
					pageNumber: 1,
					sortField: '_id',
					sortDirection: 1
				};

				// Act + Assert:
				return test.db.runDbTest(
					dbTransactions(),
					"bcdrives",
					db => db.bcdrives(options),
					() => {
						expect(queryPagedDocumentsSpy.calledOnce).to.equal(true);
						expect(Object.keys(queryPagedDocumentsSpy.firstCall.args[2]["$sort"])[0]).to.equal('_id');
						queryPagedDocumentsSpy.restore();
					}
				);
			});
        });
    });

    describe('bcdrive by owner public key', () => {

        const generateBcDriveInfo = () => {
            return { multisig: generateAccount(), owner: generateAccount().publicKey, replicatorCount: 5 };
        };

        const generateBcDriveInfos = (count) => {
            const bcDriveInfos = [];
            for (let i = 0; i < count; ++i) {
                bcDriveInfos.push(generateBcDriveInfo());
            }

            return bcDriveInfos;
        };

        const assertBcDrivesByOwnerPublicKey = (publicKey, additionalBcDriveInfos) => {
            // Arrange:
            const bcDriveInfos = generateBcDriveInfos(5);
            const expectedEntries = [];
            additionalBcDriveInfos.forEach(bcDriveInfo => {
                bcDriveInfos.push(bcDriveInfo);
                expectedEntries.push(test.db.createBcDriveEntry(bcDriveInfos.length, bcDriveInfo.multisig, bcDriveInfo.owner, bcDriveInfo.replicatorCount));
            });
            expectedEntries.forEach(entry => { delete entry._id; });
            const entries = test.db.createBcDriveEntries(bcDriveInfos);

            // Assert:
            return test.db.runDbTest(
                entries,
                'bcdrives',
                db => db.getBcDriveByOwnerPublicKey(publicKey),
                entities => expect(entities).to.deep.equal(expectedEntries)
            );
        };

        it('returns empty array for unknown key', () => {
            return assertBcDrivesByOwnerPublicKey(generateAccount().publicKey, []);
        });
    });

    describe('file downloads', () => {
        const generateDownloadInfo = (consumer) => { return {
            id: id ? id : generateHash(),
            consumer: consumer ? consumer : generateAccount().publicKey,
            downloadSize: 1,
            downloadApprovalCount: 3,
            listOfPublicKeys: [generateAccount().publicKey, generateAccount().publicKey]
        }};

        const assertDownloadsByDownloadChannelId = (downloadChannelId, additionalDownloadChannelId) => {
            // Arrange:
            const downloadInfos = [];
            for (let i = 0; i < 5; ++i)
                downloadInfos.push({id: generateHash(), consumer: generateAccount().publicKey});
            const expectedEntries = [];
            additionalDownloadChannelId.forEach(downloadChannelId => {
                const downloadInfo = generateDownloadInfo(downloadChannelId);
                downloadInfos.push(downloadInfo);
                expectedEntries.push(test.db.createDownloadEntry(
                    downloadInfos.length,
                    downloadInfo.id,
                    downloadInfo.consumer,
                    downloadInfo.downloadSize,
                    downloadInfo.downloadApprovalCount,
                    downloadInfo.listOfPublicKeys
                ));
            });
            expectedEntries.forEach(entry => {
                delete entry._id;
            });
            const entries = test.db.createDownloadEntries(downloadInfos);

            // Assert:
            return test.db.runDbTest(
                entries,
                'downloadChannels',
                db => db.getDownloadsByDownloadChannelId(downloadChannelId),
                entities =>
                    expect(entities).to.deep.equal(expectedEntries)
            );
        };

        it('returns empty array for unknown id', () => {
            return assertDownloadsByDownloadChannelId(generateHash(), []);
        });

        it('returns matching entry', () => {
            const id = generateHash();
            return assertDownloadsByDownloadChannelId(id, [id]);
        });

        const addGetDownloadsByKeyTests = traits => {
            const generateDownloadInfos = (count, consumer) => {
                const downloadInfos = [];
                for (let i = 0; i < count; ++i) {
                    downloadInfos.push(traits.generateDownloadInfo(consumer ? consumer : traits.generateKey()));
                }

                return downloadInfos;
            };

            it('returns empty array for unknown key', () => {
                // Arrange:
                const entries = test.db.createDownloadEntries(generateDownloadInfos(5));

                // Assert:
                return test.db.runDbTest(
                    entries,
                    'downloadChannels',
                    db => traits.getDownloadsByConsumerPublicKey(db, traits.generateKey()),
                    entities => expect(entities.length).to.equal(0)
                );
            });

            it('returns download info from matching entries', () => {
                // Arrange:
                const key = traits.generateKey();
                const downloadInfos = generateDownloadInfos(5);
                const additionalDownloadInfo = traits.generateDownloadInfo(key);
                downloadInfos.push(additionalDownloadInfo);
                const entries = test.db.createDownloadEntries(downloadInfos);
                const expectedEntry = test.db.createDownloadEntry(
                    downloadInfos.length,
                    additionalDownloadInfo.id,
                    additionalDownloadInfo.consumer,
                    additionalDownloadInfo.downloadSize,
                    additionalDownloadInfo.downloadApprovalCount,
                    additionalDownloadInfo.listOfPublicKeys
                );
                delete expectedEntry._id;

                // Assert:
                return test.db.runDbTest(
                    entries,
                    'downloadChannels',
                    db => traits.getDownloads(db, key),
                    entities =>
                        expect(entities).to.deep.equal([expectedEntry])
                );
            });

            describe('query respects supplied document id', () => {
                const assertDownloadsWithDocumentId = (sortOrder) => {
                    // Arrange:
                    const key = traits.generateKey();
                    const downloadInfos = generateDownloadInfos(100, key);
                    const entries = test.db.createDownloadEntries(downloadInfos);
                    const id = entries[9]._id.toString();
                    let expectedEntries = sortOrder > 0 ?
                        test.db.createDownloadEntries(downloadInfos.slice(10)) :
                        test.db.createDownloadEntries(downloadInfos.slice(0, 9).reverse());
                    expectedEntries.map(entry => delete entry._id);

                    // Assert:
                    return test.db.runDbTest(
                        entries,
                        'downloadChannels',
                        db => traits.getDownloads(db, key, id, 100, sortOrder),
                        entities =>
                            expect(entities).to.deep.equal(expectedEntries)
                    );
                };

                it('ascending order', () => {
                    return assertDownloadsWithDocumentId(1);
                });

                it('descending order', () => {
                    return assertDownloadsWithDocumentId(-1);
                });
            });

            describe('paging', () => {
                const assertDownloadsWithPaging = (sortOrder, pageSize, expectedSize) => {
                    // Arrange:
                    const key = traits.generateKey();
                    const downloadInfos = generateDownloadInfos(200, key);
                    const entries = test.db.createDownloadEntries(downloadInfos);

                    // Assert:
                    return test.db.runDbTest(
                        entries,
                        'downloadChannels',
                        db => traits.getDownloads(db, key, undefined, pageSize, sortOrder),
                        entities => expect(entities.length).to.equal(expectedSize)
                    );
                };

                describe('query respects page size', () => {
                    it('ascending order', () => {
                        return assertDownloadsWithPaging(1, 50, 50);
                    });

                    it('descending order', () => {
                        return assertDownloadsWithPaging(-1, 50, 50);
                    });
                });

                describe('query ensures minimum page size', () => {
                    it('ascending order', () => {
                        return assertDownloadsWithPaging(1, 5, 10);
                    });

                    it('descending order', () => {
                        return assertDownloadsWithPaging(-1, 5, 10);
                    });
                });

                describe('query ensures maximum page size', () => {
                    it('ascending order', () => {
                        return assertDownloadsWithPaging(1, 150, 100);
                    });

                    it('descending order', () => {
                        return assertDownloadsWithPaging(-1, 150, 100);
                    });
                });
            });
        };

        describe('by consumer public key', () => addGetDownloadsByKeyTests({
            generateKey: () => generateAccount().publicKey,
            generateDownloadInfo: (consumer) => generateDownloadInfo(consumer),
            getDownloads: (db, consumer, pagingId, pageSize, sortOrder) => {
                return db.getDownloadsByConsumerPublicKey(consumer, pagingId, pageSize, { sortOrder });
            }
        }));
    });

    describe('replicators', () => {
        const replicator1 = test.random.publicKey();
        const drive1 = generateHash();
        const drive2 = generateHash();

        const paginationOptions = {
            pageSize: 10,
            pageNumber: 1,
            sortField: 'id',
            sortDirection: -1
        };

        const createReplicator = (objectId, replicator) => (
            test.db.createReplicatorEntry(objectId, replicator, [drive1, drive2])
        );

        const runTestAndVerifyIds = (dbTransactions, options, expectedIds) => {
            const expectedObjectIds = expectedIds.map(id => dbTestUtils.db.createObjectId(id));

            return test.db.runDbTest(
                dbTransactions,
                "replicators",
                db => db.replicators(options),
                transactionsPage => {
                    const returnedIds = transactionsPage.data.map(t => t.id);
                    expect(transactionsPage.data.length).to.equal(expectedObjectIds.length);
                    expect(returnedIds.sort()).to.deep.equal(expectedObjectIds.sort());
                }
            );
        };

        it('returns expected structure', () => {
            // Arrange:
            const dbTransactions = [
                createReplicator(10, replicator1)
            ];

            // Act + Assert:
            return test.db.runDbTest(
                dbTransactions,
                "replicators",
                db => db.replicators({}, paginationOptions),
                page => {
                    const expected_keys = ['replicator', 'id'];
                    expect(Object.keys(page.data[0]).sort()).to.deep.equal(expected_keys.sort());
                }
            );
        });

        describe('respects offset', () => {
            // Arrange:
            const dbTransactions = () => [
                createReplicator(10, replicator1),
                createReplicator(20, replicator1),
                createReplicator(30, replicator1)
            ];
            const options = {
                pageSize: 10,
                pageNumber: 1,
                sortField: '_id',
                sortDirection: 1,
                offset: dbTestUtils.db.createObjectId(20)
            };

            it('gt', () => {
                options.sortDirection = 1;

                // Act + Assert:
                return runTestAndVerifyIds(dbTransactions(), {}, options, [30]);
            });

            it('lt', () => {
                options.sortDirection = -1;

                // Act + Assert:
                return runTestAndVerifyIds(dbTransactions(), {}, options, [10]);
            });
        });

        describe('respects sort conditions', () => {
            const { createObjectId } = dbTestUtils.db;
            // Arrange:
            const dbTransactions = () => [
                createReplicator(10, replicator1),
                createReplicator(20, replicator1),
                createReplicator(30, replicator1)
            ];

            it('direction ascending', () => {
                const options = {
                    pageSize: 10,
                    pageNumber: 1,
                    sortField: '_id',
                    sortDirection: 1
                };

                // Act + Assert:
                return test.db.runDbTest(
                    dbTransactions(),
                    "replicators",
                    db => db.replicators({}, options),
                    transactionsPage => {
                        expect(transactionsPage.data[0].id).to.deep.equal(createObjectId(10));
                        expect(transactionsPage.data[1].id).to.deep.equal(createObjectId(20));
                        expect(transactionsPage.data[2].id).to.deep.equal(createObjectId(30));
                    }
                );
            });

            it('direction descending', () => {
                const options = {
                    pageSize: 10,
                    pageNumber: 1,
                    sortField: '_id',
                    sortDirection: -1
                };

                // Act + Assert:
                return test.db.runDbTest(
                    dbTransactions(),
                    "replicators",
                    db => db.replicators({}, options),
                    transactionsPage => {
                        expect(transactionsPage.data[0].id).to.deep.equal(createObjectId(30));
                        expect(transactionsPage.data[1].id).to.deep.equal(createObjectId(20));
                        expect(transactionsPage.data[2].id).to.deep.equal(createObjectId(10));
                    }
                );
            });

            it('sort field', () => {
                const queryPagedDocumentsSpy = sinon.spy(CatapultDb.prototype, 'queryPagedDocuments_2');
                const options = {
                    pageSize: 10,
                    offset: 1,
                    pageNumber: 1,
                    sortField: '_id',
                    sortDirection: 1
                };

                // Act + Assert:
                return test.db.runDbTest(
                    dbTransactions(),
                    "replicators",
                    db => db.replicators({}, options),
                    () => {
                        expect(queryPagedDocumentsSpy.calledOnce).to.equal(true);
                        expect(Object.keys(queryPagedDocumentsSpy.firstCall.args[2]["$sort"])[0]).to.equal('_id');
                        queryPagedDocumentsSpy.restore();
                    }
                );
            });
        });
    });
});
