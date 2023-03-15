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

const zmq = require('zeromq');
const zmqUtils = require('./zmqUtils');

const createZmqSocket = (zmqConfig, logger) => {
	const zsocket = zmq.socket('sub');
	zmqUtils.prepareZsocket(zsocket, zmqConfig, logger);

	zsocket.connect(`tcp://${zmqConfig.host}:${zmqConfig.port}`);
	return zsocket;
};

const findSubscriptionInfo = (key, emitter, codec, channelDescriptors) => {
	const [topicCategory, topicParam] = key.split('/');
	if (!(topicCategory in channelDescriptors))
		throw new Error(`unknown topic category ${topicCategory}`);

	const descriptor = channelDescriptors[topicCategory];
	const handler = descriptor.handler(codec, data => { emitter.emit(key, data); });
	const filter = descriptor.filter(topicParam);
	return { filter, handler };
};

/**
 * Service for creating channel-specific zmq sockets.
 * @param {object} zmqConfig Configuration for configuring sockets.
 * @param {object} codec Codec used to deserialize zmq messages.
 * @param {object} channelDescriptors Registered message channel descriptors.
 * @param {object} channelResolvers Registered topic channel resolvers.
 * @param {object} logger Level-based logger object.
 * @returns {object} Newly created zmq connection service that is a stripped down EventEmitter.
 */
module.exports.createZmqConnectionService = (zmqConfig, codec, channelDescriptors, channelResolvers, logger) =>
	zmqUtils.createMultisocketEmitter(
		() => createZmqSocket(zmqConfig, logger),
		(key, emitter) => findSubscriptionInfo(key, emitter, codec, channelDescriptors),
		logger,
		function(topic, buffer, ...args) {
			let resolver = channelResolvers[topic.toString()];

			while (resolver) {
				topic = resolver(topic, buffer, ...args);
				resolver = channelResolvers[topic.toString()];
			}

			return topic;
		}
	);
