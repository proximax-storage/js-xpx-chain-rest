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

/** @module sockets/nodeInfoCodec */
const catapult = require('catapult-sdk');

const { sizes } = catapult.constants;

const nodeInfoCodec = {
	/**
	 * Parses a node info.
	 * @param {object} parser Parser.
	 * @returns {object} Parsed node info.
	 */
	deserialize: parser => {
		const nodeInfo = {};
		parser.uint32(); // Node size
		nodeInfo.publicKey = parser.buffer(sizes.signer);
		nodeInfo.port = parser.uint16();
		nodeInfo.networkIdentifier = parser.uint8();
		nodeInfo.version = parser.uint32();
		nodeInfo.roles = parser.uint32();
		const hostSize = parser.uint8();
		const friendlyNameSize = parser.uint8();
		nodeInfo.host = 0 === hostSize ? Buffer.alloc(0) : parser.buffer(hostSize);
		nodeInfo.friendlyName = 0 === friendlyNameSize ? Buffer.alloc(0) : parser.buffer(friendlyNameSize);
		return nodeInfo;
	}
};

const nodeInfosCodec = {
	/**
	 * Parses a node infos.
	 * @param {object} parser Parser.
	 * @returns {object} Parsed node infos.
	 */
	deserialize: parser => {
		const nodeInfos = [];

		while (parser.numUnprocessedBytes() > 0) {
			nodeInfos.push(nodeInfoCodec.deserialize(parser));
		}

		return nodeInfos;
	}
};

module.exports = {
	nodeInfoCodec: nodeInfoCodec,
	nodeInfosCodec: nodeInfosCodec
};
