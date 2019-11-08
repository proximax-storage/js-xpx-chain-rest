/**
 *** Copyright 2019 ProximaX Limited. All rights reserved.
 *** Use of this source code is governed by the Apache 2.0
 *** license that can be found in the LICENSE file.
 **/

const catapult = require('catapult-sdk');
const routeUtils = require('../../routes/routeUtils');
const namespaceDb = require('../namespace/NamespaceDb');

const { uint64 } = catapult.utils;

module.exports = {
	register: (server, db) => {
		const exchangeSender = routeUtils.createSender('exchangeEntry');

		server.get(`/account/:accountId/exchange`, (req, res, next) => {
			const [idType, accountId] = routeUtils.parseArgument(req.params, 'accountId', 'accountId');
			return db.exchangesByIds(idType, [accountId])
				.then(exchangeSender.sendOne(req.params.accountId, res, next));
		});

		server.post(`/exchange/:type/:assetId`, (req, res, next) => {
			const offerTypeStr = req.params['type'];
			if (offerTypeStr != 'buy' && offerTypeStr != 'sell')
				throw errors.createInvalidArgumentError(`offer type ${offerTypeStr} is invalid`);
			const offerType = (offerTypeStr === 'buy') ? db.OfferType.Buy : db.OfferType.Sell;

			const assetId = routeUtils.parseArgument(req.params, 'assetId', uint64.fromHex);
			const mosaicId = namespaceDb.mosaicIdByNamespaceId(assetId);
			if (!mosaicId)
				mosaicId = assetId;
				
			const pagingOptions = routeUtils.parsePagingArguments(req.params);

			return db.exchangesByMosaicIds(offerType, [mosaicId], pagingOptions.id, pagingOptions.pageSize)
				.then(exchangeSender.sendArray('mosaicId', res, next));
		});
	}
};
