/**
 *** Copyright 2020 ProximaX Limited. All rights reserved.
 *** Use of this source code is governed by the Apache 2.0
 *** license that can be found in the LICENSE file.
 **/

const routeUtils = require('../../routes/routeUtils');

module.exports = {
	register: (server, db, services) => {
		server.get('/account/:accountId/harvesting', (req, res, next) => {
			const [type, accountId] = routeUtils.parseArgument(req.params, 'accountId', 'accountId');
			return db.getHarvesterByAccountId(type, accountId)
				.then(routeUtils.createSender('committeeEntry').sendArray(req.params.accountId, res, next));
		});

		server.get('/harvesters', (req, res, next) => {
			const options = routeUtils.parsePaginationArguments(req.params, services.config.pageSize);
			return db.harvesters(options)
				.then(result => routeUtils.createSender('committeeEntry').sendPage(res, next)(result));
		});
	}
};
