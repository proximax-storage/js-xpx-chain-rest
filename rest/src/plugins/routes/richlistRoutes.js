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

const restify = require('restify');
const routeUtils = require('../../routes/routeUtils');

module.exports = {
	register: (server, db) => {
		const rateLimit = restify.plugins.throttle({
			burst: 1,
			rate: 1,
			ip: true
		});

		const richListHandler = async (req, res, next) => {
			const mosaicId = routeUtils.parseArgument(req.params, 'mosaicId', 'mosaicId');
			const page = routeUtils.parseOptionalUintArgument(req.params, 'page');
			const pageSize = routeUtils.parseOptionalUintArgument(req.params, 'pageSize');

			return db.descendingAccountMosaicBalances(mosaicId, page, pageSize)
				.then(routeUtils.createSender('richlistEntry').sendArray(mosaicId, res, next));
		};

		// Due to wrapping of restify server with promiseAwareServer, chain handlers is not working.
		// This anonymous function chains rateLimit and richListHandler together.
		server.get('/mosaic/:mosaicId/richlist', (req, res, next) => {
				return rateLimit(req, res, err => {
					if (err)
						return next(err);
					else
						return richListHandler(req, res, next)
				})
			});
	}
};
