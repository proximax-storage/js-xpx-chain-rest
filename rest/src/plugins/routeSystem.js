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

const accountProperties = require('./accountProperties');
const aggregate = require('./aggregate');
const committee = require('./committee');
const config = require('./config');
const contract = require('./contract');
const empty = require('./empty');
const exchange = require('./exchange');
const lock = require('./lock');
const liquidityProvider = require('./liquidityProvider');
const MessageChannelBuilder = require('../connection/MessageChannelBuilder');
const metadata = require('./metadata');
const metadata_v2 = require('./metadata_v2');
const mosaic = require('./mosaic');
const multisig = require('./multisig');
const namespace = require('./namespace');
const operation = require('./operation');
const receipts = require('./receipts');
const richlist = require('./richlist');
const supercontract = require('./supercontract');
const upgrade = require('./upgrade');
const service = require('./service');
const lockfund = require('./lockfund');
const mosaicrestriction = require('./mosaicRestriction');
const accountrestriction = require('./accountRestriction');
const storage = require('./storage');

const plugins = {
	accountLink: empty, nodeKeyLink: empty, vrfKeyLink: empty, accountProperties, aggregate, exchange, committee, config, contract, lockfund, lock,liquidityProvider, metadata, metadata_v2, mosaic, multisig, namespace, operation, receipts, richlist, service, storage, supercontract, transfer: empty, upgrade, accountrestriction, mosaicrestriction
};

module.exports = {
	/**
	 * Gets the names of all supported plugins.
	 * @returns {array<string>} Names of all supported plugins.
	 */
	supportedPluginNames: () => Object.keys(plugins),

	/**
	 * Configures the server with the specified extensions.
	 * @param {array} pluginNames Additional extensions to use.
	 * @param {object} server Server.
	 * @param {module:db/CatapultDb} db Catapult database.
	 * @param {object} services Supporting services.
	 * @returns {array<module:plugins/CatapultRestPlugin~TransactionStateDescriptor>} Additional transaction states to register.
	 */
	configure: (pluginNames, server, db, services) => {
		const transactionStates = [];
		const messageChannelBuilder = new MessageChannelBuilder(services.config.websocket);
		(pluginNames || []).forEach(pluginName => {
			if (!plugins[pluginName])
				throw Error(`plugin '${pluginName}' not supported by route system`);

			const plugin = plugins[pluginName];
			plugin.registerTransactionStates(transactionStates);
			plugin.registerMessageChannels(messageChannelBuilder, services);
			plugin.registerRoutes(server, plugin.createDb(db), services);
		});

		return {
			transactionStates,
			messageChannelDescriptors: messageChannelBuilder.build(),
			messageChannelResolvers: messageChannelBuilder.buildResolvers()
		};
	}
};
