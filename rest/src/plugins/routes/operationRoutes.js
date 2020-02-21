/**
 *** Copyright 2020 ProximaX Limited. All rights reserved.
 *** Use of this source code is governed by the Apache 2.0
 *** license that can be found in the LICENSE file.
 **/

const routeUtils = require('../../routes/routeUtils');

module.exports = {
	register: (server, db) => {
		server.get('/account/:accountId/operations', (req, res, next) => {
			const [type, accountId] = routeUtils.parseArgument(req.params, 'accountId', 'accountId');
			return db.getOperationsByAccountId(type, accountId)
				.then(routeUtils.createSender('operationEntry').sendArray(req.params.accountId, res, next));
		});

		server.get('/operation/:hash256', (req, res, next) => {
			const token = routeUtils.parseArgument(req.params, 'hash256', 'hash256');
			return db.getOperationByToken(token)
				.then(routeUtils.createSender('operationEntry').sendOne(req.params.hash256, res, next));
		});
	}
};
