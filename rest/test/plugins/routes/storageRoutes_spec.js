/**
 *** Copyright 2021 ProximaX Limited. All rights reserved.
 *** Use of this source code is governed by the Apache 2.0
 *** license that can be found in the LICENSE file.
 * */

 const storageRoutes = require('../../../src/plugins/routes/storageRoutes');
 const catapult = require('catapult-sdk');
 const { test } = require('../../routes/utils/routeTestUtils');
 const { expect } = require('chai');
 
 const { address } = catapult.model;
 const { addresses, publicKeys, hashes256, blsPublicKey } = test.sets;
 const { convert } = catapult.utils;

 describe('storage routes', () => {
    describe('/driveV2/:accountId', () => {
		const assertGetBcDriveByAccountId = traits => {
			// Arrange:
			const keyGroups = [];
			const db = test.setup.createCapturingDb('getBcDriveByAccountId', keyGroups, [{value: 'this is nonsense'}]);

			// Act:
			const registerRoutes = storageRoutes.register;
			return test.route.executeSingle(
				registerRoutes,
				'/driveV2/:accountId',
				'get',
				{accountId: traits.accountId},
				db,
				null,
				response => {
					// Assert:
					expect(keyGroups).to.deep.equal(traits.expected);
					expect(response).to.deep.equal({payload: {value: 'this is nonsense'}, type: 'bcDriveEntry'});
				}
			);
		};

		it('with public key', () => assertGetBcDriveByAccountId({
			accountId: publicKeys.valid[0],
			expected: ['publicKey', convert.hexToUint8(publicKeys.valid[0])]
		}));

		it('with address', () => assertGetBcDriveByAccountId({
			accountId: addresses.valid[0],
			expected: ['address', address.stringToAddress(addresses.valid[0])]
		}));
	});

	describe('/replicatorV2/:publicKey', () => {
		const addGetReplicatorByPublicKey = traits => {
			// Arrange:
			const keyGroups = [];
			const db = test.setup.createCapturingDb('getReplicatorByPublicKey', keyGroups, [{value: 'this is nonsense'}]);

			// Act:
			const registerRoutes = storageRoutes.register;
			return test.route.executeSingle(
				registerRoutes,
				'/replicatorV2/:publicKey',
				'get',
				{key: traits.key},
				db,
				null,
				response => {
					// Assert:
					expect(keyGroups).to.deep.equal(traits.expected);
					expect(response).to.deep.equal({payload: {value: 'this is nonsense'}, type: 'replicatorEntry'});
				}
			);
		};

		it('with replicator key', () => addGetReplicatorByPublicKey({
			key: publicKeys.valid[0],
			expected: [convert.hexToUint8(publicKeys.valid[0])]
		}));
	});

	describe('/downloadsV2/:downloadChannelId', () => {
		const addGetDownloadsByDownloadChannelId = traits => {
			// Arrange:
			const keyGroups = [];
			const db = test.setup.createCapturingDb('getDownloadsByDownloadChannelId', keyGroups, [{value: 'this is nonsense'}]);

			// Act:
			const registerRoutes = storageRoutes.register;
			return test.route.executeSingle(
				registerRoutes,
				'/downloadsV2/:downloadChannelId',
				'get',
				{downloadChannelId: traits.downloadChannelId},
				db,
				null,
				response => {
					// Assert:
					expect(keyGroups).to.deep.equal(traits.expected);
					expect(response).to.deep.equal({payload: {value: 'this is nonsense'}, type: 'downloadChannelEntry'});
				}
			);
		};

		it('with download channel id', () => addGetDownloadsByDownloadChannelId({
			downloadChannelId: hashes256.valid[0],
			expected: [convert.hexToUint8(hashes256.valid[0])]
		}));
	});

	describe('/accountV2/:owner/drive', () => {
		const addGetBcDriveByOwnerPublicKey = traits => {
			// Arrange:
			const keyGroups = [];
			const db = test.setup.createCapturingDb('getBcDriveByOwnerPublicKey', keyGroups, [{value: 'this is nonsense'}]);
			
			// Act:
			const registerRoutes = storageRoutes.register;
			return test.route.executeSingle(
				registerRoutes,
				'/accountV2/:owner/drive',
				'get',
				{owner: traits.owner},
				db,
				null,
				response => {
					// Assert:
					expect(keyGroups).to.deep.equal(traits.expected);
					expect(response).to.deep.equal({payload: {value: 'this is nonsense'}, type: 'bcDriveEntry'});
				}
			);
		};

		it('with owner public key', () => addGetBcDriveByOwnerPublicKey({
			owner: publicKeys.valid[0],
			expected: [convert.hexToUint8(publicKeys.valid[0])]
		}));
    });

	describe('/accountV2/:blsKey/replicator', () => {
		const addGetReplicatorByBlsKey = traits => {
			// Arrange:
			const keyGroups = [];
			const db = test.setup.createCapturingDb('getReplicatorByBlsKey', keyGroups, [{value: 'this is nonsense'}]);
			
			// Act:
			const registerRoutes = storageRoutes.register;
			return test.route.executeSingle(
				registerRoutes,
				'/accountV2/:blsKey/replicator',
				'get',
				{blsKey: traits.blsKey},
				db,
				null,
				response => {
					// Assert:
					expect(keyGroups).to.deep.equal(traits.expected);
					expect(response).to.deep.equal({payload: {value: 'this is nonsense'}, type: 'replicatorEntry'});
				}
			);
		};

		it('with replicator bls key', () => addGetReplicatorByBlsKey({
			blsKey: blsPublicKey.valid[0],
			expected: [convert.hexToUint8(blsPublicKey.valid[0])]
		}));
	});
 });