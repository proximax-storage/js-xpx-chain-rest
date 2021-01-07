/**
 *** Copyright 2020 ProximaX Limited. All rights reserved.
 *** Use of this source code is governed by the Apache 2.0
 *** license that can be found in the LICENSE file.
 **/

/** @module plugins/committee */
const EntityType = require('../model/EntityType');
const ModelType = require('../model/ModelType');

/**
 * Creates a committee plugin.
 * @type {module:plugins/CatapultPlugin}
 */
const committeePlugin = {
	registerSchema: builder => {
		builder.addTransactionSupport(EntityType.addHarvester, {});
		builder.addTransactionSupport(EntityType.removeHarvester, {});

		builder.addSchema('committeeEntry', {
			harvester: { type: ModelType.object, schemaName: 'harvester' }
		});

		builder.addSchema('harvester', {
			key:						ModelType.binary,
			lastSigningBlockHeight:		ModelType.uint64,
			effectiveBalance:			ModelType.uint64,
			canHarvest:					ModelType.bool,
			activity:					ModelType.double,
			greed:						ModelType.double,
		});
	},

	registerCodecs: codecBuilder => {
		codecBuilder.addTransactionSupport(EntityType.addHarvester, {
			deserialize: parser => {
				return {};
			},

			serialize: (transaction, serializer) => {}
		});

		codecBuilder.addTransactionSupport(EntityType.removeHarvester, {
			deserialize: parser => {
				return {};
			},

			serialize: (transaction, serializer) => {}
		});
	}
};

module.exports = committeePlugin;
