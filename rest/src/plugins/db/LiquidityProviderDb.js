/**
 *** Copyright 2022 ProximaX Limited. All rights reserved.
 *** Use of this source code is governed by the Apache 2.0
 *** license that can be found in the LICENSE file.
 * */

class LiquidityProviderDb {
    /**
	 * Creates LiquidityProviderDb around CatapultDb.
	 * @param {module:db/CatapultDb} db Catapult db instance.
	 */
	constructor(db) {
		this.catapultDb = db;
	}

	// region liquidity provider retrieval

    /**
	 * Retrieves the liquidity provider entry by provider key.
	 * @param {object} providerKey Liquidity provider key.
	 * @returns {Promise.<object>} Liquidity provider info.
	 */
	 getLiquidityProviderByProviderKey(providerKey) {
		const buffer = Buffer.from(providerKey);
		const fieldName = "liquidityProvider.providerKey";
		return this.catapultDb.queryDocuments('liquidityProviders', { [fieldName]: buffer });
	}

    /**
	* Retrieves filtered and paginated liquidity providers.
	* @param {object} filters Filters to be applied: 'providerKey', 'owner'
	* @param {object} options Options for ordering and pagination. Must contain the `sortField`, `sortDirection`,
	* `pageSize`.
	* and `pageNumber`.
    * @returns {Promise.<object>} Liquidity providers page.
	*/
    liquidityProviders(filters, options) {
		const buildConditions = () => {
			const conditions = [];
			if (filters.mosaicId !== undefined) {
				const buffer = Buffer.from(filters.mosaicId);
				conditions.push({'liquidityProvider.mosaicId': buffer});
			}

			if (filters.slashingAccount !== undefined) {
				const buffer = Buffer.from(filters.slashingAccount);
				conditions.push({'liquidityProvider.slashingAccount': buffer});
			}

			if (filters.owner !== undefined) {
				const buffer = Buffer.from(filters.owner);
				conditions.push({'liquidityProvider.owner': buffer});
			}

			return conditions;
		}

		const sortConditions = {$sort: {[options.sortField]: options.sortDirection}};
		const conditions = buildConditions();

        return this.catapultDb.queryPagedDocuments_2(conditions, [], sortConditions, "liquidityProviders", options);
    }

	// endregion

}

module.exports = LiquidityProviderDb;
