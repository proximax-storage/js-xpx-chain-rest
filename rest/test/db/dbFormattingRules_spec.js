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

const catapult = require('catapult-sdk');
const formattingRules = require('../../src/db/dbFormattingRules');
const test = require('../testUtils');
const { convertToLong } = require('../../src/db/dbUtils');
const { Binary } = require('mongodb');
const { expect } = require('chai');

const { ModelType } = catapult.model;

describe('db formatting rules', () => {
	it('can format none type', () => {
		// Arrange:
		const object = { foo: 8 };

		// Act:
		const result = formattingRules[ModelType.none](object);

		// Assert:
		expect(result).to.deep.equal({ foo: 8 });
	});

	it('can format binary type', () => {
		// Arrange:
		const object = test.factory.createBinary(Buffer.from('FEDCBA9876543210', 'hex'));

		// Act:
		const result = formattingRules[ModelType.binary](object);

		// Assert:
		expect(result).to.equal('FEDCBA9876543210');
	});

	it('can format javascript buffer as binary type', () => {
		// Arrange:
		const object = Buffer.from('FEDCBA9876543210', 'hex');

		// Act:
		const result = formattingRules[ModelType.binary](object);

		// Assert:
		expect(result).to.equal('FEDCBA9876543210');
	});

	it('can format uint64 type from Long', () => {
		// Arrange:
		const object = convertToLong([1, 2]);

		// Act:
		const result = formattingRules[ModelType.uint64](object);

		// Assert:
		expect(result).to.deep.equal([1, 2]);
	});

	it('can format uint64 type from Binary', () => {
		// Arrange:
		const buffer = Buffer.alloc(8, 0);
		buffer.writeUInt32LE(0x00ABCDEF, 0);
		buffer.writeUInt32LE(0x000FDFFF, 4);
		const object = new Binary(buffer);

		// Act:
		const result = formattingRules[ModelType.uint64](object);

		// Assert:
		expect(result).to.deep.equal([0x00ABCDEF, 0x000FDFFF]);
	});

	it('can format uint16 type', () => {
		// Act:
		const result = formattingRules[ModelType.uint16](17434);

		// Assert:
		expect(result).to.equal(17434);
	});

	it('can format uint16 type from Binary', () => {
		// Arrange:
		const buffer = Buffer.alloc(2, 0);
		buffer.writeUInt16LE(17434);
		const object = new Binary(buffer);

		// Act:
		const result = formattingRules[ModelType.uint16](object);

		// Assert:
		expect(result).to.deep.equal(17434);
	});

	it('can format object id type', () => {
		// Arrange:
		const object = test.factory.createObjectIdFromHexString('3AEDCBA9876F94725732547F');

		// Act:
		const result = formattingRules[ModelType.objectId](object);

		// Assert:
		expect(result).to.equal('3AEDCBA9876F94725732547F');
	});

	it('can format status code type', () => {
		// Arrange: notice that codes are signed in db
		[0x80530008, -2142044152].forEach(code => {
			// Act:
			const result = formattingRules[ModelType.statusCode](code);

			// Assert:
			expect(result, `${code} code`).to.equal('Failure_Signature_Not_Verifiable');
		});
	});
});
