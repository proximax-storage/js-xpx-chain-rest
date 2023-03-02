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

const AccountType = require('../plugins/AccountType');
const catapult = require('catapult-sdk');
const errors = require('../server/errors');
const routeResultTypes = require('./routeResultTypes');
const routeUtils = require('./routeUtils');

const { convert } = catapult.utils;

module.exports = {
	register: (server, db, services) => {
		server.get('/account/:accountId', (req, res, next) => {
			const [type, accountId] = routeUtils.parseArgument(req.params, 'accountId', 'accountId');
			const sender = routeUtils.createSender(routeResultTypes.account);
			return db.accountsByIds([{ [type]: accountId }])
				.then(sender.sendOne(req.params.accountId, res, next));
		});

		server.post('/stakingRecord', (req, res, next) => {
			const { params } = req;
			let type;
			let accountId;
			if(params.accountId) {
				[type, accountId] = routeUtils.parseArgument(req.params, 'accountId', 'accountId');
			}
			const filters = {
				address: params.accountId ? type == "publicKey" ? catapult.model.address.publicKeyToAddress(accountId, this.networkId) : accountId : undefined,
				height: params.refHeight ? routeUtils.parseArgument(req.params, 'refHeight', 'uint64') : undefined,
			};
			const options = routeUtils.parsePaginationArguments(params, services.config.pageSize, { id: 'objectId' });
			return db.stakingRecords(filters, options)
				.then(result => routeUtils.createSender(routeResultTypes.stakingRecordWithMetadata).sendPage(res, next)(result));
		});

		server.get('/stakingRecord/:accountId/:refHeight', (req, res, next) => {
			const { params } = req;
			const [type, accountId] = routeUtils.parseArgument(req.params, 'accountId', 'accountId');
			const filters = {
				address: type == "publicKey" ? catapult.model.address.publicKeyToAddress(accountId, this.networkId) : accountId,
				height: routeUtils.parseArgument(req.params, 'refHeight', 'uint64'),
			};
			const sender = routeUtils.createSender(routeResultTypes.stakingRecordWithMetadata);
			return db.stakingRecordById(filters.address, filters.height)
				.then(sender.sendOne(req.params.accountId, res, next));
		});

		server.post('/account', (req, res, next) => {
			if (req.params.publicKeys && req.params.addresses)
				throw errors.createInvalidArgumentError('publicKeys and addresses cannot both be provided');

			const idOptions = Array.isArray(req.params.publicKeys)
				? { keyName: 'publicKeys', parserName: 'publicKey', type: AccountType.publicKey }
				: { keyName: 'addresses', parserName: 'address', type: AccountType.address };

			const accountIds = routeUtils.parseArgumentAsArray(req.params, idOptions.keyName, idOptions.parserName);
			const sender = routeUtils.createSender(routeResultTypes.account);

			return db.accountsByIds(accountIds.map(accountId => ({ [idOptions.type]: accountId })))
				.then(sender.sendArray(idOptions.keyName, res, next));
		});

	}
};
