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

const MongoDb = require('mongodb');
const test = require('./utils/receiptsDbTestUtils');
const { expect } = require('chai');
const { convertToLong } = require('../../../src/db/dbUtils');

const { Long } = MongoDb;

describe('receipts db', () => {
	describe('address resolution statements by height', () => {
		// Arrange:
		const knownHeight = 4668;
		const addressResolutionsStatement1 = test.addressResolutionStatementDb.createAddressResolutionStatement(knownHeight);
		const addressResolutionsStatement2 = test.addressResolutionStatementDb.createAddressResolutionStatement(knownHeight);
		const addressResolutionsStatement3 = test.addressResolutionStatementDb.createAddressResolutionStatement(knownHeight + 1);

		it('returns empty array for non-existing address resolution statements in block', () =>
			// Assert:
			test.addressResolutionStatementDb.runDbTest(
				[addressResolutionsStatement1, addressResolutionsStatement2, addressResolutionsStatement3],
				db => db.statementsAtHeight(Long.fromNumber(knownHeight + 10), 'addressResolutionStatements'),
				entities => { expect(entities).to.deep.equal([]); }
			));

		it('returns address resolution statements in block at height', () =>
			// Assert:
			test.addressResolutionStatementDb.runDbTest(
				[addressResolutionsStatement1, addressResolutionsStatement2, addressResolutionsStatement3],
				db => db.statementsAtHeight(Long.fromNumber(knownHeight), 'addressResolutionStatements'),
				entities => { expect(entities).to.deep.equal([addressResolutionsStatement1, addressResolutionsStatement2]); }
			));
	});

	describe('mosaic resolution statements by height', () => {
		// Arrange:
		const knownHeight = 4668;
		const mosaicResolutionsStatement1 = test.mosaicResolutionStatementDb.createMosaicResolutionStatement(knownHeight);
		const mosaicResolutionsStatement2 = test.mosaicResolutionStatementDb.createMosaicResolutionStatement(knownHeight);
		const mosaicResolutionsStatement3 = test.mosaicResolutionStatementDb.createMosaicResolutionStatement(knownHeight + 1);

		it('returns empty array for non-existing mosaic resolution statements in block', () =>
			// Assert:
			test.mosaicResolutionStatementDb.runDbTest(
				[mosaicResolutionsStatement1, mosaicResolutionsStatement2, mosaicResolutionsStatement3],
				db => db.statementsAtHeight(Long.fromNumber(knownHeight + 10), 'mosaicResolutionStatements'),
				entities => { expect(entities).to.deep.equal([]); }
			));

		it('returns mosaic resolution statements in block at height', () =>
			// Assert:
			test.mosaicResolutionStatementDb.runDbTest(
				[mosaicResolutionsStatement1, mosaicResolutionsStatement2, mosaicResolutionsStatement3],
				db => db.statementsAtHeight(Long.fromNumber(knownHeight), 'mosaicResolutionStatements'),
				entities => { expect(entities).to.deep.equal([mosaicResolutionsStatement1, mosaicResolutionsStatement2]); }
			));
	});

	describe('transaction statements by height', () => {
		// Arrange:
		const knownHeight = 4668;
		const transactionStatement1 = test.transactionStatementDb.createTransactionStatement(knownHeight);
		const transactionStatement2 = test.transactionStatementDb.createTransactionStatement(knownHeight);
		const transactionStatement3 = test.transactionStatementDb.createTransactionStatement(knownHeight + 1);

		it('returns empty array for non-existing transaction statements in block', () =>
			// Assert:
			test.transactionStatementDb.runDbTest(
				[transactionStatement1, transactionStatement2, transactionStatement3],
				db => db.statementsAtHeight(Long.fromNumber(knownHeight + 10), 'transactionStatements'),
				entities => { expect(entities).to.deep.equal([]); }
			));

		it('returns transaction statements in block at height', () =>
			// Assert:
			test.transactionStatementDb.runDbTest(
				[transactionStatement1, transactionStatement2, transactionStatement3],
				db => db.statementsAtHeight(Long.fromNumber(knownHeight), 'transactionStatements'),
				entities => { expect(entities).to.deep.equal([transactionStatement1, transactionStatement2]); }
			));
	});

	describe('transaction statements by height and receipt type', () => {
		// Arrange:
		const knownHeight = 4668;
		const transactionStatements = [];
		for (let t=0; t<3; t++) {
			transactionStatements.push(test.transactionStatementDb.createTransactionStatement(knownHeight+t));
		}

		const expectedResult = [{
				height: transactionStatements[0].height, 
				source: transactionStatements[0].source, 
				receipt: transactionStatements[0].receipts[0]
			}];

		it('returns empty array for non-existing transaction statements in block', () =>
			// Assert:
			test.transactionStatementDb.runDbTest(
				transactionStatements,
				db => db.getReceiptsAtHeightByReceiptType(Long.fromNumber(knownHeight + 10), 8515),
				entities => { expect(entities).to.deep.equal([]); }
			));

		it('returns transaction statements of receipt type in block at height', () =>
			// Assert:
			test.transactionStatementDb.runDbTest(
				transactionStatements,
				db => db.getReceiptsAtHeightByReceiptType(Long.fromNumber(knownHeight), 8515),
				entities => { expect(entities).to.deep.equal([expectedResult]); }
			));
	});

	describe('transaction statements of exchangesda at height', () => {
		// Arrange:
		const knownHeight = 4668;
		const transactionStatements = [];
		for (let t=0; t<3; t++) {
			transactionStatements.push(test.transactionStatementDb.createTransactionStatement(knownHeight+t));
		}

		const expectedResult = [];
		for (let r=4; r<7; r++) {
			expectedResult.push({height: transactionStatements[0].height, 
				source: transactionStatements[0].source, 
				receipt: transactionStatements[0].receipts[r]})
		};

		it('returns empty array for non-existing transaction statements in block', () =>
			// Assert:
			test.transactionStatementDb.runDbTest(
				transactionStatements,
				db => db.getSdaExchangeReceiptsAtHeight(Long.fromNumber(knownHeight + 10)),
				entities => { expect(entities).to.deep.equal([]); }
			));

		it('returns transaction statements of exchangesda receipt types in block at height', () =>
			// Assert:
			test.transactionStatementDb.runDbTest(
				transactionStatements,
				db => db.getSdaExchangeReceiptsAtHeight(Long.fromNumber(knownHeight)),
				entities => { expect(entities).to.deep.equal(expectedResult); }
			));
	});

	describe('transaction statements of exchangesda by public key at height', () => {
		// Arrange:
		const knownHeight = 4668;
		const account = test.random.publicKey();
		const transactionStatements = [];
		for (let t=0; t<3; t++) {
			transactionStatements.push(test.transactionStatementDb.createTransactionStatement(knownHeight));
		}
		transactionStatements[0].account = account;

		const expectedResults = [];
		for (let t=0, r=4; t<3, r<7; t++, r++) {
			expectedResults.push({height: transactionStatements[t].height, 
				source: transactionStatements[t].source, 
				receipt: transactionStatements[t].receipts[r]})
		};

		it('returns empty array for non-existing transaction statements in block', () =>
			// Assert:
			test.transactionStatementDb.runDbTest(
				transactionStatements,
				db => db.getSdaExchangeReceiptsAtHeight(Long.fromNumber(knownHeight + 10)),
				entities => { expect(entities).to.deep.equal([]); }
			));

		it('returns transaction statements of exchangesda receipt types in block by public key at height', () =>
			// Assert:
			test.transactionStatementDb.runDbTest(
				transactionStatements,
				db => db.getSdaExchangeReceiptsAtHeight(Long.fromNumber(knownHeight)),
				entities => { expect(entities).to.deep.equal(expectedResults); }
			));
	});
});
