/**
 *** Copyright 2019 ProximaX Limited. All rights reserved.
 *** Use of this source code is governed by the Apache 2.0
 *** license that can be found in the LICENSE file.
 **/

const routeUtils = require('../../routes/routeUtils');


module.exports = {
	register: (server, db) => {
		server.get('/mosaic/:mosaicId/richlist', (req, res, next) => {
			const mosaicId = routeUtils.parseArgument(req.params, 'mosaicId', 'mosaicId');
			const page = routeUtils.parseOptionalUintArgument(req.params, 'page');
			const pageSize = routeUtils.parseOptionalUintArgument(req.params, 'pageSize');

			return db.descendingAccountMosaicBalances(mosaicId, page, pageSize)
				.then(routeUtils.createSender('richlistEntry').sendArray(mosaicId, res, next));
		});

	}
};
