/**
 *** Copyright 2023 ProximaX Limited. All rights reserved.
 *** Use of this source code is governed by the Apache 2.0
 *** license that can be found in the LICENSE file.
 **/

/** @module plugins/dbrb */
const EntityType = require('../model/EntityType');
const ModelType = require('../model/ModelType');
const sizes = require('../modelBinary/sizes');

const constants = { sizes };

/**
 * Creates a dbrb plugin.
 * @type {module:plugins/CatapultPlugin}
 */
const dbrbPlugin = {
	registerSchema: builder => {
		builder.addTransactionSupport(EntityType.installMessage, {
			messageHash: 			{ type: ModelType.binary, schemaName: 'installMessage.messageHash' },
			viewsCount: 			{ type: ModelType.uint32, schemaName: 'installMessage.viewsCount' },
			mostRecentViewSize: 	{ type: ModelType.uint32, schemaName: 'installMessage.mostRecentViewSize' },
			signaturesCount: 		{ type: ModelType.uint32, schemaName: 'installMessage.signaturesCount' },
			viewSizes: 				{ type: ModelType.array,  schemaName:  ModelType.uint16 },
			viewProcessIds: 		{ type: ModelType.array,  schemaName:  ModelType.binary },
			membershipChanges: 		{ type: ModelType.array,  schemaName:  ModelType.boolean },
			signaturesProcessIds: 	{ type: ModelType.array,  schemaName:  ModelType.binary },
			signatures: 			{ type: ModelType.array,  schemaName:  ModelType.binary },
		});
	},

	registerCodecs: codecBuilder => {
		codecBuilder.addTransactionSupport(EntityType.installMessage, {
			deserialize: parser => {
				const transaction = {};
				transaction.messageHash = parser.buffer(constants.sizes.hash256);
				transaction.viewsCount = parser.uint32();
				transaction.mostRecentViewSize = parser.uint32();
				transaction.signaturesCount = parser.uint32();

				transaction.viewSizes = [];
				let count = transaction.viewsCount;
				while (count-- > 0) {
					transaction.viewSizes.push(parser.uint16());
				}

				transaction.viewProcessIds = [];
				count = transaction.mostRecentViewSize;
				while (count-- > 0) {
					transaction.viewProcessIds.push(parser.buffer(constants.sizes.signer));
				}

				transaction.membershipChanges = [];
				count = transaction.mostRecentViewSize;
				while (count-- > 0) {
					transaction.membershipChanges.push(parser.uint8());
				}

				transaction.signaturesProcessIds = [];
				count = transaction.signaturesCount;
				while (count-- > 0) {
					transaction.signaturesProcessIds.push(parser.buffer(constants.sizes.signer));
				}

				transaction.signatures = [];
				count = transaction.signaturesCount;
				while (count-- > 0) {
					transaction.signatures.push(parser.buffer(constants.sizes.signature));
				}

				return transaction;
			},

			serialize: (transaction, serializer) => {
				serializer.writeBuffer(transaction.messageHash);
				serializer.writeUint32(transaction.viewsCount);
				serializer.writeUint32(transaction.mostRecentViewSize);
				serializer.writeUint32(transaction.signaturesCount);

				transaction.viewSizes.forEach(viewSize => {
					serializer.writeUint16(viewSize);
				});

				transaction.viewProcessIds.forEach(id => {
					serializer.writeBuffer(id);
				});

				transaction.membershipChanges.forEach(isMembershipChange => {
					serializer.writeUint8(isMembershipChange);
				});

				transaction.signaturesProcessIds.forEach(id => {
					serializer.writeBuffer(id);
				});

				transaction.signatures.forEach(signature => {
					serializer.writeBuffer(signature);
				});
			}
		});
	}
};

module.exports = dbrbPlugin;
