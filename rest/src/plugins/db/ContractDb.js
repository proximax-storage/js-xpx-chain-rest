/*
 * Copyright (c) 2018-present
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

const AccountType = require('../AccountType');

class ContractDb {
	/**
	 * Creates ContractDb around CatapultDb.
	 * @param {module:db/CatapultDb} db Catapult db instance.
	 */
	constructor(db) {
		this.catapultDb = db;
	}

	// region contract retrieval

	/**
	 * Retrieves the contract entries for given accounts.
	 * @param {array<object>} accountIds The account ids.
	 * @returns {Promise.<array>} The contract entries for all accounts.
	 */
	contractsByAccounts(accountIds) {
		const buffers = accountIds.map(accountId => Buffer.from(accountId));
		return this.catapultDb.queryDocuments('contracts', {
			$or:[
				{ ['contract.multisig']: { $in: buffers } },
				{ ['contract.executors']: { $in: buffers } },
				{ ['contract.verifiers']: { $in: buffers } },
				{ ['contract.customers']: { $in: buffers } }
			]
		});
	}

	/**
	 * Retrieves the contract entries by given ids.
	 * @param {module:db/AccountType} type The type of ids.
	 * @param {array<object>} ids The ids of contract publicKey/address of multisig.
	 * @returns {Promise.<array>} The contract entries for all accounts.
	 */
	contractsByIds(type, ids) {
		const buffers = ids.map(accountId => Buffer.from(accountId));
		const fieldName = (AccountType.publicKey === type) ? 'contract.multisig' : 'contract.multisigAddress';
		return this.catapultDb.queryDocuments('contracts', { [fieldName]: { $in: buffers } });
	}

	// endregion
}

module.exports = ContractDb;
