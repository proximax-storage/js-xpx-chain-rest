/**
 *** Copyright 2020 ProximaX Limited. All rights reserved.
 *** Use of this source code is governed by the Apache 2.0
 *** license that can be found in the LICENSE file.
 **/

/** @module plugins/committee */
const EntityType = require('../model/EntityType');
const ModelType = require('../model/ModelType');
const sizes = require('../modelBinary/sizes');

const constants = { sizes };

/**
 * Creates a committee plugin.
 * @type {module:plugins/CatapultPlugin}
 */
const committeePlugin = {
	registerSchema: builder => {
		builder.addTransactionSupport(EntityType.addHarvester, {
			harvesterKey: ModelType.binary
		});

		builder.addTransactionSupport(EntityType.removeHarvester, {
			harvesterKey: ModelType.binary
		});

		builder.addSchema('committeeEntry', {
			harvester: { type: ModelType.object, schemaName: 'harvester' }
		});

		builder.addSchema('harvester', {
			key:						ModelType.binary,
			address:					ModelType.binary,
			owner:						ModelType.binary,
			disabledHeight:				ModelType.uint64,
			lastSigningBlockHeight:		ModelType.uint64,
			effectiveBalance:			ModelType.uint64,
			canHarvest:					ModelType.boolean,
			activity:					ModelType.double,
			greed:						ModelType.double,
		});
	},

	registerCodecs: codecBuilder => {
		codecBuilder.addTransactionSupport(EntityType.addHarvester, {
			deserialize: parser => {
				const transaction = {};
				transaction.harvesterKey = parser.buffer(constants.sizes.signer);
				return transaction;
			},

			serialize: (transaction, serializer) => {
				serializer.writeBuffer(transaction.harvesterKey);
			}
		});

		codecBuilder.addTransactionSupport(EntityType.removeHarvester, {
			deserialize: parser => {
				const transaction = {};
				transaction.harvesterKey = parser.buffer(constants.sizes.signer);
				return transaction;
			},

			serialize: (transaction, serializer) => {
				serializer.writeBuffer(transaction.harvesterKey);
			}
		});
	}
};

module.exports = committeePlugin;
