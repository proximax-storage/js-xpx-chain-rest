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
const { nodeInfoCodec, nodeInfosCodec } = require('../sockets/nodeInfoCodec');
const nodeTimeCodec = require('../sockets/nodeTimeCodec');
const routeResultTypes = require('./routeResultTypes');

const packetHeader = catapult.packet.header;
const { PacketType } = catapult.packet;

const { BinaryParser } = catapult.parser;

const parsePacket = (packet, codec) => {
	const binaryParser = new BinaryParser();
	binaryParser.push(packet.payload);
	return codec.deserialize(binaryParser);
};

const buildResponse = (packet, codec, resultType) => {
	return { payload: parsePacket(packet, codec), type: resultType, formatter: 'ws' };
};

module.exports = {
	register: (server, db, services) => {
		const { connections } = services;
		const { timeout } = services.config.apiNode;

		server.get('/node/info', (req, res, next) => {
			const packetBuffer = packetHeader.createBuffer(PacketType.nodeDiscoveryPullPing, packetHeader.size);
			return connections.singleUse()
				.then(connection => connection.pushPull(packetBuffer, timeout))
				.then(packet => {
					res.send(buildResponse(packet, nodeInfoCodec, routeResultTypes.nodeInfo));
					next();
				});
		});

		server.get('/node/time', (req, res, next) => {
			const packetBuffer = packetHeader.createBuffer(PacketType.timeSyncNodeTime, packetHeader.size);
			return connections.singleUse()
				.then(connection => connection.pushPull(packetBuffer, timeout))
				.then(packet => {
					res.send(buildResponse(packet, nodeTimeCodec, routeResultTypes.nodeTime));
					next();
				});
		});

		server.get('/node/unlockedaccount', (req, res, next) => {
			const { convert } = catapult.utils;
			const headerBuffer = packetHeader.createBuffer(
				PacketType.unlockedAccount,
				packetHeader.size
			);
			const packetBuffer = headerBuffer;
			return connections
				.singleUse()
				.then(connection => connection.pushPull(packetBuffer, timeout))
				.then(packet => {
					const unlockedKeys = convert
						.uint8ToHex(packet.payload)
						.match(/.{1,64}/g);
					res.send(!unlockedKeys ? [] : unlockedKeys.map(x => ({PublicKey : x})));
					next();
				});
		});

		server.get('/node/peers', (req, res, next) => {
			const packetNodeInfosBuffer = packetHeader.createBuffer(PacketType.nodeDiscoveryPullPeers, packetHeader.size);
			const packetCurrentNodeBuffer = packetHeader.createBuffer(PacketType.nodeDiscoveryPullPing, packetHeader.size);
			return Promise.all([
					connections.singleUse().then(connection => connection.pushPull(packetNodeInfosBuffer, timeout)),
					connections.singleUse().then(connection => connection.pushPull(packetCurrentNodeBuffer, timeout))
				])
				.then(packets => {
					// This response doesn't contains info about self node, so we will request it in separate request
					const nodeInfos = parsePacket(packets[0], nodeInfosCodec);
					const currentNode = parsePacket(packets[1], nodeInfoCodec);

					let i = 0;
					for (; i < nodeInfos.length; ++i) {
						// Also current node thinks that rest server - also is peer node with empty fields, so let's
						// replace empty node info by current node's info
						if (nodeInfos[i].networkIdentifier == 0) {
							break;
						}
					}
					nodeInfos[i] = currentNode;

					res.send({ payload: nodeInfos, type: routeResultTypes.nodeInfo, formatter: 'ws' });
					next();
				});
		});
	}
};
