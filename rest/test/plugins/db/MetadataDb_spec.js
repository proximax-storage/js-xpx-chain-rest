/**
 *** Copyright 2019 ProximaX Limited. All rights reserved.
 *** Use of this source code is governed by the Apache 2.0
 *** license that can be found in the LICENSE file.
 **/

const AccountType = require('../../../src/plugins/AccountType');
const test = require('./utils/metadataDbTestUtils');

describe('metadata db', () => {
	const generateAddress = test.random.address;

	describe('metadata by id', () => {
		const assertMetadataById = (metadataId, additionalMetadataIds) => {
			// Arrange:
			const metadataIds = [];
			for (let i = 0; i < 5; ++i)
				metadataIds.push(generateAddress());
			const expectedEntries = [];
			additionalMetadataIds.forEach(metadataId => {
				metadataIds.push(metadataId);
				expectedEntries.push(test.db.createMetadataEntry(metadataIds.length, metadataId));
			});
			const entries = test.db.createMetadataEntries(metadataIds);

			// Assert:
			return test.db.runDbTest(
				entries,
				db => db.getMetadataById(metadataId),
				entities => {
					expect(entities).to.deep.equal(expectedEntries);
				}
			);
		};

		it('returns empty array for unknown id', () => {
			assertMetadataById(generateAddress(), []);
		});

		it('returns matching entry', () => {
			const metadataId = generateAddress();
			assertMetadataById(metadataId, [metadataId]);
		});
	});
});
