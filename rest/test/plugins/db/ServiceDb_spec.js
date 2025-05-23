/**
 *** Copyright 2019 ProximaX Limited. All rights reserved.
 *** Use of this source code is governed by the Apache 2.0
 *** license that can be found in the LICENSE file.
 **/

const AccountType = require('../../../src/plugins/AccountType');
const ServiceDb = require('../../../src/plugins/db/ServiceDb');
const dbTestUtils = require('../../db/utils/dbTestUtils');
const CatapultDb = require('../../../src/db/CatapultDb');
const test = require('./utils/serviceDbTestUtils');
const { expect } = require('chai');
const sinon = require('sinon');

const catapult = require('catapult-sdk');
const { address } = catapult.model;
const Mijin_Test_Network = catapult.model.networkInfo.networks.mijinTest.id;

describe('drive db', () => {
	const generateAccount = test.random.account;
	const generateHash = test.random.hash;

	describe('drive by account id', () => {
		const addDriveByAccountIdTests = traits => {
			const assertDriveByAccountId = (account, additionalAccounts) => {
				// Arrange:
				const driveInfos = [];
				for (let i = 0; i < 5; ++i)
					driveInfos.push({ multisig: generateAccount()});
				const expectedEntries = [];
				additionalAccounts.forEach(account => {
					driveInfos.push({ multisig: account });
					expectedEntries.push(test.db.createDriveEntry(driveInfos.length, account));
				});
				expectedEntries.forEach(entry => { delete entry._id; });
				const entries = test.db.createDriveEntries(driveInfos);

				// Assert:
				return test.db.runDbTest(
					entries,
					'drives',
					db => db.getDriveByAccountId(traits.type, traits.toDbApiId(account)),
					entities => expect(entities).to.deep.equal(expectedEntries)
				);
			};

			it('returns empty array for unknown id', () => {
				return assertDriveByAccountId(generateAccount(), []);
			});

			it('returns matching entry', () => {
				const account = generateAccount();
				return assertDriveByAccountId(account, [account]);
			});
		};

		describe('by public key', () => addDriveByAccountIdTests({
			type: AccountType.publicKey,
			toDbApiId: account => account.publicKey
		}));

		describe('by address', () => addDriveByAccountIdTests({
			type: AccountType.address,
			toDbApiId: account => account.address
		}));
	});

	describe('drives', () => {
		const drive1 = test.random.publicKey();
		const drive2 = test.random.publicKey();
		const replicator1 = test.random.publicKey();
		const replicator2 = test.random.publicKey();
		const owner = test.random.publicKey();

		const paginationOptions = {
			pageSize: 10,
			pageNumber: 1,
			sortField: 'id',
			sortDirection: -1
		};

		const createDrive = (objectId, drive, start, state) => (
			test.db.createDriveEntry(objectId, drive, owner, [replicator1, replicator2], start, state)
		);

		const runTestAndVerifyIds = (dbTransactions, filters, options, expectedIds) => {
			const expectedObjectIds = expectedIds.map(id => dbTestUtils.db.createObjectId(id));

			return test.db.runDbTest(
				dbTransactions,
				"drives",
				db => db.drives(filters, options),
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
				createDrive(10, drive1, 10)
			];

			// Act + Assert:
			return test.db.runDbTest(
				dbTransactions,
				"drives",
				db => db.drives({}, paginationOptions),
				page => {
					const expected_keys = ['drive', 'meta'];
					expect(Object.keys(page.data[0]).sort()).to.deep.equal(expected_keys.sort());
				}
			);
		});

		it('if address is provided signerPublicKey and recipientAddress are omitted', () => {
			// Arrange:
			const dbTransactions = [
				createDrive(10, drive1, 10, 0),
				createDrive(20, drive2, 11, 1),
				createDrive(30, drive1, 12, 1),
				createDrive(40, drive2, 13, 1),
				createDrive(50, drive2, 14, 2),
				createDrive(60, drive1, 15, 2),
				createDrive(70, drive2, 16, 2),
				createDrive(80, drive2, 17, 3),
				createDrive(90, drive1, 18, 3),
				createDrive(100, drive2, 19, 3),
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
				createDrive(10, drive1, 20),
				createDrive(20, drive1, 30),
				createDrive(30, drive1, 10)
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
				createDrive(10, drive1, 20),
				createDrive(20, drive1, 30),
				createDrive(30, drive1, 10)
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
					"drives",
					db => db.drives({}, options),
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
					"drives",
					db => db.drives({}, options),
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
					"drives",
					db => db.drives({}, options),
					() => {
						expect(queryPagedDocumentsSpy.calledOnce).to.equal(true);
						expect(Object.keys(queryPagedDocumentsSpy.firstCall.args[2]["$sort"])[0]).to.equal('_id');
						queryPagedDocumentsSpy.restore();
					}
				);
			});
		});
	});

	describe('drive by public key and role', () => {

		it('throws when invalid role', () => {
			const db = new ServiceDb();
			expect(() => { db.getDrivesByPublicKeyAndRole(generateAccount().publicKey, ['invalidRole']) }).to.throw();
		});

		const generateDriveInfo = (additionalParticipant) => {
			const replicators = [ generateAccount().publicKey, generateAccount().publicKey ];
			if (additionalParticipant && 'replicator' === additionalParticipant.role)
				replicators.push(additionalParticipant.key);
			const additionalParticipantHasOwnerRole = (additionalParticipant && 'owner' === additionalParticipant.role);
			return { multisig: generateAccount(), owner: additionalParticipantHasOwnerRole ? additionalParticipant.key: generateAccount().publicKey, replicators };
		};

		const generateDriveInfos = (count) => {
			const driveInfos = [];
			for (let i = 0; i < count; ++i) {
				driveInfos.push(generateDriveInfo());
			}

			return driveInfos;
		};

		const assertDrivesByPublicKeyAndRole = (publicKey, roles, additionalDriveInfos) => {
			// Arrange:
			const driveInfos = generateDriveInfos(5);
			const expectedEntries = [];
			additionalDriveInfos.forEach(driveInfo => {
				driveInfos.push(driveInfo);
				expectedEntries.push(test.db.createDriveEntry(driveInfos.length, driveInfo.multisig, driveInfo.owner, driveInfo.replicators));
			});
			expectedEntries.forEach(entry => { delete entry._id; });
			const entries = test.db.createDriveEntries(driveInfos);

			// Assert:
			return test.db.runDbTest(
				entries,
				'drives',
				db => db.getDrivesByPublicKeyAndRole(publicKey, roles),
				entities => expect(entities).to.deep.equal(expectedEntries)
			);
		};

		describe('returns empty array for unknown key', () => {
			it('both owner and replicator', () => {
				return assertDrivesByPublicKeyAndRole(generateAccount().publicKey, ['owner', 'replicator'], []);
			});

			it('only owner', () => {
				return assertDrivesByPublicKeyAndRole(generateAccount().publicKey, ['owner'], []);
			});

			it('only replicator', () => {
				return assertDrivesByPublicKeyAndRole(generateAccount().publicKey, ['replicator'], []);
			});
		});

		const assertDrivesByRoles = (roles) => {
			const key = generateAccount().publicKey;
			return assertDrivesByPublicKeyAndRole(key, roles, [
				generateDriveInfo({ role: 'owner', key }),
				generateDriveInfo({ role: 'owner', key }),
				generateDriveInfo({ role: 'replicator', key }),
				generateDriveInfo({ role: 'replicator', key })
			]);
		};

		describe('returns entries with matching owner and replicator', () => {
			it('roles set', () => {
				return assertDrivesByRoles(['owner', 'replicator']);
			});

			it('roles not set', () => {
				return assertDrivesByRoles([]);
			});
		});

		it('returns entries with matching owner', () => {
			const key = generateAccount().publicKey;
			return assertDrivesByPublicKeyAndRole(key, ['owner'], [
				generateDriveInfo({ role: 'owner', key }),
				generateDriveInfo({ role: 'owner', key })
			]);
		});

		it('returns entries with matching replicator', () => {
			const key = generateAccount().publicKey;
			return assertDrivesByPublicKeyAndRole(key, ['replicator'], [
				generateDriveInfo({ role: 'replicator', key }),
				generateDriveInfo({ role: 'replicator', key })
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
});
