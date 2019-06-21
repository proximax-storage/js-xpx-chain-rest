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

class AccountPropertiesDb {
	/**
	 * Creates AccountPropertiesDb around CatapultDb.
	 * @param {module:db/CatapultDb} db Catapult db instance.
	 */
	constructor(db) {
		this.catapultDb = db;
	}

	/**
	 * Retrieves account properties of the given addresses.
	 * @param {array<object>} addresses Given addresses.
	 * @returns {Promise.<array>} Owned account properties.
	 */
	accountPropertiesByAddresses(addresses) {
		const buffers = addresses.map(address => Buffer.from(address));
		const conditions = { 'accountProperties.address': { $in: buffers } };
		return this.catapultDb.queryDocuments('accountProperties', conditions);
	}
}

module.exports = AccountPropertiesDb;
