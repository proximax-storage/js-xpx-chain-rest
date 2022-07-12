/**
 *** Copyright 2019 ProximaX Limited. All rights reserved.
 *** Use of this source code is governed by the Apache 2.0
 *** license that can be found in the LICENSE file.
 **/

const test = require('./utils/mosaicDbTestUtils');
const catapult = require('catapult-sdk');
const dbTestUtils = require('../../db/utils/dbTestUtils')
const { convertToLong } = require('../../../src/db/dbUtils');
const MosaicRestrictionDb = require('../../../src/plugins/db/MosaicRestrictionDb');
const { expect } = require('chai');
const CatapultDb = require("../../../src/db/CatapultDb");
const sinon = require("sinon");

describe('mosaicrestriction db', () => {
	const { address } = catapult.model;
	const { createObjectId } = dbTestUtils.db;
	const testAddress1 = address.stringToAddress('SSBZ22LWA7GDZLPLQF7PXTMNLWSEZ7ZRVGRMWLXQ');
	const testAddress2 = address.stringToAddress('SNAR3W7B4BCOZSZMFIZRYB3N5YGOUSWIYJCJ6HDA');

	const paginationOptions = {
		pageSize: 10,
		pageNumber: 1,
		sortField: 'id',
		sortDirection: -1
	};

	const createMosaicRestriction = (objectId, mosaicId, entryType, targetAddress) => ({
		_id: createObjectId(objectId),
		mosaicRestrictionEntry: {
			compositeHash: '',
			entryType,
			mosaicId: mosaicId ? convertToLong(mosaicId) : undefined,
			targetAddress: targetAddress ? Buffer.from(targetAddress) : undefined,
			restrictions: []
		}
	});

	const runMosaicRestrictionsDbTest = (dbEntities, issueDbCommand, assertDbCommandResult) =>
		dbTestUtils.db.runDbTest(dbEntities, 'mosaicRestrictions', db => new MosaicRestrictionDb(db), issueDbCommand, assertDbCommandResult);

	const runTestAndVerifyIds = (dbRestrictions, dbQuery, expectedIds) => {
		const expectedObjectIds = expectedIds.map(id => createObjectId(id));

		return runMosaicRestrictionsDbTest(
			dbRestrictions,
			dbQuery,
			mosaicRestrictionsPage => {
				const returnedIds = mosaicRestrictionsPage.data.map(t => t.id);
				expect(mosaicRestrictionsPage.data.length).to.equal(expectedObjectIds.length);
				expect(returnedIds.sort()).to.deep.equal(expectedObjectIds.sort());
			}
		);
	};

	it('returns expected structure', () => {
		// Arrange:
		const dbMosaicRestrictions = [createMosaicRestriction(10)];

		// Act + Assert:
		return runMosaicRestrictionsDbTest(
			dbMosaicRestrictions,
			db => db.mosaicRestrictions(undefined, undefined, undefined, paginationOptions),
			page => {
				const expected_keys = ['id', 'mosaicRestrictionEntry'];
				expect(Object.keys(page.data[0]).sort()).to.deep.equal(expected_keys.sort());
			}
		);
	});

	it('returns filtered mosaic restrictions by mosaicId', () => {
		// Arrange:
		const dbMosaicRestrictions = [
			createMosaicRestriction(10, [0xAAAD29AA, 0xAAC67FAA]),
			createMosaicRestriction(20, [0x1CAD29E3, 0x0DC67FBE])
		];

		// Act + Assert:
		return runTestAndVerifyIds(
			dbMosaicRestrictions,
			db => db.mosaicRestrictions([0xAAAD29AA, 0xAAC67FAA], undefined, undefined, paginationOptions), [10]
		);
	});

	it('returns filtered mosaic restrictions by entry type', () => {
		// Arrange:
		const dbMosaicRestrictions = [
			createMosaicRestriction(10, undefined, 0),
			createMosaicRestriction(20, undefined, 1)
		];

		// Act + Assert:
		return runTestAndVerifyIds(
			dbMosaicRestrictions,
			db => db.mosaicRestrictions(undefined, 0, undefined, paginationOptions), [10]
		);
	});

	it('returns filtered mosaic restrictions by targetAddress', () => {
		// Arrange:
		const dbMosaicRestrictions = [
			createMosaicRestriction(10, undefined, undefined, testAddress1),
			createMosaicRestriction(20, undefined, undefined, testAddress2)
		];

		// Act + Assert:
		return runTestAndVerifyIds(
			dbMosaicRestrictions,
			db => db.mosaicRestrictions(undefined, undefined, testAddress2, paginationOptions), [20]
		);
	});

	it('returns all mosaic restrictions if no filters provided', () => {
		// Arrange:
		const dbMosaicRestrictions = [
			createMosaicRestriction(10),
			createMosaicRestriction(20),
			createMosaicRestriction(30)
		];

		// Act + Assert:
		return runTestAndVerifyIds(
			dbMosaicRestrictions,
			db => db.mosaicRestrictions(undefined, undefined, undefined, paginationOptions), [10, 20, 30]
		);
	});

	describe('respects sort conditions', () => {
		// Arrange:
		const dbMosaicRestrictions = () => [
			createMosaicRestriction(10),
			createMosaicRestriction(20),
			createMosaicRestriction(30)
		];

		it('direction ascending', () => {
			const options = {
				pageSize: 10,
				pageNumber: 1,
				sortField: 'id',
				sortDirection: 1
			};

			// Act + Assert:
			return runMosaicRestrictionsDbTest(
				dbMosaicRestrictions(),
				db => db.mosaicRestrictions(undefined, undefined, undefined, options),
				page => {
					expect(page.data[0].id).to.deep.equal(createObjectId(10));
					expect(page.data[1].id).to.deep.equal(createObjectId(20));
					expect(page.data[2].id).to.deep.equal(createObjectId(30));
				}
			);
		});

		it('direction descending', () => {
			const options = {
				pageSize: 10,
				pageNumber: 1,
				sortField: 'id',
				sortDirection: -1
			};

			// Act + Assert:
			return runMosaicRestrictionsDbTest(
				dbMosaicRestrictions(),
				db => db.mosaicRestrictions(undefined, undefined, undefined, options),
				page => {
					expect(page.data[0].id).to.deep.equal(createObjectId(30));
					expect(page.data[1].id).to.deep.equal(createObjectId(20));
					expect(page.data[2].id).to.deep.equal(createObjectId(10));
				}
			);
		});

		it('sort field', () => {
			const queryPagedDocumentsSpy = sinon.spy(CatapultDb.prototype, 'queryPagedDocumentsExt');
			const options = {
				pageSize: 10,
				pageNumber: 1,
				sortField: 'id',
				sortDirection: 1
			};

			// Act + Assert:
			return runMosaicRestrictionsDbTest(
				dbMosaicRestrictions(),
				db => db.mosaicRestrictions(undefined, undefined, undefined, options),
				() => {
					expect(queryPagedDocumentsSpy.calledOnce).to.equal(true);
					expect(Object.keys(queryPagedDocumentsSpy.firstCall.args[2])[0]).to.equal('_id');
					queryPagedDocumentsSpy.restore();
				}
			);
		});
	});

	describe('respects offset', () => {
		// Arrange:
		const dbMosaicRestrictions = () => [
			createMosaicRestriction(10),
			createMosaicRestriction(20),
			createMosaicRestriction(30)
		];
		const options = {
			pageSize: 10,
			pageNumber: 1,
			sortField: 'id',
			sortDirection: 1,
			offset: createObjectId(20)
		};

		it('gt', () => {
			options.sortDirection = 1;

			// Act + Assert:
			return runTestAndVerifyIds(
				dbMosaicRestrictions(),
				db => db.mosaicRestrictions(undefined, undefined, undefined, options),
				[30]
			);
		});

		it('lt', () => {
			options.sortDirection = -1;

			// Act + Assert:
			return runTestAndVerifyIds(
				dbMosaicRestrictions(),
				db => db.mosaicRestrictions(undefined, undefined, undefined, options),
				[10]
			);
		});
	});
});
