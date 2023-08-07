/**
 *** Copyright 2022 ProximaX Limited. All rights reserved.
 *** Use of this source code is governed by the Apache 2.0
 *** license that can be found in the LICENSE file.
 **/

const routeUtils = require('../../routes/routeUtils');

module.exports = {
    register: (server, db, service) => {
		server.get('/liquidity_providers', (req, res, next) => {
			const { params } = req;

			const filters = {
				mosaicId: params.mosaicId ? routeUtils.parseArgument(params, 'mosaicId', 'mosaicId') : undefined,
				slashingAccount: params.slashingAccount ? routeUtils.parseArgument(params, 'slashingAccount', 'hash256') : undefined,
				owner: params.owner ? routeUtils.parseArgument(params, 'owner', 'publicKey') : undefined
			};

			const options = routeUtils.parsePaginationArguments(params, service.config.pageSize);

			return db.liquidityProviders(filters, options)
				.then(result => routeUtils.createSender('liquidityProviderEntry').sendPage(res, next)(result));
		});

        server.get('/liquidity_providers/:providerKey', (req, res, next) => {
			const providerKey = routeUtils.parseArgument(req.params, 'providerKey', 'publicKey');
			return db.getLiquidityProviderByProviderKey(providerKey)
				.then(routeUtils.createSender('liquidityProviderEntry').sendOne(req.params.accountId, res, next));
		});
    }
};