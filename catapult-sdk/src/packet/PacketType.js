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

/** @module packet/PacketType */

/**
 * Packet types.
 * @enum {numeric}
 */
const PacketType = {
	/** A challenge from a server to a client. */
	serverChallenge: 1,

	/** A challenge from a client to a server. */
	clientChallenge: 2,

	/** Blocks have been pushed by a peer. */
	pushBlock: 3,

	/** Transactions have been pushed by an api-node or a peer. */
	pushTransactions: 9,

	/** Partial aggregate transactions have been pushed by an api-node. */
	pushPartialTransactions: 500,

	/** Detached cosignatures have been pushed by an api-node. */
	pushDetachedCosignatures: 501,

	/** Node information has been requested by a peer. */
	nodeDiscoveryPullPing: 601,

	/** Peers information has been requested by a peer. */
	nodeDiscoveryPullPeers: 603,

	/** Node time information has been requested by a peer. */
	timeSyncNodeTime: 700
};

module.exports = PacketType;
