/**
 *** Copyright 2019 ProximaX Limited. All rights reserved.
 *** Use of this source code is governed by the Apache 2.0
 *** license that can be found in the LICENSE file.
 **/

const test = require('./utils/upgradeDbTestUtils');
const { expect } = require('chai');

describe('upgrade db', () => {
	describe('upgrade less than or equal height', () => {
		const assertUpgradesLessOrEqualThanHeight = (height, limit) => {
			// Arrange:
			const heights = [];
			for (let i = 1; i <= 100; ++i) {
				heights.push(i);
			}
			const expectedHeights = heights.slice(((0 === limit) ? 0 : height - limit), height).reverse();
			const entries = test.db.createUpgradeEntries(heights);
			const expectedEntries = test.db.createUpgradeEntries(expectedHeights);
			expectedEntries.forEach(entry => { delete entry._id; });

			// Assert:
			return test.db.runDbTest(
				entries,
				db => db.upgradesLessOrEqualThanHeight(height, limit),
				entities => {
					expect(entities).to.deep.equal(expectedEntries);
				}
			);
		};

		it('without limit', () => {
			return assertUpgradesLessOrEqualThanHeight(70, 0);
		});

		it('with limit', () => {
			return assertUpgradesLessOrEqualThanHeight(70, 40);
		});
	});
});
