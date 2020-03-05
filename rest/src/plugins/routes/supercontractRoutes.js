/**
 *** Copyright 2020 ProximaX Limited. All rights reserved.
 *** Use of this source code is governed by the Apache 2.0
 *** license that can be found in the LICENSE file.
 **/

const routeUtils = require('../../routes/routeUtils');

module.exports = {
	register: (server, db) => {
		server.get('/drive/:publicKey/supercontracts', (req, res, next) => {
			const drivePublicKey = routeUtils.parseArgument(req.params, 'publicKey', 'publicKey');
			return db.getSuperContractsByDrivePublicKey(drivePublicKey)
				.then(routeUtils.createSender('superContractEntry').sendArray(req.params.publicKey, res, next));
		});

		server.get('/supercontract/:accountId', (req, res, next) => {
			const [type, accountId] = routeUtils.parseArgument(req.params, 'accountId', 'accountId');
			return db.getSuperContractByAccountId(type, accountId)
				.then(routeUtils.createSender('superContractEntry').sendOne(req.params.accountId, res, next));
		});

		server.get('/account/:publicKey/supercontracts', (req, res, next) => {
			const ownerPublicKey = routeUtils.parseArgument(req.params, 'publicKey', 'publicKey');
			return db.getSuperContractsByOwnerPublicKey(ownerPublicKey)
				.then(routeUtils.createSender('superContractEntry').sendArray(req.params.publicKey, res, next));
		});
	}
};
