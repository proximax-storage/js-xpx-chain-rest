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

/** @module plugins/receipts */
const ModelType = require('../model/ModelType');

const ReceiptType = {
	0x1143: 'receipts.balanceTransfer',
	0x124E: 'receipts.balanceTransfer',
	0x414E: 'receipts.artifactExpiry',
	0x2143: 'receipts.balanceChange',
	0x3143: 'receipts.balanceChange',
	0x4143: 'receipts.artifactExpiry',
	0x5143: 'receipts.inflation',
	0x8143: 'receipts.signerImportance',
	0x8243: 'receipts.globalStateTracking',
	0x8162: 'receipts.totalStaked',
	0x3148: 'receipts.lockHashCreated'
};

/**
 * Creates a receipts plugin.
 * @type {module:plugins/CatapultPlugin}
 */
const receiptsPlugin = {
	getBasicReceiptType: type => ReceiptType[type] || 'receipts.unknown',
	registerSchema: builder => {
		builder.addSchema('receipts', {
			transactionStatements: { type: ModelType.array, schemaName: 'receipts.transactionStatement' },
			addressResolutionStatements: { type: ModelType.array, schemaName: 'receipts.addressResolutionStatement' },
			mosaicResolutionStatements: { type: ModelType.array, schemaName: 'receipts.mosaicResolutionStatement' },
			publicKeyStatements: { type: ModelType.array, schemaName: 'receipts.publicKeyStatement' },
			blockchainStateStatements: { type: ModelType.array, schemaName: 'receipts.blockchainStateStatement' }
		});

		builder.addSchema('receipts.addressResolutionStatement', {
			height: ModelType.uint64,
			unresolved: ModelType.binary,
			resolutionEntries: { type: ModelType.array, schemaName: 'receipts.entry.address' }
		});

		builder.addSchema('receipts.mosaicResolutionStatement', {
			height: ModelType.uint64,
			unresolved: ModelType.uint64,
			resolutionEntries: { type: ModelType.array, schemaName: 'receipts.entry.mosaic' }
		});

		builder.addSchema('receipts.transactionStatement', {
			height: ModelType.uint64,
			receipts: { type: ModelType.array, schemaName: entity => receiptsPlugin.getBasicReceiptType(entity.type) }
		});

		builder.addSchema('receipts.publicKeyStatement', {
			height: ModelType.uint64,
			receipts: { type: ModelType.array, schemaName: entity => receiptsPlugin.getBasicReceiptType(entity.type) }
		});

		builder.addSchema('receipts.blockchainStateStatement', {
			height: ModelType.uint64,
			receipts: { type: ModelType.array, schemaName: entity => receiptsPlugin.getBasicReceiptType(entity.type) }
		});

		builder.addSchema('receipts.anonymousReceipt', {
			meta: {type: ModelType.object, schemaName: 'receipts.anonymousReceiptMetadata' },
			data: ModelType.binary
		});

		builder.addSchema('receipts.anonymousReceiptMetadata', {
			height: ModelType.uint64,
			type: ModelType.uint16,
			version: ModelType.uint32,
			channelName: ModelType.string,
			handle: ModelType.binary,
			size: ModelType.uint32
		});

		builder.addSchema('receipts.entry.address', {
			resolved: ModelType.binary
		});

		builder.addSchema('receipts.entry.mosaic', {
			resolved: ModelType.uint64
		});

		builder.addSchema('receipts.balanceChange', {
			type: ModelType.uint16,
			version: ModelType.uint32,
			account: ModelType.binary,
			mosaicId: ModelType.uint64,
			amount: ModelType.uint64
		});

		builder.addSchema('receipts.balanceTransfer', {
			type: ModelType.uint16,
			version: ModelType.uint32,
			sender: ModelType.binary,
			recipient: ModelType.binary,
			mosaicId: ModelType.uint64,
			amount: ModelType.uint64
		});

		builder.addSchema('receipts.artifactExpiry', {
			type: ModelType.uint16,
			version: ModelType.uint32,
			artifactId: ModelType.uint64
		});

		builder.addSchema('receipts.inflation', {
			type: ModelType.uint16,
			version: ModelType.uint32,
			mosaicId: ModelType.uint64,
			amount: ModelType.uint64
		});

		builder.addSchema('receipts.signerImportance', {
			type: ModelType.uint16,
			version: ModelType.uint32,
			amount: ModelType.uint64,
			lockedAmount: ModelType.uint64
		});

		builder.addSchema('receipts.totalStaked', {
			type: ModelType.uint16,
			version: ModelType.uint32,
			amount: ModelType.uint64,
		});

		builder.addSchema('receipts.globalStateChange', {
			type: ModelType.uint16,
			version: ModelType.uint32,
			flags: ModelType.uint64,
		});

		builder.addSchema('receipts.lockHashCreated', {
			type: ModelType.uint16,
			version: ModelType.uint32,
			account: ModelType.binary,
			mosaicId: ModelType.uint64,
			amount: ModelType.uint64
		});

		builder.addSchema('receipts.unknown', {
			type: ModelType.uint16,
			version: ModelType.uint32,
		});
	},

	registerCodecs: () => {}
};

module.exports = receiptsPlugin;
