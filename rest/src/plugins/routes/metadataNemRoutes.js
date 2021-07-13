/*
 * Copyright (c) 2016-2019, Jaguar0625, gimre, BloodyRookie, Tech Bureau, Corp.
 * Copyright (c) 2020-present, Jaguar0625, gimre, BloodyRookie.
 * All rights reserved.
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

const routeUtils = require('../../routes/routeUtils');

module.exports = {
	register: (server, db, services) => {
		const metadataSender = routeUtils.createSender('metadata');

		server.get('/metadata_nem', (req, res, next) => {
			const { params } = req;
			const sourceAddress = params.sourceAddress ? routeUtils.parseArgument(params, 'sourceAddress', 'address') : undefined;
			const targetKey = params.targetKey ? routeUtils.parseArgument(params, 'targetKey', 'publicKey') : undefined;
			const scopedMetadataKey = params.scopedMetadataKey
				? routeUtils.parseArgument(params, 'scopedMetadataKey', 'uint64hex') : undefined;
			const targetId = params.targetId ? routeUtils.parseArgument(params, 'targetId', 'uint64hex') : undefined;
			const metadataType = params.metadataType ? routeUtils.parseArgument(params, 'metadataType', 'uint') : undefined;

			const options = routeUtils.parsePaginationArguments(params, services.config.pageSize, { id: 'objectId' });

			return db.metadata(sourceAddress, targetKey, scopedMetadataKey, targetId, metadataType, options)
				.then(result => metadataSender.sendPage(res, next)(result));
		});

		routeUtils.addGetPostDocumentRoutes(
			server,
			metadataSender,
			{ base: '/metadata_nem', singular: 'compositeHash', plural: 'compositeHashes' },
			params => db.metadatasByCompositeHash(params),
			routeUtils.namedParserMap.hash256
		);
	}
};
