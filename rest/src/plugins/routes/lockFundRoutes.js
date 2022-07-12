/**
 *** Copyright 2020 ProximaX Limited. All rights reserved.
 *** Use of this source code is governed by the Apache 2.0
 *** license that can be found in the LICENSE file.
 **/

const routeUtils = require('../../routes/routeUtils');

module.exports = {
	register: (server, db) => {
		server.get('/lockfund/height/:height', (req, res, next) => {
			const height = routeUtils.parseArgument(req.params, 'height', 'uint64');
			return db.getLockFundRecordGroupByHeight(height)
				.then(routeUtils.createSender('lockFundRecordGroupEntry_height').sendOne(req.params.height, res, next));
		});

		server.get('/lockfund/account/:publicKey', (req, res, next) => {
			const key = routeUtils.parseArgument(req.params, 'publicKey', 'publicKey');
			return db.getLockFundRecordGroupByKey(key)
				.then(routeUtils.createSender('lockFundRecordGroupEntry_key').sendOne(req.params.publicKey, res, next));
		});
	}
};
