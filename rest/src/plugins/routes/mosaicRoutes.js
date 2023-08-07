/*
 * Copyright (c) 2016-present,
 * Jaguar0625, gimre, BloodyRookie, Tech Bureau, Corp. All rights reserved.
 *
 * This file is part of Catapult.
 *
 * Catapult is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Lesser General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * Catapult is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License
 * along with Catapult.  If not, see <http://www.gnu.org/licenses/>.
 */

const catapult = require('catapult-sdk');
const routeUtils = require('../../routes/routeUtils');
const LevyDb = require('../db/LevyDb');
const errors = require('../../server/errors');

const {uint64} = catapult.utils;

module.exports = {
    register: (server, db, services) => {
        const mosaicSender = routeUtils.createSender('mosaicDescriptor');

        routeUtils.addGetPostDocumentRoutes(
            server,
            mosaicSender,
            { base: '/mosaic', singular: 'mosaicId', plural: 'mosaicIds' },
            params => db.mosaicsByIds(params),
            uint64.fromHex
        );

        server.get(`/mosaic/:mosaicId/levy`, (req, res, next) => {
            const levyDb = new LevyDb(db.getCatapultDb());
            const mosaicId = routeUtils.parseArgument(req.params, 'mosaicId', 'mosaicId');

            return levyDb.levyByMosaicId(mosaicId)
                .then(routeUtils.createSender('mosaicLevy').sendOne(req.params.mosaicId, res, next));
        });

        server.get(`/mosaics`, (req, res, next) => {
            const { params } = req;

            if (params.holding !== undefined && !params.ownerPubKey) {
				throw errors.createInvalidArgumentError(
					'can\'t filter by holding when `ownerPubKey` is not provided'
				);
			}

            const filters = {
                ownerPubKey: params.ownerPubKey ? routeUtils.parseArgument(params, 'ownerPubKey', 'publicKey') : undefined,
                supply: params.supply ? routeUtils.parseArgument(params, 'supply', 'uint') : undefined,
                mutable: params.mutable ? routeUtils.parseArgument(params, 'mutable', 'boolean') : undefined,
                transferable: params.transferable ? routeUtils.parseArgument(params, 'transferable', 'boolean') : undefined,
                holding: params.holding !== undefined ? routeUtils.parseArgument(params, 'holding', 'boolean') : undefined,
            };

            const options = routeUtils.parsePaginationArguments(params, services.config.pageSize, { id: 'objectId' });

            return db.mosaics(filters, options)
                .then(result => {
                    routeUtils.createSender("mosaicDescriptor").sendPage(res, next)(result)
                });
        });
    }
};
