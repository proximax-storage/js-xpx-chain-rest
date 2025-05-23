/**
 *** Copyright 2019 ProximaX Limited. All rights reserved.
 *** Use of this source code is governed by the Apache 2.0
 *** license that can be found in the LICENSE file.
 **/

const routeUtils = require('../../routes/routeUtils');

const parseHeight = params => routeUtils.parseArgument(params, 'height', 'uint');

module.exports = {
	register: (server, db) => {
		server.get('/config/:height', (req, res, next) => {
			const height = parseHeight(req.params);
			return db.configsLessOrEqualThanHeight(height, 1 /* limit */)
				.then(routeUtils.createSender('networkConfigEntry').sendOne(req.params.height, res, next));
		});
	}
};
