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
const networkTime = require('../utils/networkTime');
const random = require('../utils/random');

const { uint64 } = catapult.utils;

const createTransaction = (options, type) => ({
	signature: new Uint8Array(catapult.constants.sizes.signature),
	signer: options.signerPublicKey,
	version: (options.networkId << 8) + 3,
	type,
	maxFee: uint64.fromUint(0),
	deadline: uint64.fromUint(networkTime.getNetworkTime() + (60 * 60 * 1000))
});

module.exports = {
	createRandomTransfer: (options, recipientSelector) => Object.assign(createTransaction(options, catapult.model.EntityType.transfer), {
		recipient: recipientSelector(),
		message: {
			type: 0,
			payload: Buffer.from(uint64.toHex(uint64.fromUint(options.transferId)), 'hex')
		},
		mosaics: [
			// Main token mosaic id = Xpx_id =  D423931BD268D1F4
			{ id: [0xD268D1F4, 0xD423931B],	amount: uint64.fromUint(random.uint32(1000000)) }
		]
	}),

	createAggregateTransactionV1: (options, transactions) => Object.assign(
		createTransaction(options, catapult.model.EntityType.aggregateCompleteV1),
		{ transactions }
	),
	createAggregateTransactionV2: (options, transactions) => Object.assign(
		createTransaction(options, catapult.model.EntityType.aggregateCompleteV2),
		{ transactions }
	)
};
