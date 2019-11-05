/**
 *** Copyright 2019 ProximaX Limited. All rights reserved.
 *** Use of this source code is governed by the Apache 2.0
 *** license that can be found in the LICENSE file.
 **/

const routeUtils = require('../../routes/routeUtils');

const parseOwner = params => routeUtils.parseArgument(params, 'owner', 'publicKey');

module.exports = {
	register: (server, db) => {
		server.get('/exchange/:owner', (req, res, next) => {
			const owner = parseOwner(req.params);
			return db.exchangesByKeys(owner)
				.then(routeUtils.createSender('exchangeEntry').sendOne(req.params.owner, res, next));
		});
	}
};
