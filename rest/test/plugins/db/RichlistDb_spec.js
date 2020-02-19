/**
 *** Copyright 2019 ProximaX Limited. All rights reserved.
 *** Use of this source code is governed by the Apache 2.0
 *** license that can be found in the LICENSE file.
 **/

const MongoDb = require('mongodb');
const test = require('./utils/richlistDbTestUtils');
const { expect } = require('chai');

const { Long } = MongoDb;

describe('richlist db', () => {
	describe('descending account mosaic balances', () => {
		const assertDescendingAccountMosaicBalances = (mosaicBalances, expectedSortedBalances) => {
			// Arrange:
			const mosaicId = new Long(2286920234, 1556145351);
			const entries = test.db.createMinimalAccountEntries(mosaicId, mosaicBalances);

			// Assert:
			return test.db.runDbTest(
				entries,
				db => db.descendingAccountMosaicBalances([2286920234, 1556145351]),
				entities => {
					expect(entities).to.have.lengthOf(expectedSortedBalances.length)
					let i = 0;
					entities.forEach(entity => {
						expect(entity.address).to.not.be.undefined;
						expect(entity.publicKey).to.not.be.undefined;
						expect(entity.amount.high_).to.be.equal(0);
						expect(entity.amount.low_).to.be.equal(expectedSortedBalances[i]);
						i++;
					});
				}
			);
		};

		it('with balances owners', () => {
			return assertDescendingAccountMosaicBalances([3, 5, 1], [5, 3, 1]);
		});
	});

});
