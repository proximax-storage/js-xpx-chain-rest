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
			messageHash: 	{ type: ModelType.binary, schemaName: 'installMessage.messageHash' },
			sequence: 		{ type: ModelType.array,  schemaName: 'sequenceEntry' },
			certificate: 	{ type: ModelType.array,  schemaName: 'certificateEntry' },
		});

		builder.addSchema('sequenceEntry', {
			view:	{ type: ModelType.array, schemaName: 'viewEntry' }
		});

		builder.addSchema('viewEntry', {
			processId:			ModelType.binary,
			membershipChange:	ModelType.boolean
		});

		builder.addSchema('certificateEntry', {
			processId:				ModelType.binary,
			signature:				ModelType.binary,
		});
	},

	registerCodecs: codecBuilder => {
		codecBuilder.addTransactionSupport(EntityType.installMessage, {
			deserialize: parser => {
				const transaction = {};
				transaction.messageHash = parser.buffer(constants.sizes.hash256);
				transaction.payloadSize = parser.uint32();
				transaction.sequenceSize = parser.uint32();
				transaction.sequence = [];
				let sequenceCounter = transaction.sequenceSize;
				while (sequenceCounter-- > 0) {
					let viewsCount = parser.uint32();
					let views = [];
					while (viewsCount-- > 0) {
						const viewData = {};
						viewData.processId = parser.buffer(constants.sizes.signer);
						viewData.membershipChange = parser.uint8();
						views.push(viewData);
					}

					transaction.sequence.push(views);
				}

				transaction.certificateSize = parser.uint32();
				transaction.certificate = [];
				let certificateCounter = transaction.certificateSize;
				while (certificateCounter-- > 0) {
					const certificateData = {};
					certificateData.processId = parser.buffer(constants.sizes.signer);
					certificateData.signature = parser.buffer(constants.sizes.signature);
					transaction.certificate.push(certificateData);
				}

				return transaction;
			},

			serialize: (transaction, serializer) => {
				serializer.writeBuffer(transaction.messageHash);

				var payloadSize = 4;
				transaction.sequence.forEach(views => {
					payloadSize += 4 + views.length * (constants.sizes.signer + 1);
				});

				payloadSize += 4 + transaction.certificate.length * (constants.sizes.signer + constants.sizes.signature);

				serializer.writeUint32(payloadSize);
				serializer.writeUint32(transaction.sequence.length);
				transaction.sequence.forEach(views => {
					serializer.writeUint32(views.length);
					views.forEach(viewData => {
						serializer.writeBuffer(viewData.processId);
						serializer.writeUint8(viewData.membershipChange);
					})
				});

				serializer.writeUint32(transaction.certificate.length);
				transaction.certificate.forEach(c => {
					serializer.writeBuffer(c.processId);
					serializer.writeBuffer(c.signature);
				});
			}
		});
	}
};

module.exports = dbrbPlugin;
