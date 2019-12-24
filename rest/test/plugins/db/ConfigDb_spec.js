/**
 *** Copyright 2019 ProximaX Limited. All rights reserved.
 *** Use of this source code is governed by the Apache 2.0
 *** license that can be found in the LICENSE file.
 **/

const test = require('./utils/configDbTestUtils');

describe('config db', () => {
	describe('config less than or equal height', () => {
		const assertConfigsLessOrEqualThanHeight = (height, limit) => {
			// Arrange:
			const heights = [];
			for (let i = 1; i <= 100; ++i) {
				heights.push(i);
			}
			const expectedHeights = heights.slice(((0 === limit) ? 0 : height - limit), height).reverse();
			const entries = test.db.createConfigEntries(heights);
			const expectedEntries = test.db.createConfigEntries(expectedHeights);

			// Assert:
			return test.db.runDbTest(
				entries,
				db => db.configsLessOrEqualThanHeight(height, limit),
				entities => {
					expect(entities).to.deep.equal(expectedEntries);
				}
			);
		};

		it('without limit', () => {
			assertConfigsLessOrEqualThanHeight(70, 0);
		});

		it('with limit', () => {
			assertConfigsLessOrEqualThanHeight(70, 40);
		});
	});
});
