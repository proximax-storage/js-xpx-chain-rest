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
const merkleUtils = require('../../routes/merkleUtils');

const { PacketType } = catapult.packet;

module.exports = {
    register: (server, db, services) => {
        const accountRestrictionsSender = routeUtils.createSender('accountRestrictions');

        server.get('/restrictions/account', (req, res, next) => {
            const { params } = req;
            const address = params.address ? routeUtils.parseArgument(params, 'address', 'address') : undefined;
            const options = routeUtils.parsePaginationArguments(params, services.config.pageSize, { id: 'objectId' });
            return db.accountRestrictions(address, options)
                .then(result => accountRestrictionsSender.sendPage(res, next)(result));
        });

        // GET ONE/MANY
        routeUtils.addGetPostDocumentRoutes(
            server,
            accountRestrictionsSender,
            { base: '/restrictions/account', singular: 'address', plural: 'addresses' },
            params => db.accountRestrictionsByAddresses(params),
            routeUtils.namedParserMap.address
        );

        // MERKLE
        server.get('/restrictions/account/:address/merkle', (req, res, next) => {
            const encodedAddress = routeUtils.parseArgument(req.params, 'address', 'address');
            const state = PacketType.accountRestrictionsStatePath;
            return merkleUtils.requestTree(services, state, encodedAddress).then(response => {
                res.send(response);
                next();
            });
        });
    }
};
