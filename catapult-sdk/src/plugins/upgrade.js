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
		builder.addTransactionSupport(EntityType.blockchainUpgrade, {
			upgradePeriod: 			{ type: ModelType.uint64, schemaName: 'blockchainUpgrade.upgradePeriod' },
			newBlockchainVersion:		{ type: ModelType.uint64, schemaName: 'blockchainUpgrade.newBlockchainVersion' },
		});

		builder.addSchema('blockchainUpgradeEntry', {
			blockchainUpgrade: { type: ModelType.object, schemaName: 'blockchainUpgrade.height' }
		});

		builder.addSchema('blockchainUpgrade.height', {
			height:					ModelType.uint64,
			blockChainVersion:		ModelType.uint64,
		});
	},

	registerCodecs: codecBuilder => {
		codecBuilder.addTransactionSupport(EntityType.blockchainUpgrade, {
			deserialize: parser => {
				const transaction = {};
				transaction.upgradePeriod = parser.uint64();
				transaction.newBlockchainVersion = parser.uint64();

				return transaction;
			},

			serialize: (transaction, serializer) => {
				serializer.writeUint64(transaction.upgradePeriod);
				serializer.writeUint64(transaction.newBlockchainVersion);
			}
		});
	}
};

module.exports = upgradePlugin;
