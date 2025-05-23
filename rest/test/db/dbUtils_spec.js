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

const dbUtils = require('../../src/db/dbUtils');
const MongoDb = require('mongodb');

const { expect } = require('chai');

describe('db utils', () => {
	describe('convertToLong', () => {
		it('can convert from integer to long', () => {
			// Act + Assert:
			expect(dbUtils.convertToLong(123)).to.deep.equal(MongoDb.Long(123, 0));
		});

		it('can convert from uint64 array to long', () => {
			// Act + Assert:
			expect(dbUtils.convertToLong([123, 456])).to.deep.equal(MongoDb.Long(123, 456));
		});

		it('can convert from negative one to long', () => {
			// Act + Assert:
			expect(dbUtils.convertToLong(-1)).to.deep.equal(MongoDb.Long.NEG_ONE);
		});

		it('can convert from one to long', () => {
			// Act + Assert:
			expect(dbUtils.convertToLong(1)).to.deep.equal(MongoDb.Long.ONE);
			expect(dbUtils.convertToLong([1, 0])).to.deep.equal(MongoDb.Long.ONE);
		});

		it('can convert from zero to long', () => {
			// Act + Assert:
			expect(dbUtils.convertToLong(0)).to.deep.equal(MongoDb.Long.ZERO);
			expect(dbUtils.convertToLong([0, 0])).to.deep.equal(MongoDb.Long.ZERO);
		});

		it('returns same value if value is already long', () => {
			// Arrange
			const longValue = MongoDb.Long.fromNumber(12345);

			// Act + Assert:
			expect(dbUtils.convertToLong(longValue)).to.deep.equal(longValue);
		});

		it('throws error if value not integer and not array', () => {
			// Act + Assert:
			expect(() => dbUtils.convertToLong('abc')).to.throw('abc has an invalid format: not integer or uint64');
		});
	});

	describe('longToUint64', () => {
		it('can convert from long to uint64', () => {
			// Act + Assert:
			expect(dbUtils.longToUint64(MongoDb.Long(123, 456))).to.deep.equal([123, 456]);
		});

		it('can convert from one, long value, to uint64', () => {
			// Act + Assert:
			expect(dbUtils.longToUint64(MongoDb.Long.ONE)).to.deep.equal([1, 0]);
		});

		it('can convert from zero, long value, to uint64', () => {
			// Act + Assert:
			expect(dbUtils.longToUint64(MongoDb.Long.ZERO)).to.deep.equal([0, 0]);
		});

		it('throws error if value not long', () => {
			// Act + Assert:
			expect(() => dbUtils.longToUint64('abc')).to.throw('abc has an invalid format: not long');
		});
	});
});
