/*
 * Copyright (c) 2016-present,
 * Jaguar0625, gimre, BloodyRookie, Tech Bureau, Corp. All rights reserved.
 *
 * This file is part of Catapult.
 *
 * Catapult is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Lesser General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * Catapult is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License
 * along with Catapult.  If not, see <http://www.gnu.org/licenses/>.
 */

const dbTestUtils = require('../../../db/utils/dbTestUtils');
const MongoDb = require('mongodb');
const MosaicDb = require('../../../../src/plugins/db/MosaicDb');
const test = require('../../../testUtils');

const { Binary, Long } = MongoDb;

const createMosaic = (id, mosaicId, owner, parentId, supply, properties) => {
	// mosaic data
	const mosaic = {
		owner: new Binary(owner),
		mosaicId: Long.fromNumber(mosaicId),
		namespaceId: Long.fromNumber(parentId),
		supply: Long.fromNumber(supply),
		properties : properties
	};

	return { _id: dbTestUtils.db.createObjectId(id), mosaic, meta: {} };
};

const createMosaics = (owner, numNamespaces, numMosaicsPerNamespace, supply) => {
	// mosaic ids start at 10000, namespace ids start at 20000 in order to differentiate from db _id
	const mosaics = [];
	let dbId = 0;
	let mosaicId = 10000;
	for (let namespaceId = 0; namespaceId < numNamespaces; ++namespaceId) {
		for (let i = 0; i < numMosaicsPerNamespace; ++i)
			mosaics.push(createMosaic(dbId++, mosaicId++, owner, 20000 + namespaceId, supply, {}));
	}

	return mosaics;
};

const createAccountWithMosaics = (publicKey, mosaicIds) => {
	let accounts = dbTestUtils.db.createAccounts(publicKey, { 
		numAccounts: 0,
		numImportances: 1,
		numMosaics: 5,
		savePublicKey: true
	});

	for(let i =0; i < accounts[0].account.mosaics.length; ++i){
		accounts[0].account.mosaics[i].id = mosaicIds[i];
	}

	return accounts[0];
};

const mosaicDbTestUtils = {
	consts : {
		FlagsIndex: 0,
		Flags : {
			None: 0,
			Supply_Mutable: 1,
			Transferable: 2,
			All: 3,
		}
	},
	db: {
		createMosaic,
		createMosaics,
		createAccountWithMosaics,
		runDbTest: (dbEntities, issueDbCommand, assertDbCommandResult, collectionName = "mosaics") =>
			dbTestUtils.db.runDbTest(dbEntities, collectionName, db => new MosaicDb(db), issueDbCommand, assertDbCommandResult)
	}
};
Object.assign(mosaicDbTestUtils, test);

module.exports = mosaicDbTestUtils;
