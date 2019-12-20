/**
 *** Copyright 2019 ProximaX Limited. All rights reserved.
 *** Use of this source code is governed by the Apache 2.0
 *** license that can be found in the LICENSE file.
 **/

const routeUtils = require('../../routes/routeUtils');
const errors = require('../../server/errors');

module.exports = {
	register: (server, db) => {
		server.get('/drive/:accountId', (req, res, next) => {
			const [type, accountId] = routeUtils.parseArgument(req.params, 'accountId', 'accountId');
			return db.getDriveByAccountId(type, accountId)
				.then(routeUtils.createSender('driveEntry').sendOne(req.params.height, res, next));
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
	}
};
