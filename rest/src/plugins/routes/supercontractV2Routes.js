/**
 *** Copyright 2023 ProximaX Limited. All rights reserved.
 *** Use of this source code is governed by the Apache 2.0
 *** license that can be found in the LICENSE file.
 **/

const routeUtils = require('../../routes/routeUtils');

module.exports = {
	register: (server, db, service) => {
		server.get('/supercontracts', (req, res, next) => {
			const { params } = req;

			const filters = {
				driveKey: params.driveKey ? routeUtils.parseArgument(params, 'driveKey', 'publicKey') : undefined,

				creator: params.creator ? routeUtils.parseArgument(params, 'creator', 'publicKey') : undefined
			};

			const options = routeUtils.parsePaginationArguments(params, service.config.pageSize);

			return db.supercontracts(filters, options)
				.then(result => routeUtils.createSender('supercontractEntry').sendPage(res, next)(result));
		});

		server.get('/supercontracts/:accountId', (req, res, next) => {
			const [type, accountId] = routeUtils.parseArgument(req.params, 'accountId', 'accountId');
			return db.getSuperContractByAccountId(type, accountId)
				.then(routeUtils.createSender('supercontractEntry').sendOne(req.params.accountId, res, next));
		});
	}
};
