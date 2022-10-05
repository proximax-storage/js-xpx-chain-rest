/**
 *** Copyright 2022 ProximaX Limited. All rights reserved.
 *** Use of this source code is governed by the Apache 2.0
 *** license that can be found in the LICENSE file.
 **/

 const catapult = require('catapult-sdk');
 const routeUtils = require('../../routes/routeUtils');
 const errors = require('../../server/errors');
 const NamespaceDb = require('../namespace/NamespaceDb');

 module.exports = {
    register: (server, db) => {
        server.get(`/account/:accountId/exchangesda`, (req, res, next) => {
            const [idType, accountId] = routeUtils.parseArgument(req.params, 'accountId', 'accountId');
            return db.exchangesdaByIds(idType, [accountId])
                .then(routeUtils.createSender('sdaExchangeEntry').sendOne(req.params.accountId, res, next));
        });

        server.get(`/exchangesda/:type/:mosaicId`, (req, res, next) => {
			const { params } = req;
			if (params.type !== 'give' && params.type !== 'get')
				throw errors.createInvalidArgumentError(`type has an invalid format`);

        	const pagingOptions = routeUtils.parsePagingArguments(params);
            let ordering = -1;
			if (params.ordering) {
				ordering = routeUtils.parseArgument(params, 'ordering', input => {
					if ('1' === input)
						return 1;
					else if ('-1' == input)
						return -1;
					else throw errors.createInvalidArgumentError(`invalid ordering ${input}`);
				});
			}

            let assetId = routeUtils.parseArgument(params, 'mosaicId', 'mosaicId');
			const namespaceDb = new NamespaceDb(db.getCatapultDb());

			if (params.type == 'give') {
				return namespaceDb.mosaicIdByNamespaceId(assetId)
					.then(mosaicId => {
						if (mosaicId)
							assetId = mosaicId;
						return db.exchangesdaByMosaicIdGive([assetId], pagingOptions.id, pagingOptions.pageSize, ordering);
					})
					.then(routeUtils.createSender('sdaExchangeEntry.sdaOfferBalances').sendArray('mosaicId', res, next));
			}

			if (params.type == 'get') {
				return namespaceDb.mosaicIdByNamespaceId(assetId)
					.then(mosaicId => {
						if (mosaicId)
							assetId = mosaicId;
						return db.exchangesdaByMosaicIdGet([assetId], pagingOptions.id, pagingOptions.pageSize, ordering);
					})
					.then(routeUtils.createSender('sdaExchangeEntry.sdaOfferBalances').sendArray('mosaicId', res, next));
			}
        });
    }
 };