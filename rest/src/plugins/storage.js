/**
 *** Copyright 2021 ProximaX Limited. All rights reserved.
 *** Use of this source code is governed by the Apache 2.0
 *** license that can be found in the LICENSE file.
 **/

/** @module plugins/storage */
const StorageDb = require('./db/StorageDb');
const storageRoutes = require('./routes/storageRoutes');
const catapult = require('catapult-sdk');

const { BinaryParser } = catapult.parser;
const { address, networkInfo } = catapult.model;

/**
 * Creates a storage plugin.
 * @type {module:plugins/CatapultRestPlugin}
 */


 module.exports = {
	createDb: db => new StorageDb(db),

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
    },

	registerRoutes: (...args) => {
		serviceRoutes.register(...args);
	}
};