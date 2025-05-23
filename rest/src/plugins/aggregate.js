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

/** @module plugins/aggregate */
const aggregateRoutes = require('./routes/aggregateRoutes');
const catapult = require('catapult-sdk');

const { BinaryParser } = catapult.parser;

/**
 * Creates an aggregate plugin.
 * @type {module:plugins/CatapultRestPlugin}
 */
module.exports = {
	createDb: () => {},

	registerTransactionStates: states => {
		states.push({ priority: 2, friendlyName: 'partial', dbPostfix: 'Partial', routePostfix: '/partial' });
	},

	registerMessageChannels: builder => {
		builder.add('partialAdded', 'p', 'transaction');
		builder.add('partialRemoved', 'q', 'transactionHash');
		builder.add('cosignature', 'c', (codec, emit) => (topic, buffer) => {
			const address = topic.slice(1);
			const parser = new BinaryParser();
			parser.push(buffer);

			const signer = parser.buffer(catapult.constants.sizes.signer);
			const signature = parser.buffer(catapult.constants.sizes.signature);
			const parentHash = parser.buffer(catapult.constants.sizes.hash256);

			const meta = { channelName: 'cosignature', address };

			emit({ type: 'aggregate.cosignatureWithMetadata', payload: { signer, signature, parentHash, meta } });
		});
	},

	registerRoutes: (...args) => {
		aggregateRoutes.register(...args);
	}
};
