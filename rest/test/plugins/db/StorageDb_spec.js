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

describe('storage db', () => {
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

        const createBcDrive = (objectId, drive, rootHash, size, usedSize, metaFilesSize, replicatorCount) => (
            test.db.createBcDriveEntry(objectId, drive, owner, rootHash, size, usedSize, metaFilesSize, replicatorCount)
        );

        const runTestAndVerifyIds = (dbTransactions, filters, options, expectedIds) => {
            const expectedObjectIds = expectedIds.map(id => dbTestUtils.db.createObjectId(id));

            return test.db.runDbTest(
                dbTransactions,
                "bcdrives",
                db => db.bcdrives(filters, options),
                transactionsPage => {
                    const returnedIds = transactionsPage.data.map(t => t.meta.id);
                    expect(transactionsPage.data.length).to.equal(expectedObjectIds.length);
                    expect(returnedIds.sort()).to.deep.equal(expectedObjectIds.sort());
                }
            );
        };

        it('returns expected structure', () => {
            // Arrange:
            const dbTransactions = [
                // id, drive, root hash, size, used size, metafiles size, replicator count
                createBcDrive(10, drive1, generateHash(), 200, 50, 25, 5) 
            ];

            // Act + Assert:
            return test.db.runDbTest(
                dbTransactions,
                "bcdrives",
                db => db.bcdrives({}, paginationOptions),
                page => {
                    const expected_keys = ['drive', 'meta'];
                    expect(Object.keys(page.data[0]).sort()).to.deep.equal(expected_keys.sort());
                }
            );
        });

        describe('respects offset', () => {
            // Arrange:
            const dbTransactions = () => [
                // id, drive, root hash, size, used size, metafiles size, replicator count
                createBcDrive(10, drive1, generateHash(), 200, 0, 25, 5),
                createBcDrive(20, drive1, generateHash(), 200, 0, 25, 5),
                createBcDrive(30, drive1, generateHash(), 200, 0, 25, 7)
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

        describe('respects filter conditions', () => {
            const dbTransactions = () => [
                // id, drive, root hash, size, used size, metafiles size, replicator count
                createBcDrive(10, drive1, generateHash(), 300, 50, 25, 7),
                createBcDrive(20, drive2, generateHash(), 350, 40, 30, 6),
                createBcDrive(30, drive1, generateHash(), 400, 30, 35, 5),
                createBcDrive(40, drive2, generateHash(), 450, 20, 40, 4),
                createBcDrive(50, drive2, generateHash(), 500, 20, 20, 4),
                createBcDrive(60, drive2, generateHash(), 550, 20, 65, 4),
                createBcDrive(70, drive2, generateHash(), 200, 20, 10, 4)
            ];

            it('by size', () => { 
                const filters = { fromSize: 350, };
                return runTestAndVerifyIds(dbTransactions(), filters, paginationOptions, [20, 30, 40, 50, 60]); 
            });
            it('by used size', () => { 
                const filters = { fromUsedSize: 40, };
                return runTestAndVerifyIds(dbTransactions(), filters, paginationOptions, [10, 20]);
            });
            it('by metafiles size', () => { 
                const filters = { fromMetaFilesSize: 30, };
                return runTestAndVerifyIds(dbTransactions(), filters, paginationOptions, [20, 30, 40, 60]);
             });
            it('by replicator count', () => { 
                const filters = { fromReplicatorCount: 3, };
                return runTestAndVerifyIds(dbTransactions(), filters, paginationOptions, [10, 20, 30, 40, 50, 60, 70]);
             });
        });

        describe('respects sort conditions', () => {
            const { createObjectId } = dbTestUtils.db;
            // Arrange:
            const dbTransactions = () => [
                // id, drive, root hash, size, used size, metafiles size, replicator count
                createBcDrive(10, drive1, generateHash(), 300, 50, 25, 7),
                createBcDrive(20, drive1, generateHash(), 350, 40, 30, 6),
                createBcDrive(30, drive1, generateHash(), 400, 30, 35, 5)
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
                    db => db.bcdrives({}, options),
                    transactionsPage => {
                        expect(transactionsPage.data[0].meta.id).to.deep.equal(createObjectId(10));
						expect(transactionsPage.data[1].meta.id).to.deep.equal(createObjectId(20));
						expect(transactionsPage.data[2].meta.id).to.deep.equal(createObjectId(30));
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
                    db => db.bcdrives({}, options),
                    transactionsPage => {
                        expect(transactionsPage.data[0].meta.id).to.deep.equal(createObjectId(30));
                        expect(transactionsPage.data[1].meta.id).to.deep.equal(createObjectId(20));
                        expect(transactionsPage.data[2].meta.id).to.deep.equal(createObjectId(10));
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
                    db => db.bcdrives({}, options),
                    () => {
                        expect(queryPagedDocumentsSpy.calledOnce).to.equal(true);
                        expect(Object.keys(queryPagedDocumentsSpy.firstCall.args[2]["$sort"])[0]).to.equal('_id');
                        queryPagedDocumentsSpy.restore();
                    }
                );
			});
        });
    });

    describe('file download by download channel id', () => {
        const generateDownloadChannelInfo = (additionalDownloadChannelInfo) => { 
            return {
                id: additionalDownloadChannelInfo ? additionalDownloadChannelInfo.id : generateHash(),
                consumer: generateAccount().publicKey,
                drive: generateAccount().publicKey,
                downloadSize: 10,
                downloadApprovalCount: 5,
                listOfPublicKeys: [generateAccount().publicKey, generateAccount().publicKey, generateAccount().publicKey]
            }
        };

        const generateDownloadChannelInfos = (count) => {
            const downloadInfos = [];
            for (let i = 0; i < count; ++i) {
                downloadInfos.push(generateDownloadChannelInfo());
            }

            return downloadInfos;
        };

        const assertFileDownloadByDownloadChannelId = (downloadChannelId, additionalDownloadChannelInfos) => {
            // Arrange:
            const downloadChannelInfos = generateDownloadChannelInfos(5);
            const expectedEntries = [];
            additionalDownloadChannelInfos.forEach(downloadChannelInfo => {
                downloadChannelInfos.push(downloadChannelInfo);
                expectedEntries.push(test.db.createDownloadChannelEntry(downloadChannelInfos.length, 
                    downloadChannelInfo.id, 
                    downloadChannelInfo.consumer, 
                    downloadChannelInfo.drive, 
                    downloadChannelInfo.downloadSize, 
                    downloadChannelInfo.downloadApprovalCount,
                    downloadChannelInfo.listOfPublicKeys));
            });
            expectedEntries.forEach(entry => { delete entry._id; });
            const entries = test.db.createDownloadChannelEntries(downloadChannelInfos);

            // Assert:
            return test.db.runDbTest(
                entries,
                'downloadChannels',
                db => db.getDownloadsByDownloadChannelId(downloadChannelId),
                entities => expect(entities).to.deep.equal(expectedEntries)
            );
        };

        it('returns empty array for unknown key', () => {
            return assertFileDownloadByDownloadChannelId(generateHash(), []);
        });

        it('returns matching entry', () => {
            const downloadChannelId = generateHash();
            return assertFileDownloadByDownloadChannelId(downloadChannelId, [
                generateDownloadChannelInfo({ id: downloadChannelId })
            ]);
        });
    });

    describe('download channels', () => {
        const drive = test.random.publicKey();
        const replicator1 = test.random.publicKey();
        const replicator2 = test.random.publicKey();
        const consumer = test.random.publicKey();

        const paginationOptions = {
            pageSize: 10,
            pageNumber: 1,
            sortField: 'id',
            sortDirection: -1
        };

        const createDownloadChannel = (objectId, downloadChannelId, downloadSize, downloadApprovalCount) => (
            test.db.createDownloadChannelEntry(objectId, downloadChannelId, consumer, drive, downloadSize, downloadApprovalCount, [replicator1, replicator2])
        );

        const runTestAndVerifyIds = (dbTransactions, filters, options, expectedIds) => {
            const expectedObjectIds = expectedIds.map(id => dbTestUtils.db.createObjectId(id));

            return test.db.runDbTest(
                dbTransactions,
                "downloadChannels",
                db => db.downloadChannels(filters, options),
                transactionsPage => {
                    const returnedIds = transactionsPage.data.map(t => t.meta.id);
                    expect(transactionsPage.data.length).to.equal(expectedObjectIds.length);
                    expect(returnedIds.sort()).to.deep.equal(expectedObjectIds.sort());
                }
            );
        };

        it('returns expected structure', () => {
            // Arrange:
            const dbTransactions = [
                // id, download channel id, download size, download approval count
                createDownloadChannel(10, generateHash(), 500, 7)
            ];

            // Act + Assert:
            return test.db.runDbTest(
                dbTransactions,
                "downloadChannels",
                db => db.downloadChannels({}, paginationOptions),
                page => {
                    const expected_keys = ['downloadChannelInfo', 'meta'];
                    expect(Object.keys(page.data[0]).sort()).to.deep.equal(expected_keys.sort());
                }
            );
        });

        describe('respects offset', () => {
            // Arrange:
            const dbTransactions = () => [
                // id, download channel id, download size, download approval count
                createDownloadChannel(10, generateHash(), 200, 3),
                createDownloadChannel(20, generateHash(), 100, 4),
                createDownloadChannel(30, generateHash(), 150, 5)
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

        describe('respects filter conditions', () => {
            const dbTransactions = () => [
                // id, download channel id, download size, download approval count
                createDownloadChannel(10, generateHash(), 200, 3),
                createDownloadChannel(20, generateHash(), 100, 4),
                createDownloadChannel(30, generateHash(), 150, 5),
                createDownloadChannel(40, generateHash(), 200, 5),
                createDownloadChannel(50, generateHash(), 300, 4),
                createDownloadChannel(60, generateHash(), 450, 5)
            ];

            it('by download size', () => { 
                const filters = { fromDownloadSize: 200, };
                return runTestAndVerifyIds(dbTransactions(), filters, paginationOptions, [10, 40, 50, 60]); 
            });
            it('by download approval count', () => { 
                const filters = { fromDownloadApprovalCount: 5, };
                return runTestAndVerifyIds(dbTransactions(), filters, paginationOptions, [30, 40, 60]);
            });
        });

        describe('respects sort conditions', () => {
            const { createObjectId } = dbTestUtils.db;
            // Arrange:
            const dbTransactions = () => [
                // id, download channel id, download size, download approval count
                createDownloadChannel(10, generateHash(), 200, 3),
                createDownloadChannel(20, generateHash(), 100, 4),
                createDownloadChannel(30, generateHash(), 150, 5)
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
                    "downloadChannels",
                    db => db.downloadChannels({}, options),
                    transactionsPage => {
                        expect(transactionsPage.data[0].meta.id).to.deep.equal(createObjectId(10));
						expect(transactionsPage.data[1].meta.id).to.deep.equal(createObjectId(20));
						expect(transactionsPage.data[2].meta.id).to.deep.equal(createObjectId(30));
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
                    "downloadChannels",
                    db => db.downloadChannels({}, options),
                    transactionsPage => {
                        expect(transactionsPage.data[0].meta.id).to.deep.equal(createObjectId(30));
                        expect(transactionsPage.data[1].meta.id).to.deep.equal(createObjectId(20));
                        expect(transactionsPage.data[2].meta.id).to.deep.equal(createObjectId(10));
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
                    "downloadChannels",
                    db => db.downloadChannels({}, options),
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
                expectedEntries.push(test.db.createReplicatorEntry(replicatorInfos.length, 
                    replicatorInfo.key, 
                    replicatorInfo.version, 
                    replicatorInfo.capacity, 
                    replicatorInfo.drives));
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

    describe('replicators', () => {
        const replicator = test.random.publicKey();
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
            test.db.createReplicatorEntry(objectId, replicator, version, capacity, driveInfo)
        );

        const runTestAndVerifyIds = (dbTransactions, filters, options, expectedIds) => {
            const expectedObjectIds = expectedIds.map(id => dbTestUtils.db.createObjectId(id));

            return test.db.runDbTest(
                dbTransactions,
                "replicators",
                db => db.replicators(filters, options),
                transactionsPage => {
                    const returnedIds = transactionsPage.data.map(t => t.meta.id);
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
                db => db.replicators({}, paginationOptions),
                page => {
                    const expected_keys = ['replicator', 'meta'];
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
                return runTestAndVerifyIds(dbTransactions(), {}, options, [30]);
            });

            it('lt', () => {
                options.sortDirection = -1;

                // Act + Assert:
                return runTestAndVerifyIds(dbTransactions(), {}, options, [10]);
            });
        });

        describe('respects filter conditions', () => {
            const dbTransactions = () => [
                createReplicator(10, 1, 300), // id, version, capacity
                createReplicator(20, 1, 500),
                createReplicator(30, 0, 600)
            ];

            it('by version', () => { 
                const filters = { fromVersion: 1, };
                return runTestAndVerifyIds(dbTransactions(), filters, paginationOptions, [10, 20]); 
            });
            it('by capacity', () => { 
                const filters = { fromCapacity: 400, };
                return runTestAndVerifyIds(dbTransactions(), filters, paginationOptions, [20, 30]);
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
                    db => db.replicators({}, options),
                    transactionsPage => {
                        expect(transactionsPage.data[0].meta.id).to.deep.equal(createObjectId(10));
                        expect(transactionsPage.data[1].meta.id).to.deep.equal(createObjectId(20));
                        expect(transactionsPage.data[2].meta.id).to.deep.equal(createObjectId(30));
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
                        expect(transactionsPage.data[0].meta.id).to.deep.equal(createObjectId(30));
                        expect(transactionsPage.data[1].meta.id).to.deep.equal(createObjectId(20));
                        expect(transactionsPage.data[2].meta.id).to.deep.equal(createObjectId(10));
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
