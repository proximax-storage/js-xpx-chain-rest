/**
 *** Copyright 2019 ProximaX Limited. All rights reserved.
 *** Use of this source code is governed by the Apache 2.0
 *** license that can be found in the LICENSE file.
 **/

const catapult = require('catapult-sdk');
const routeUtils = require('../../routes/routeUtils');

const { uint64 } = catapult.utils;

module.exports = {
	register: (server, db) => {
		server.get(`/account/:accountId/exchange`, (req, res, next) => {
			const [idType, accountId] = routeUtils.parseArgument(req.params, 'accountId', 'accountId');
			return db.exchangesByIds(idType, [accountId])
				.then(routeUtils.createSender('exchangeEntry').sendOne(req.params.accountId, res, next));
		});

		server.get(`/exchange/:type/:mosaicId`, (req, res, next) => {
			const offerTypeStr = req.params['type'];
			if (offerTypeStr !== 'buy' && offerTypeStr !== 'sell')
				throw errors.createInvalidArgumentError(`offer type ${offerTypeStr} is invalid`);

			const mosaicId = routeUtils.parseArgument(req.params, 'mosaicId', uint64.fromHex);
			// TODO: add namespace id resolve

			const pagingOptions = routeUtils.parsePagingArguments(req.params);
			let ordering = offerTypeStr === 'sell' ? 1 : -1;

			if (req.params['ordering']) {
				ordering = routeUtils.parseArgument(req.params, 'ordering', input => {
					if ('id' === input)
						return 1;
					else if ('-id' == input)
						return -1;
					else throw errors.createInvalidArgumentError('Invalid id');
				});
			}

			return db.exchangesByMosaicIds(offerTypeStr, [mosaicId], pagingOptions.id, pagingOptions.pageSize, ordering)
				.then(routeUtils.createSender('offerInfo').sendArray('mosaicId', res, next));
		});
	}
};
