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
