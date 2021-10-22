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
    const generateBlsPublicKey = test.random.blsPublicKey;

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

        const generateBcDriveInfo = (additionalOwner) => {
            return { multisig: generateAccount(), owner: additionalOwner ? additionalOwner.owner : generateAccount().publicKey, replicatorCount: 5 };
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

        it('returns matching entry', () => {
            const owner = generateAccount().publicKey;
            return assertBcDrivesByOwnerPublicKey(owner, [
                generateBcDriveInfo({ owner: owner })
            ]);
        });
    });

    describe('file downloads', () => {
        const generateDownloadChannelInfo = (downloadChannelId, consumer) => { return {
            id: downloadChannelId ? downloadChannelId : generateHash(),
            consumer: consumer ? consumer : generateAccount().publicKey,
            downloadSize: 10,
            downloadApprovalCount: 5,
            listOfPublicKeys: [generateAccount().publicKey, generateAccount().publicKey, generateAccount().publicKey]
        }};

        const addGetDownloadsByKeyTests = traits => {
            const generateDownloadChannelInfos = (count, key) => {
                const downloadInfos = [];
                for (let i = 0; i < count; ++i) {
                    downloadInfos.push(traits.generateDownloadChannelInfo(key ? key : traits.generateKey()));
                }

                return downloadInfos;
            };

            it('returns empty array for unknown key', () => {
                // Arrange:
                const entries = test.db.createDownloadEntries(generateDownloadChannelInfos(5));

                // Assert:
                return test.db.runDbTest(
                    entries,
                    'downloadChannels',
                    db => traits.getDownloads(db, traits.generateKey()),
                    entities => expect(entities.length).to.equal(0)
                );
            });

            it('returns download info from matching entries', () => {
                // Arrange:
                const key = traits.generateKey();
                const downloadChannelInfos = generateDownloadChannelInfos(5);
                const additionalDownloadChannelInfo = traits.generateDownloadChannelInfo(key);
                downloadChannelInfos.push(additionalDownloadChannelInfo);
                const entries = test.db.createDownloadEntries(downloadChannelInfos);
                const expectedEntry = test.db.createDownloadEntry(
                    downloadChannelInfos.length,
                    additionalDownloadChannelInfo.id,
                    additionalDownloadChannelInfo.consumer,
                    additionalDownloadChannelInfo.downloadSize,
                    additionalDownloadChannelInfo.downloadApprovalCount,
                    additionalDownloadChannelInfo.listOfPublicKeys
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
                    const downloadChannelInfos = generateDownloadChannelInfos(100, key);
                    const entries = test.db.createDownloadEntries(downloadChannelInfos);
                    const id = entries[9]._id.toString();
                    let expectedEntries = sortOrder > 0 ?
                        test.db.createDownloadEntries(downloadChannelInfos.slice(10)) :
                        test.db.createDownloadEntries(downloadChannelInfos.slice(0, 9).reverse());
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
                    const downloadChannelInfos = generateDownloadChannelInfos(200, key);
                    const entries = test.db.createDownloadEntries(downloadChannelInfos);

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

        describe('by download channel id', () => addGetDownloadsByKeyTests({
            generateKey: () => generateHash(),
            generateDownloadChannelInfo: (downloadChannelId) => generateDownloadChannelInfo(downloadChannelId, generateAccount().publicKey),
            getDownloads: (db, downloadChannelId, pagingId, pageSize, sortOrder) => {
                return db.getDownloadsByDownloadChannelId(downloadChannelId, pagingId, pageSize, { sortOrder });
            }
        }));

        describe('by consumer public key', () => addGetDownloadsByKeyTests({
            generateKey: () => generateAccount().publicKey,
            generateDownloadChannelInfo: (consumer) => generateDownloadChannelInfo(generateHash(), consumer),
            getDownloads: (db, consumer, pagingId, pageSize, sortOrder) => {
                return db.getDownloadsByConsumerPublicKey(consumer, pagingId, pageSize, { sortOrder });
            }
        }));
    });

    describe('replicators', () => {
        const replicator = test.random.publicKey();
        const blsKey = generateBlsPublicKey();
        const drive1 = generateHash();
        const drive2 = generateHash();

        const paginationOptions = {
            pageSize: 10,
            pageNumber: 1,
            sortField: 'id',
            sortDirection: -1
        };

        const driveInfo = [
            {
                drive: drive1,
                lastApprovedDataModificationId: generateHash(),
                dataModificationIdIsValid: 1,
                initialDownloadWork: 20,
            },
            {
                drive: drive2,
                lastApprovedDataModificationId: generateHash(),
                dataModificationIdIsValid: 1,
                initialDownloadWork: 20,
            }
        ];

        const createReplicator = (objectId, version, capacity) => (
            test.db.createReplicatorEntry(objectId, replicator, version, capacity, blsKey, driveInfo)
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
                createReplicator(10, 1, 50) // id, version, capacity
            ];

            // Act + Assert:
            return test.db.runDbTest(
                dbTransactions,
                "replicators",
                db => db.replicators(paginationOptions),
                page => {
                    const expected_keys = ['replicator', 'id'];
                    expect(Object.keys(page.data[0]).sort()).to.deep.equal(expected_keys.sort());
                }
            );
        });

        describe('respects offset', () => {
            // Arrange:
            const dbTransactions = () => [
                createReplicator(10, 1, 100), // id, version, capacity
                createReplicator(20, 1, 60),
                createReplicator(30, 1, 120)
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
                createReplicator(10, 1, 500), // id, version, capacity
                createReplicator(20, 1, 500),
                createReplicator(30, 1, 500)
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
                    db => db.replicators(options),
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
                    db => db.replicators(options),
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
                    db => db.replicators(options),
                    () => {
                        expect(queryPagedDocumentsSpy.calledOnce).to.equal(true);
                        expect(Object.keys(queryPagedDocumentsSpy.firstCall.args[2]["$sort"])[0]).to.equal('_id');
                        queryPagedDocumentsSpy.restore();
                    }
                );
            });
        });
    });

    describe('replicator by public key', () => {

        const generateReplicatorInfo = (additionalReplicator) => {
            return {
                key: additionalReplicator ? additionalReplicator.key : generateAccount().publicKey,
                version: 1,
                capacity: 250,
                blsKey: generateBlsPublicKey(),
                drives: [
                    {
                        drive: generateAccount().publicKey,
                        lastApprovedDataModificationId: generateHash(),
                        dataModificationIdIsValid: 1,
                        initialDownloadWork: 0
                    },
                    {
                        drive: generateAccount().publicKey,
                        lastApprovedDataModificationId: generateHash(),
                        dataModificationIdIsValid: 1,
                        initialDownloadWork: 0
                    }
                ]
            }
        };

        const generateReplicatorInfos = (count) => {
            const replicatorInfos = [];
            for (let i = 0; i < count; ++i) {
                replicatorInfos.push(generateReplicatorInfo());
            }

            return replicatorInfos;
        };

        const assertReplicatorByPublicKey = (publicKey, additionalReplicatorInfos) => {
            // Arrange:
            const replicatorInfos = generateReplicatorInfos(5);
            const expectedEntries = [];
            additionalReplicatorInfos.forEach(replicatorInfo => {
                replicatorInfos.push(replicatorInfo);
                expectedEntries.push(test.db.createReplicatorEntry(replicatorInfos.length, replicatorInfo.key, replicatorInfo.version, replicatorInfo.capacity, replicatorInfo.blsKey, replicatorInfo.drives));
            });
            expectedEntries.forEach(entry => { delete entry._id; });
            const entries = test.db.createReplicatorEntries(replicatorInfos);

            // Assert:
            return test.db.runDbTest(
                entries,
                'replicators',
                db => db.getReplicatorByPublicKey(publicKey),
                entities => expect(entities).to.deep.equal(expectedEntries)
            );
        };

        it('returns empty array for unknown key', () => {
            return assertReplicatorByPublicKey(generateAccount().publicKey, []);
        });

        it('returns matching entry', () => {
            const key = generateAccount().publicKey;
            return assertReplicatorByPublicKey(key, [
                generateReplicatorInfo({ key: key })
            ]);
        });
    });
});
