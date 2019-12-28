/**
 *** Copyright 2019 ProximaX Limited. All rights reserved.
 *** Use of this source code is governed by the Apache 2.0
 *** license that can be found in the LICENSE file.
 **/

const test = require('./utils/metadataDbTestUtils');
const { expect } = require('chai');

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
			expectedEntries.forEach(entry => { delete entry._id; });
			const entries = test.db.createMetadataEntries(metadataIds);

			// Assert:
			return test.db.runDbTest(
				entries,
				db => db.metadatasByIds([metadataId]),
				entities => expect(entities).to.deep.equal(expectedEntries)
			);
		};

		it('returns empty array for unknown id', () => {
			return assertMetadataById(generateAddress(), []);
		});

		it('returns matching entry', () => {
			const metadataId = generateAddress();
			return assertMetadataById(metadataId, [metadataId]);
		});
	});
});
