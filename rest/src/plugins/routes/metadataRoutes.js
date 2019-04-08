/**
 *** Copyright 2019 ProximaX Limited. All rights reserved.
 *** Use of this source code is governed by the Apache 2.0
 *** license that can be found in the LICENSE file.
 **/

const AccountType = require('../../plugins/AccountType');
const catapult = require('catapult-sdk');
const routeUtils = require('../../routes/routeUtils');

const { address, networkInfo } = catapult.model;

module.exports = {
	register: (server, db, services) => {
		server.get('/account/:accountId/metadata', (req, res, next) => {
			let [type, accountId] = routeUtils.parseArgument(req.params, 'accountId', 'metadataId');

			if (type === AccountType.publicKey)
				accountId = address.publicKeyToAddress(accountId, networkInfo.networks[services.config.network.name].id)

			return db.metadatasByIds([accountId])
				.then(routeUtils.createSender('metadataEntry').sendArray(req.params.accountId, res, next));
		});

		server.get('/mosaic/:mosaicId/metadata', (req, res, next) => {
			let [type, mosaicId] = routeUtils.parseArgument(req.params, 'mosaicId', 'metadataId');
			return db.metadatasByIds([mosaicId])
				.then(routeUtils.createSender('metadataEntry').sendArray(req.params.mosaicId, res, next));
		});

		server.get('/namespace/:namespaceId/metadata', (req, res, next) => {
			let [type, namespaceId] = routeUtils.parseArgument(req.params, 'namespaceId', 'metadataId');
			return db.metadatasByIds([namespaceId])
				.then(routeUtils.createSender('metadataEntry').sendArray(req.params.namespaceId, res, next));
		});

		server.get('/metadata/:metadataId', (req, res, next) => {
			let [type, metadataId] = routeUtils.parseArgument(req.params, 'metadataId', 'metadataId');

			if (type === AccountType.publicKey)
				metadataId = address.publicKeyToAddress(metadataId, networkInfo.networks[services.config.network.name].id);

			return db.metadatasByIds([metadataId])
				.then(routeUtils.createSender('metadataEntry').sendOne(req.params.metadataId, res, next));
		});

		server.post('/metadata', (req, res, next) => {
			if (Array.isArray(req.params.metadataIds))
				throw errors.createInvalidArgumentError('metadataIds must be array');

			const metadataIds = routeUtils.parseArgumentAsArray(req.params, 'metadataIds', 'metadataId');
			const sender = routeUtils.createSender('metadataEntry');

			return db.metadatasByIds(metadataIds).then(sender.sendArray('metadataIds', res, next));
		});
	}
};
