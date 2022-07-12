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

const { buildOffsetCondition } = require('../../db/dbUtils');


class AccountRestrictionDb {
	/**
	 * Creates AccountRestrictionDb around CatapultDb.
	 * @param {module:db/CatapultDb} db Catapult db instance.
	 */
	constructor(db) {
		this.catapultDb = db;
	}

	getCatapultDb() {
		return this.catapultDb;
	}

	/**
	 * Retrieves account restrictions for the given addresses.
	 * @param {array<object>} addresses Given addresses.
	 * @returns {Promise.<array>} Owned account restrictions.
	 */
	accountRestrictionsByAddresses(addresses) {
		const buffers = addresses.map(address => Buffer.from(address));
		const conditions = { 'accountRestrictions.address': { $in: buffers } };
		return this.catapultDb.queryDocuments('accountRestrictions', conditions);
	}

	/**
	 * Retrieves filtered and paginated mosaic restrictions.
	 * @param {Uint8Array} address Mosaic restriction target address
	 * @param {object} options Options for ordering and pagination. Can have an `offset`, and must contain the `sortField`, `sortDirection`,
	 * `pageSize` and `pageNumber`. 'sortField' must be within allowed 'sortingOptions'.
	 * @returns {Promise.<object>} Mosaic restrictions page.
	 */
	accountRestrictions(address, options) {
		const sortingOptions = { id: '_id' };

		let conditions = {};

		const offsetCondition = buildOffsetCondition(options, sortingOptions);
		if (offsetCondition)
			conditions = Object.assign(conditions, offsetCondition);

		if (undefined !== address)
			conditions['accountRestrictions.address'] = Buffer.from(address);

		const sortConditions = { [sortingOptions[options.sortField]]: options.sortDirection };
		return this.catapultDb.queryPagedDocumentsExt(conditions, [], sortConditions, 'accountRestrictions', options);
	}
}

module.exports = AccountRestrictionDb;
