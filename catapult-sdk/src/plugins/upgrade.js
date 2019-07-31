/**
 *** Copyright 2019 ProximaX Limited. All rights reserved.
 *** Use of this source code is governed by the Apache 2.0
 *** license that can be found in the LICENSE file.
 **/

/** @module plugins/upgrade */
const EntityType = require('../model/EntityType');
const ModelType = require('../model/ModelType');

/**
 * Creates a upgrade plugin.
 * @type {module:plugins/CatapultPlugin}
 */
const upgradePlugin = {
	registerSchema: builder => {
		builder.addTransactionSupport(EntityType.catapultUpgrade, {
			upgradePeriod: 			{ type: ModelType.uint64, schemaName: 'catapultUpgrade.upgradePeriod' },
			newCatapultVersion:		{ type: ModelType.uint64, schemaName: 'catapultUpgrade.newCatapultVersion' },
		});

		builder.addSchema('catapultUpgradeEntry', {
			catapultUpgrade: { type: ModelType.object, schemaName: 'catapultUpgrade.height' }
		});

		builder.addSchema('catapultUpgrade.height', {
			height:					ModelType.uint64,
			catapultVersion:		ModelType.uint64,
		});
	},

	registerCodecs: codecBuilder => {
		codecBuilder.addTransactionSupport(EntityType.catapultUpgrade, {
			deserialize: parser => {
				const transaction = {};
				transaction.upgradePeriod = parser.uint64();
				transaction.newCatapultVersion = parser.uint64();

				return transaction;
			},

			serialize: (transaction, serializer) => {
				serializer.writeUint64(transaction.upgradePeriod);
				serializer.writeUint64(transaction.newCatapultVersion);
			}
		});
	}
};

module.exports = upgradePlugin;
