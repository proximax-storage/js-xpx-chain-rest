/**
 *** Copyright 2019 ProximaX Limited. All rights reserved.
 *** Use of this source code is governed by the Apache 2.0
 *** license that can be found in the LICENSE file.
 **/

const routeUtils = require('../../routes/routeUtils');
const errors = require('../../server/errors');

module.exports = {
	register: (server, db, services) => {
		server.get('/drive/:accountId', (req, res, next) => {
			const [type, accountId] = routeUtils.parseArgument(req.params, 'accountId', 'accountId');
			return db.getDriveByAccountId(type, accountId)
				.then(routeUtils.createSender('driveEntry').sendOne(req.params.height, res, next));
		});

		server.get('/drives', (req, res, next) => {
			const { params } = req;

			const filters = {
				start: params.start ? routeUtils.parseArgument(params, 'start', 'uint') : undefined,
				fromStart: params.fromStart ? routeUtils.parseArgument(params, 'fromStart', 'uint64') : undefined,
				toStart: params.toStart ? routeUtils.parseArgument(params, 'toStart', 'uint64') : undefined,
				states: params.states ? routeUtils.parseArgumentAsArray(params, 'states', 'uint') : undefined
			};

			const options = routeUtils.parsePaginationArguments(params, services.config.pageSize);

			return db.drives(filters, options)
				.then(result => routeUtils.createSender('driveEntry').sendPage(res, next)(result));
		});

		const driveStates = [
			{ role: ['owner', 'replicator'], routePostfix: '' },
			{ role: ['owner'], routePostfix: '/owner' },
			{ role: ['replicator'], routePostfix: '/replicator' },
		];

		driveStates.forEach(state => {
			server.get(`/account/:accountId/drive${state.routePostfix}`, (req, res, next) => {
				const [type, accountId] = routeUtils.parseArgument(req.params, 'accountId', 'accountId');

				if ('publicKey' !== type)
					throw errors.createInvalidArgumentError('Allowed only publicKey');

				return db.getDrivesByPublicKeyAndRole(accountId, state.role)
					.then(routeUtils.createSender('driveEntry').sendArray('accountId', res, next));
			});
		});

		server.get('/drive/:accountId/downloads', (req, res, next) => {
			const pagingOptions = routeUtils.parsePagingArguments(req.params);
			const [type, accountId] = routeUtils.parseArgument(req.params, 'accountId', 'accountId');
			return db.getDownloadsByDriveId(type, accountId, pagingOptions.id, pagingOptions.pageSize)
				.then(routeUtils.createSender('downloadEntry').sendArray('accountId', res, next));
		});

		server.get('/account/:accountId/downloads', (req, res, next) => {
			const pagingOptions = routeUtils.parsePagingArguments(req.params);
			const [type, accountId] = routeUtils.parseArgument(req.params, 'accountId', 'accountId');

			if ('publicKey' !== type)
				throw errors.createInvalidArgumentError('Allowed only publicKey');

			return db.getDownloadsByFileRecipient(accountId, pagingOptions.id, pagingOptions.pageSize)
				.then(routeUtils.createSender('downloadEntry').sendArray('accountId', res, next));
		});

		server.get('/downloads/:operationToken', (req, res, next) => {
			const operationToken = routeUtils.parseArgument(req.params, 'operationToken', 'hash256');
			return db.getDownloadsByOperationToken(operationToken)
				.then(routeUtils.createSender('downloadEntry').sendOne('operationToken', res, next));
		});
	}
};
