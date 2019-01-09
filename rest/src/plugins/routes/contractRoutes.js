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

const routeUtils = require('../../routes/routeUtils');
const AccountType = require('../../plugins/AccountType');
const errors = require('../../server/errors');

module.exports = {
	register: (server, db) => {
		server.get('/account/:accountId/contracts', (req, res, next) => {
			const [type, accountId] = routeUtils.parseArgument(req.params, 'accountId', 'accountId');

			if (type != AccountType.publicKey)
				throw errors.createInvalidArgumentError('Allowed only publicKeys');

			return db.contractsByAccounts([accountId])
				.then(routeUtils.createSender('contractEntry').sendArray(req.params.accountId, res, next));
		});

		server.get('/contract/:accountId', (req, res, next) => {
			const [type, accountId] = routeUtils.parseArgument(req.params, 'accountId', 'accountId');

			return db.contractsByIds(type, [accountId])
				.then(routeUtils.createSender('contractEntry').sendOne(req.params.accountId, res, next));
		});

		server.post('/contract', (req, res, next) => {
			if (req.params.publicKeys && req.params.addresses)
				throw errors.createInvalidArgumentError('publicKeys and addresses cannot both be provided');

			const idOptions = Array.isArray(req.params.publicKeys)
				? { keyName: 'publicKeys', parserName: 'publicKey', type: AccountType.publicKey }
				: { keyName: 'addresses', parserName: 'address', type: AccountType.address };

			const accountIds = routeUtils.parseArgumentAsArray(req.params, idOptions.keyName, idOptions.parserName);
			const sender = routeUtils.createSender('contractEntry');

			return db.contractsByIds(idOptions.type, accountIds).then(sender.sendArray(idOptions.keyName, res, next));
		});
	}
};
