/**
 *** Copyright 2018 ProximaX Limited. All rights reserved.
 *** Use of this source code is governed by the Apache 2.0
 *** license that can be found in the LICENSE file.
 **/

const AccountType = require('../AccountType');
const errors = require('../../server/errors');

const allowedRoles = ['multisig', 'executors', 'verifiers', 'customers'];

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
	 * @param {array<string>} roles Filters the role of account in the contracts.
	 * If filter is null or empty, returns all contracts which contains public key of account.
	 * @returns {Promise.<array>} The contract entries for all accounts.
	 */
	contractsByAccounts(accountIds, roles) {
		const buffers = accountIds.map(accountId => Buffer.from(accountId));

		if (!roles || !roles.length)
			roles = allowedRoles;

		const query = [];
		for (let i = 0; i < roles.length; ++i) {
			if (-1 === allowedRoles.indexOf(roles[i]))
				throw errors.createInvalidArgumentError(`Role '${roles[i]}' is not supported`);

			const field = `contract.${roles[i]}`;
			query.push({ [field]: { $in: buffers } });
		}

		return this.catapultDb.queryDocuments('contracts', {
			$or: query
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
