/**
 *** Copyright 2019 ProximaX Limited. All rights reserved.
 *** Use of this source code is governed by the Apache 2.0
 *** license that can be found in the LICENSE file.
 **/

const catapult = require('catapult-sdk');
const routeUtils = require('../../routes/routeUtils');

const { address, networkInfo } = catapult.model;
const { convert } = catapult.utils;
const constants = {
	sizes: {
		hexPublicKey: 64,
		addressEncoded: 40,
		hexUint64: 16
	}
};

module.exports = {
	register: (server, db, services) => {
		const ParseMetadataId = str => {
			if (constants.sizes.hexPublicKey === str.length) {
				const publicKey = convert.hexToUint8(str);
				return ['address', address.publicKeyToAddress(publicKey, networkInfo.networks[services.config.network.name].id)];
			} else if (constants.sizes.addressEncoded === str.length)
				return ['address', address.stringToAddress(str)];
			else if (constants.sizes.hexUint64 === str.length)
				return ['metadataId', convert.hexToUint8(str).reverse()];

			throw Error(`invalid length of account id '${str.length}'`);
		};

		server.get('/account/:accountId/metadata', (req, res, next) => {
			let [type, accountId] = routeUtils.parseArgument(req.params, 'accountId', ParseMetadataId);

			return db.metadatasByIds([accountId])
				.then(routeUtils.createSender('metadataEntry').sendArray(req.params.accountId, res, next));
		});

		server.get('/mosaic/:mosaicId/metadata', (req, res, next) => {
			let [type, mosaicId] = routeUtils.parseArgument(req.params, 'mosaicId', ParseMetadataId);
			return db.metadatasByIds([mosaicId])
				.then(routeUtils.createSender('metadataEntry').sendArray(req.params.mosaicId, res, next));
		});

		server.get('/namespace/:namespaceId/metadata', (req, res, next) => {
			let [type, namespaceId] = routeUtils.parseArgument(req.params, 'namespaceId', ParseMetadataId);
			return db.metadatasByIds([namespaceId])
				.then(routeUtils.createSender('metadataEntry').sendArray(req.params.namespaceId, res, next));
		});

		server.get('/metadata/:metadataId', (req, res, next) => {
			let [type, metadataId] = routeUtils.parseArgument(req.params, 'metadataId', ParseMetadataId);

			return db.metadatasByIds([metadataId])
				.then(routeUtils.createSender('metadataEntry').sendOne(req.params.metadataId, res, next));
		});

		server.post('/metadata', (req, res, next) => {
			if (Array.isArray(req.params.metadataIds))
				throw errors.createInvalidArgumentError('metadataIds must be array');

			const metadataIds = routeUtils.parseArgumentAsArray(req.params, 'metadataIds', ParseMetadataId);
			const sender = routeUtils.createSender('metadataEntry');

			return db.metadatasByIds(metadataIds).then(sender.sendArray('metadataIds', res, next));
		});
	}
};
