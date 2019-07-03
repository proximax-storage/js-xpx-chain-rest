/**
 *** Copyright 2018 ProximaX Limited. All rights reserved.
 *** Use of this source code is governed by the Apache 2.0
 *** license that can be found in the LICENSE file.
 **/

const AccountType = require('../../plugins/AccountType');
const errors = require('../../server/errors');
const routeUtils = require('../../routes/routeUtils');

module.exports = {
	register: (server, db) => {
		server.get('/account/:accountId/contracts', (req, res, next) => {
			const [type, accountId] = routeUtils.parseArgument(req.params, 'accountId', 'accountId');

			if (type != AccountType.publicKey)
				throw errors.createInvalidArgumentError('Allowed only publicKeys');

			return db.contractsByAccounts([accountId])
				.then(routeUtils.createSender('contractEntry').sendArray(req.params.accountId, res, next));
		});

		server.get('/contract/:contractId', (req, res, next) => {
			const [type, contractId] = routeUtils.parseArgument(req.params, 'contractId', 'accountId');

			return db.contractsByIds(type, [contractId])
				.then(routeUtils.createSender('contractEntry').sendOne(req.params.contractId, res, next));
		});

		server.post('/account/contracts', (req, res, next) => {
			let roles = req.params.roles;
			if (req.params.addresses)
				throw errors.createInvalidArgumentError('addresses cannot both be provided. Allowed only publicKeys');

			const accountIds = routeUtils.parseArgumentAsArray(req.params, 'publicKeys', 'publicKey');
			return db.contractsByAccounts(accountIds, roles)
				.then(routeUtils.createSender('contractEntry').sendArray(req.params.accountId, res, next));
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
