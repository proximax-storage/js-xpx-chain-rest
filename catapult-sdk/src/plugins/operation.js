/**
 *** Copyright 2020 ProximaX Limited. All rights reserved.
 *** Use of this source code is governed by the Apache 2.0
 *** license that can be found in the LICENSE file.
 **/

/** @module plugins/mosaic */
const EntityType = require('../model/EntityType');
const ModelType = require('../model/ModelType');
const sizes = require('../modelBinary/sizes');

const constants = { sizes };

/**
 * Creates a operation plugin.
 * @type {module:plugins/CatapultPlugin}
 */
const operationPlugin = {
	registerSchema: builder => {
		builder.addTransactionSupport(EntityType.operationIdentify, {
			operationToken:		ModelType.binary,
		});

		builder.addTransactionSupport(EntityType.endOperation, {
			operationToken: 	ModelType.binary,
			mosaics: 			{ type: ModelType.array, schemaName: 'execute.mosaic' }
		});

		builder.addSchema('operationEntry', {
			operation: { type: ModelType.object, schemaName: 'operation' }
		});

		builder.addSchema('operation.mosaic', {
			id: 		ModelType.uint64,
			amount: 	ModelType.uint64,
		});

		builder.addSchema('operation', {
			account:				ModelType.binary,
			accountAddress:			ModelType.binary,
			height:					ModelType.uint64,
			mosaics: 				{ type: ModelType.array, schemaName: 'operation.mosaic' },
			token:					ModelType.binary,
			result:					ModelType.uint16,
			executors: 				{ type: ModelType.array, schemaName: ModelType.binary },
			transactionHashes: 		{ type: ModelType.array, schemaName: ModelType.binary },
		});
	},

	registerCodecs: codecBuilder => {
		codecBuilder.addTransactionSupport(EntityType.operationIdentify, {
			deserialize: parser => {
				const transaction = {};

				transaction.operationToken = parser.buffer(constants.sizes.hash256);

				return transaction;
			},

			serialize: (transaction, serializer) => {
				serializer.writeBuffer(transaction.operationToken);
			}
		});

		codecBuilder.addTransactionSupport(EntityType.endOperation, {
			deserialize: parser => {
				const transaction = {};

				transaction.mosaicsCount = parser.uint8();
				transaction.operationToken = parser.buffer(constants.sizes.hash256);
				transaction.result = parser.uint16();
				transaction.mosaics = [];

				let tmp = transaction.mosaicsCount;
				while (tmp--) {
					const mosaic = {};
					mosaic.id = parser.uint64();
					mosaic.amount = parser.uint64();
					transaction.mosaics.push(mosaic);
				}

				return transaction;
			},

			serialize: (transaction, serializer) => {
				serializer.writeUint8(transaction.mosaics.length);
				serializer.writeBuffer(transaction.operationToken);

				for (let i = 0; i < transaction.mosaicsCount; ++i) {
					const mosaic = transaction.mosaics[i];
					serializer.writeUint64(mosaic.id);
					serializer.writeUint64(mosaic.amount);
				}

				serializer.writeUint16(transaction.result);
			}
		});
	}
};

module.exports = operationPlugin;
