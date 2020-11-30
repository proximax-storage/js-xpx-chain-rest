/**
 *** Copyright 2019 ProximaX Limited. All rights reserved.
 *** Use of this source code is governed by the Apache 2.0
 *** license that can be found in the LICENSE file.
 **/

/** @module plugins/service */
const ServiceDb = require('./db/ServiceDb');
const serviceRoutes = require('./routes/serviceRoutes');
const catapult = require('catapult-sdk');

const { BinaryParser } = catapult.parser;
const { address, networkInfo } = catapult.model;

/**
 * Creates a service plugin.
 * @type {module:plugins/CatapultRestPlugin}
 */

const supportedReceipt = {
	driveState: 0x615B,
};

module.exports = {
	createDb: db => new ServiceDb(db),

	registerTransactionStates: () => {},

	registerMessageChannels: (builder, services) => {
		const topic = 'd';
		builder.addResolver(supportedReceipt.driveState, function (receiptTopic, buffer) {
			const parser = new BinaryParser();
			parser.push(buffer);

			const size = parser.uint32();
			const version = parser.uint32();
			const type = parser.uint16();
			const driveKey = parser.buffer(catapult.constants.sizes.signer);
			const driveAddress = address.publicKeyToAddress(driveKey, networkInfo.networks[services.config.network.name].id);

			return Buffer.concat([Buffer.of(topic.charCodeAt(0)), Buffer.from(driveAddress)]);
		});

		builder.add('driveState', topic, (codec, emit) => (topic, buffer) => {
			const parser = new BinaryParser();
			parser.push(buffer);

			const size = parser.uint32();
			const version = parser.uint32();
			const type = parser.uint16();
			const driveKey = parser.buffer(catapult.constants.sizes.signer);
			const state = parser.uint8();
			const driveAddress = address.publicKeyToAddress(driveKey, networkInfo.networks[services.config.network.name].id);

			const meta = { channelName: 'driveState', address: driveAddress };

			emit({ type: 'service.driveStateWithMetadata', payload: { driveKey, state, meta } });
		});
	},

	registerRoutes: (...args) => {
		serviceRoutes.register(...args);
	}
};
