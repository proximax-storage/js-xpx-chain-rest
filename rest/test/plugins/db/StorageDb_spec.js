/**
 *** Copyright 2021 ProximaX Limited. All rights reserved.
 *** Use of this source code is governed by the Apache 2.0
 *** license that can be found in the LICENSE file.
 **/

const AccountType = require('../../../src/plugins/AccountType');
const StorageDb = require('../../../src/plugins/db/StorageDb');
const dbTestUtils = require('../../db/utils/dbTestUtils');
const CatapultDb = require('../../../src/db/CatapultDb');
const test = require('./utils/storageDbTestUtils');
const { expect } = require('chai');
const sinon = require('sinon');

const catapult = require('catapult-sdk');
const { address } = catapult.model;
const Mijin_Test_Network = catapult.model.networkInfo.networks.mijinTest.id;

describe('bc drive db', () => {
    const generateAccount = test.random.account;
    const generateHash = test.random.hash;

    describe('bc drive by account id', () => {
        const addBcDriveByAccountIdTests = traits => {
            const assertBcDriveByAccountId = (account, additionalAccounts) => {
                // Arrange:
                const bcDriveInfos = [];
                for (let i = 0; i < 5; ++i)
                    bcDriveInfos.push({ multisig: generateAccount()});
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
                    'bcDrives',
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

    describe('bc drives', () => {
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

        const runTestAndVerifyIds = (dbTransactions, filters, options, expectedIds) => {
            const expectedObjectIds = expectedIds.map(id => dbTestUtils.db.createObjectId(id));

            return test.db.runDbTest(
                dbTransactions,
                "bc drives",
                db => db.drives(filters, options),
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
                createBcDrive(10, drive1, 5)
            ];

            // Act + Assert:
            return test.db.runDbTest(
                dbTransactions,
                "bc drives",
                db => db.drives({}, paginationOptions),
                page => {
                    const expected_keys = ['bcdrive', 'id'];
                    expect(Object.keys(page.data[0]).sort()).to.deep.equal(expected_keys.sort());
                }
            );
        });

        it('if address is provided signerPublicKey and recipientAddress are omitted', () => {
            // Arrange:
            const dbTransactions = [
                createBcDrive(10, drive1, 10, 0),
                createBcDrive(20, drive2, 11, 1),
                createBcDrive(30, drive1, 12, 1),
                createBcDrive(40, drive2, 13, 1),
                createBcDrive(50, drive2, 14, 2),
                createBcDrive(60, drive1, 15, 2),
                createBcDrive(70, drive2, 16, 2),
                createBcDrive(80, drive2, 17, 3),
                createBcDrive(90, drive1, 18, 3),
                createBcDrive(100, drive2, 19, 3),
            ];

            const filters = {
                states: [1, 2],
                fromStart: 12,
            };

            // Act + Assert:
            return runTestAndVerifyIds(dbTransactions, filters, paginationOptions, [30, 40, 50, 60, 70]);
        });

        describe('respects offset', () => {
            // Arrange:
            const dbTransactions = () => [
                createBcDrive(10, drive1, 20),
                createBcDrive(20, drive1, 30),
                createBcDrive(30, drive1, 10)
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
                createBcDrive(10, drive1, 20),
                createBcDrive(20, drive1, 30),
                createBcDrive(30, drive1, 10)
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
                    "bc drives",
                    db => db.drives({}, options),
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
                    "bc drives",
                    db => db.drives({}, options),
                    transactionsPage => {
                        expect(transactionsPage.data[0].id).to.deep.equal(createObjectId(30));
                        expect(transactionsPage.data[1].id).to.deep.equal(createObjectId(20));
                        expect(transactionsPage.data[2].id).to.deep.equal(createObjectId(10));
                    }
                );
            });
        });
    });

    describe('bc drive by public key', () => {

        const generateBcDriveInfo = (additionalParticipant) => {
            const drives = [ generateAccount().publicKey, generateAccount().publicKey ];
            if (additionalParticipant && 'bc drive' === additionalParticipant.role)
                drives.push(additionalParticipant.key);
            const additionalParticipantHasOwnerRole = (additionalParticipant && 'owner' === additionalParticipant.role);
            return { multisig: generateAccount(), owner: additionalParticipantHasOwnerRole ? additionalParticipant.key: generateAccount().publicKey, drives };
        };

        const generateBcDriveInfos = (count) => {
            const bcDriveInfos = [];
            for (let i = 0; i < count; ++i) {
                bcDriveInfos.push(generateBcDriveInfo());
            }

            return bcDriveInfos;
        };

        const assertDrivesByPublicKey = (publicKey, additionalBcDriveInfos) => {
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
                'bc drives',
                db => db.getBcDriveByAccountId(publicKey),
                entities => expect(entities).to.deep.equal(expectedEntries)
            );
        };

        describe('returns empty array for unknown key', () => {
            it('both owner and replicator', () => {
                return assertBcDrivesByPublicKeyAndRole(generateAccount().publicKey, ['owner', 'replicator'], []);
            });

            it('only owner', () => {
                return assertBcDrivesByPublicKeyAndRole(generateAccount().publicKey, ['owner'], []);
            });

            it('only replicator', () => {
                return assertBcDrivesByPublicKeyAndRole(generateAccount().publicKey, ['replicator'], []);
            });
        });

        const assertBcDrivesByRoles = (roles) => {
            const key = generateAccount().publicKey;
            return assertBcDrivesByPublicKeyAndRole(key, roles, [
                generateBcDriveInfo({ role: 'owner', key }),
                generateBcDriveInfo({ role: 'owner', key }),
                generateBcDriveInfo({ role: 'replicator', key }),
                generateBcDriveInfo({ role: 'replicator', key })
            ]);
        };

        describe('returns entries with matching owner and replicator', () => {
            it('roles set', () => {
                return assertBcDrivesByRoles(['owner', 'replicator']);
            });

            it('roles not set', () => {
                return assertBcDrivesByRoles([]);
            });
        });

        it('returns entries with matching owner', () => {
            const key = generateAccount().publicKey;
            return assertBcDrivesByPublicKeyAndRole(key, ['owner'], [
                generateBcDriveInfo({ role: 'owner', key }),
                generateBcDriveInfo({ role: 'owner', key })
            ]);
        });

        it('returns entries with matching replicator', () => {
            const key = generateAccount().publicKey;
            return assertBcDrivesByPublicKeyAndRole(key, ['replicator'], [
                generateBcDriveInfo({ role: 'replicator', key }),
                generateBcDriveInfo({ role: 'replicator', key })
            ]);
        });
    });

    describe('file downloads', () => {
        const generateDownloadInfo = (account, fileRecipient, operationToken) => { return {
            account: account ? account : generateAccount(),
            fileRecipient,
            operationToken,
            files: [
                {
                    fileHash:	generateHash(),
                    fileSize:	1,
                },
                {
                    fileHash:	generateHash(),
                    fileSize:	2,
                }
            ]
        }};

        const assertDownloadsByOperationToken = (operationToken, additionalOperationToken) => {
            // Arrange:
            const downloadInfos = [];
            for (let i = 0; i < 5; ++i)
                downloadInfos.push({account: generateAccount(), operationToken: generateHash()});
            const expectedEntries = [];
            additionalOperationToken.forEach(operationToken => {
                const downloadInfo = generateDownloadInfo(generateAccount(), generateHash(), operationToken);
                downloadInfos.push(downloadInfo);
                expectedEntries.push(test.db.createDownloadEntry(
                    downloadInfos.length,
                    downloadInfo.account,
                    downloadInfo.operationToken,
                    downloadInfo.fileRecipient,
                    downloadInfo.files
                ));
            });
            expectedEntries.forEach(entry => {
                delete entry._id;
            });
            const entries = test.db.createDownloadEntries(downloadInfos);

            // Assert:
            return test.db.runDbTest(
                entries,
                'downloads',
                db => db.getDownloadsByOperationToken(operationToken),
                entities =>
                    expect(entities).to.deep.equal(expectedEntries)
            );
        };

        it('returns empty array for unknown id', () => {
            return assertDownloadsByOperationToken(generateHash(), []);
        });

        it('returns matching entry', () => {
            const operationToken = generateHash();
            return assertDownloadsByOperationToken(operationToken, [operationToken]);
        });

        const addGetDownloadsByKeyTests = traits => {
            const generateDownloadInfos = (count, key) => {
                const downloadInfos = [];
                for (let i = 0; i < count; ++i) {
                    downloadInfos.push(traits.generateDownloadInfo(key ? key : traits.generateKey()));
                }

                return downloadInfos;
            };

            it('returns empty array for unknown key', () => {
                // Arrange:
                const entries = test.db.createDownloadEntries(generateDownloadInfos(5));

                // Assert:
                return test.db.runDbTest(
                    entries,
                    'downloads',
                    db => traits.getDownloads(db, traits.generateKey()),
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
                    additionalDownloadInfo.account,
                    additionalDownloadInfo.operationToken,
                    additionalDownloadInfo.fileRecipient,
                    additionalDownloadInfo.files
                );
                delete expectedEntry._id;

                // Assert:
                return test.db.runDbTest(
                    entries,
                    'downloads',
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
                        'downloads',
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
                        'downloads',
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

        describe('by file recipient key', () => addGetDownloadsByKeyTests({
            generateKey: () => generateAccount().publicKey,
            generateDownloadInfo: (fileRecipient) => generateDownloadInfo(undefined, fileRecipient, generateHash()),
            getDownloads: (db, fileRecipient, pagingId, pageSize, sortOrder) => {
                return db.getDownloadsByFileRecipient(fileRecipient, pagingId, pageSize, { sortOrder });
            }
        }));

        describe('by drive id with public key', () => addGetDownloadsByKeyTests({
            generateKey: () => generateAccount(),
            generateDownloadInfo: (account) => generateDownloadInfo(account, generateHash(), generateHash()),
            getDownloads: (db, account, pagingId, pageSize, sortOrder) => {
                return db.getDownloadsByDriveId(AccountType.publicKey, account.publicKey, pagingId, pageSize, { sortOrder });
            }
        }));

        describe('by drive id with address', () => addGetDownloadsByKeyTests({
            generateKey: () => generateAccount(),
            generateDownloadInfo: (account) => generateDownloadInfo(account, generateHash(), generateHash()),
            getDownloads: (db, account, pagingId, pageSize, sortOrder) => {
                return db.getDownloadsByDriveId(AccountType.address, account.address, pagingId, pageSize, { sortOrder });
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

        const runTestAndVerifyIds = (dbTransactions, filters, options, expectedIds) => {
            const expectedObjectIds = expectedIds.map(id => dbTestUtils.db.createObjectId(id));

            return test.db.runDbTest(
                dbTransactions,
                "replicators",
                db => db.replicators(filters, options),
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
