/**
 *** Copyright 2022 ProximaX Limited. All rights reserved.
 *** Use of this source code is governed by the Apache 2.0
 *** license that can be found in the LICENSE file.
 * */

const MongoDb = require('mongodb');
const AccountType = require('../AccountType');
const uint64 = require('../../../../catapult-sdk/src/utils/uint64');

const { Long } = MongoDb;

const deleteExpiredSdaOfferBalancesFromObject = dbObject => {
    if (dbObject && dbObject.exchange) delete dbObject.exchangesda.expiredSdaOfferBalances;

    return dbObject;
};

const deleteExpiredSdaOfferBalancesFromArray = dbObjects => {
    dbObjects.forEach(dbObject => {
        deleteExpiredSdaOfferBalancesFromObject(dbObject);
    });

    return dbObjects;
};

const extractSdaOfferBalances = (dbObjects, fieldName, fieldId, fieldAmountType, mosaicIds, ordering) => {
    const result = [];
    dbObjects.forEach(dbObject => {
        const exchangeSdaInfo = dbObject.exchangesda;
        const offers = exchangeSdaInfo[fieldName];

        mosaicIds.forEach(mosaicId => {
            offers.forEach(offer => {
                if (mosaicId.toString() === eval("offer."+fieldId+".toString()")) {
                    offer.owner = exchangeSdaInfo.owner;

                    result.push(offer);
                }
            });
        });
    });

    result.sort((a, b) => {
        return (`${a}.${fieldAmountType}` > `${b}.${fieldAmountType}`) ? ordering : ((`${a}.${fieldAmountType}` < `${b}.${fieldAmountType}`) ? -ordering : 0);
    });

    return result;
};

class ExchangeSdaDb {
    /**
     * Creates ExchangeSdaDb around CatapultDb.
     * @param {module:db/CatapultDb} db Catapult db instance.
     */
    constructor(db) {
        this.catapultDb = db;
    }

    getCatapultDb() {
        return this.catapultDb;
    }

    // region SDA-SDA exchange retrieval

    /**
     * Retrieves the SDA-SDA exchange entries for the given owner ids.
     * @param {module:db/AccountType} idType Type of account ids.
     * @param {array<object>} ids Owner public keys or addresses.
     * @returns {Promise.<array>} The exchange entries.
     */
    exchangesdaByIds(idType, ids) {
        const buffers = ids.map(id => Buffer.from(id));
        const fieldName = (AccountType.publicKey === idType) ? 'exchangesda.owner' : 'exchangesda.ownerAddress';
        return this.catapultDb.queryDocuments('exchangesda', { [fieldName]: { $in: buffers } })
            .then(deleteExpiredSdaOfferBalancesFromArray);
    }

    /**
     * Retrieves the SDA-SDA exchange entries with the offers of the given mosaicIdGive.
     * @param {Array.<module:catapult.utils/uint64~uint64>} mosaicIds Required mosaic ids.
     * @param {string} pagingId Paging id.
     * @param {int} pageSize Page size.
     * @param {int} ordering Sort order.
     * @returns {Promise.<array>} The SDA-SDA exchange entries.
     */
    exchangesdaByMosaicIdGive(mosaicIds, pagingId, pageSize, ordering) {
        const ids = mosaicIds.map(id => new Long(id[0], id[1]));
        const [fieldName, fieldId, fieldAmountType] = ['sdaOfferBalances', 'mosaicIdGive', 'currentMosaicGiveAmount'];
        const conditions = { $and: [{ [`exchangesda.${fieldName}.${fieldId}`]: { $in: ids } }] };
        const extractor = function(dbObjects) {
            return extractSdaOfferBalances(dbObjects, fieldName, fieldId, fieldAmountType, ids, ordering);
        };

        const options = {
            sortByField: `${fieldName}.${fieldAmountType}`,
            sortOrder: ordering
        };

        return this.catapultDb.queryPagedDocuments('exchangesda', conditions, pagingId, pageSize, options).then(extractor);
    }

    /**
     * Retrieves the SDA-SDA exchange entries with the offers of the given mosaicIdGet.
     * @param {Array.<module:catapult.utils/uint64~uint64>} mosaicIds Required mosaic ids.
     * @param {string} pagingId Paging id.
     * @param {int} pageSize Page size.
     * @param {int} ordering Sort order.
     * @returns {Promise.<array>} The SDA-SDA exchange entries.
     */
    exchangesdaByMosaicIdGet(mosaicIds, pagingId, pageSize, ordering) {
        const ids = mosaicIds.map(id => new Long(id[0], id[1]));
        const [fieldName, fieldId, fieldAmountType] = ['sdaOfferBalances', 'mosaicIdGet', 'currentMosaicGetAmount'];
        const conditions = { $and: [{ [`exchangesda.${fieldName}.${fieldId}`]: { $in: ids } }] };
        const extractor = function(dbObjects) {
            return extractSdaOfferBalances(dbObjects, fieldName, fieldId, fieldAmountType, ids, ordering);
        };

        const options = {
            sortByField: `${fieldName}.${fieldAmountType}`,
            sortOrder: ordering
        };

        return this.catapultDb.queryPagedDocuments('exchangesda', conditions, pagingId, pageSize, options).then(extractor);
    }

    /**
     * Retrieves the minimal SDA-SDA offers info by group hash.
     * @param {object} groupHash Group hash.
     * @returns {Promise.<object>} Minimal SDA-SDA offers info.
     */
    getMinimalSdaOffersInfoByGroupHash(groupHash) {
        const buffer = Buffer.from(groupHash);
        const fieldName = 'sdaOfferGroup';
        return this.catapultDb.queryDocuments('sdaoffergroups', { [fieldName]: buffer });
    }
}

module.exports = ExchangeSdaDb;
