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

const { BinaryParser } = catapult.parser;
const { uint64 } = catapult.utils;

const parserFromData = binaryData => {
	const parser = new catapult.parser.BinaryParser();
	parser.push(binaryData);
	return parser;
};

const createBlockDescriptor = () => ({
	filter: topicParam => {
		if (topicParam)
			throw new Error('unexpected param to block subscription');

		return Buffer.of(0x49, 0x6A, 0xCA, 0x80, 0xE4, 0xD8, 0xF2, 0x9F);
	},

	handler: (codec, emit) => (topic, binaryBlock, hash, generationHash) => {
		const address = topic.slice(1);
		const block = codec.deserialize(parserFromData(binaryBlock), { skipBlockTransactions: true });
		emit({ type: 'blockHeaderWithMetadata', payload: { block, meta: { hash, generationHash, channelName: 'block', address } } });
	}
});

const getTopicIdentifierBinaryBuffer = (topicIdentifier) => {
	if(topicIdentifier.length == 4) return catapult.utils.convert.hexToUint8(topicIdentifier);
	else return catapult.model.address.stringToAddress(topicIdentifier);
}

const getTopicIdentifierEntityTypeBinaryBuffer = (topicIdentifier) => {
	if (topicIdentifier.length != 4)
		throw new Error('unexpected param does not match a receipt type hex designation');
	return catapult.utils.convert.hexToUint8(topicIdentifier);
}
const receiptResolver = (markerByte) => (topic, heightBuffer, buffer) => {
	const parser = new BinaryParser();
	parser.push(heightBuffer);
	parser.push(buffer);
	const height = parser.uint64();
	const size = parser.uint32();
	const version = parser.uint32();

	return Buffer.concat([Buffer.of(markerByte), Buffer.of(parser.uint16())]);
}
const createPolicyBasedFilter = (markerByte, emptyHandler, processor) => topicParam => {
	if (!topicParam)
		return emptyHandler(markerByte);

	return Buffer.concat([Buffer.of(markerByte), Buffer.from(processor(topicParam))]);
};

const handlers = {
	transaction: channelName => (codec, emit) => (topic, binaryTransaction, hash, merkleComponentHash, height) => {
		const address = topic.slice(1);
		const transaction = codec.deserialize(parserFromData(binaryTransaction));
		const meta = {
			hash, merkleComponentHash, height: uint64.fromBytes(height), channelName, address
		};
		emit({ type: 'transactionWithMetadata', payload: { transaction, meta } });
	},

	transactionHash: channelName => (codec, emit) => (topic, hash) => {
		const address = topic.slice(1);
		emit({ type: 'transactionWithMetadata', payload: { meta: { hash, channelName, address } } });
	},
};

/**
 * Builder for creating message channel information.
 */
class MessageChannelBuilder {
	/**
	 * Creates a builder.
	 * @param {object} config Message queue configuration.
	 */
	constructor(config) {
		this.descriptors = {};
		this.resolvers = {};
		this.channelMarkers = {};

		const emptyAddressHandler = config && config.allowOptionalAddress
			? markerByte => Buffer.of(markerByte)
			: () => { throw new Error('address or entity type param missing from address subscription'); };

		const emptyEntityTypeHandler = config && config.allowOptionalType
			? markerByte => Buffer.of(markerByte)
			: () => { throw new Error('entity type param missing from subscription'); };

		this.createPolicyFilter = markerChar => createPolicyBasedFilter(markerChar.charCodeAt(0), emptyAddressHandler, getTopicIdentifierBinaryBuffer);

		this.createReceiptFilter = markerChar => createPolicyBasedFilter(markerChar.charCodeAt(0), emptyEntityTypeHandler, getTopicIdentifierEntityTypeBinaryBuffer);

		// add basic descriptors
		this.descriptors.block = createBlockDescriptor();
		this.add('confirmedAdded', 'a', 'transaction');
		this.add('unconfirmedAdded', 'u', 'transaction');
		this.add('unconfirmedRemoved', 'r', 'transactionHash');
		this.addResolver('b', receiptResolver('b'.charCodeAt(0)));
		this.addResolver('c', receiptResolver('c'.charCodeAt(0)));
		this.descriptors.status = {
			filter: this.createPolicyFilter('s'),
			handler: (codec, emit) => (topic, buffer) => {
				const address = topic.slice(1);
				const parser = new BinaryParser();
				parser.push(buffer);

				const hash = parser.buffer(catapult.constants.sizes.hash256);
				const status = parser.uint32();
				const deadline = parser.uint64();

				const meta = { channelName: 'status', address };
				emit({ type: 'transactionStatus', payload: { hash, status, deadline, meta } });
			}
		};

		this.descriptors.stateStatement = {
			filter: this.createReceiptFilter('c'),
			handler: (codec, emit) => (topic, receipt) => {
				const parser = new BinaryParser();
				parser.push(buffer);

				const height = parser.uint64();
				const size = parser.uint32();
				const version = parser.uint32();
				const type = parser.uint16();
				const data = parser.buffer(size-4-4-2);
				emit({ type: 'receipts.anonymousReceipt', payload: { meta: { height, size, version, type}, data } });
			}
		};

		this.descriptors.publicKeyStatement = {
			filter: this.createReceiptFilter('b'),
			handler: (codec, emit) => (topic, receipt) => {
				const parser = new BinaryParser();
				parser.push(buffer);

				const height = parser.uint64();
				const size = parser.uint32();
				const version = parser.uint32();
				const type = parser.uint16();
				const data = parser.buffer(size-4-4-2);
				emit({ type: 'receipts.anonymousReceipt', payload: { meta: { height, size, version, type}, data } });
			}
		};
	}

	/**
	 * Adds support for a new channel.
	 * @param {string} name Channel name.
	 * @param {string} markerChar Channel marker character.
	 * @param {function} handler Channel data handler.
	 * @param {function} filter before handle.
	 */
	add(name, markerChar, handler) {
		if (name in this.descriptors)
			throw Error(`'${name}' channel has already been registered`);

		if (1 !== markerChar.length)
			throw Error('channel marker must be single character');

		if (markerChar in this.channelMarkers)
			throw Error(`'${markerChar}' channel marker has already been registered`);

		let channelHandler = handler;
		if ('string' === typeof handler) {
			if (!(handler in handlers))
				throw Error(`cannot register channel '${name}' with unknown handler '${handler}'`);

			channelHandler = handlers[handler](name);
		}

		this.descriptors[name] = { filter: this.createPolicyFilter(markerChar), handler: channelHandler };
		this.channelMarkers[markerChar] = 1;
	}

	/**
	 * Adds resolver for a new topic.
	 * @param {string} topic which topic we are resolving.
	 * @param {function} resolver Channel data resolver.
	 */
	addResolver(topic, resolver) {
		if (topic in this.resolvers)
			throw Error(`'${topic}' resolver has already been registered`);

		this.resolvers[topic.toString()] = resolver
	}

	/**
	 * Builds and returns an object composed of all configured channel information.
	 * @returns {object} An object composed of all configured channel information.
	 */
	build() {
		return this.descriptors;
	}

	/**
	 * Builds and returns an object composed of all configured channel resolvers.
	 * @returns {object} An object composed of all configured channel resolvers.
	 */
	buildResolvers() {
		return this.resolvers;
	}
}

module.exports = MessageChannelBuilder;
