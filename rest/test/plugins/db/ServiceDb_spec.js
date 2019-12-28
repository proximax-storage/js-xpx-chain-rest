/**
 *** Copyright 2019 ProximaX Limited. All rights reserved.
 *** Use of this source code is governed by the Apache 2.0
 *** license that can be found in the LICENSE file.
 **/

const AccountType = require('../../../src/plugins/AccountType');
const ServiceDb = require('../../../src/plugins/db/ServiceDb');
const test = require('./utils/serviceDbTestUtils');
const { expect } = require('chai');

describe('drive db', () => {
	const generateAccount = test.random.account;

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
				db => db.getDrivesByPublicKeyAndRole(publicKey, roles),
				entities =>
					expect(entities).to.deep.equal(expectedEntries)
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
});
