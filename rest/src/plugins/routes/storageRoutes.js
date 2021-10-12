/**
 *** Copyright 2021 ProximaX Limited. All rights reserved.
 *** Use of this source code is governed by the Apache 2.0
 *** license that can be found in the LICENSE file.
 **/

const routeUtils = require('../../routes/routeUtils');
const errors = require('../../server/errors');

module.exports = {
    register: (server, db) => {
        server.get('/drive/:accountId', (req, res, next) => {
			const [type, accountId] = routeUtils.parseArgument(req.params, 'accountId', 'accountId');
			return db.getBcDriveByAccountId(type, accountId)
				.then(routeUtils.createSender('bcDriveEntry').sendOne(req.params.height, res, next));
		});

        server.get('/drives', (res, next) => {
			return db.drives(filters, options)
				.then(result => routeUtils.createSender('bcDriveEntry').sendPage(res, next)(result));
		});

        
		server.get('/replicators', (res, next) => {
			return routeUtils.createSender('replicatorEntry').sendPage(res, next);
		});
    }
};