/**
 *** Copyright 2022 ProximaX Limited. All rights reserved.
 *** Use of this source code is governed by the Apache 2.0
 *** license that can be found in the LICENSE file.
 **/

const dbTestUtils = require('../../../db/utils/dbTestUtils');
const MongoDb = require('mongodb');
const ExchangeSdaDb = require('../../../../src/plugins/db/ExchangeSdaDb');
const test = require('../../../testUtils');

const { Binary, Long } = MongoDb;

const randomDouble = () => {
    return Math.random() * 0xFFFFFFFF;
};

const randomInt = () => {
    return Math.floor(randomDouble());
};

const createSdaOfferBalance = (mosaicIdGive, mosaicIdGet) => {
    const offer = {
        mosaicIdGive: Long.fromNumber(mosaicIdGive),
        mosaicIdGet: Long.fromNumber(mosaicIdGet),
        currentMosaicGiveAmount: Long.fromNumber(randomInt()),
        currentMosaicGetAmount: Long.fromNumber(randomInt()),
        initialMosaicGiveAmount: Long.fromNumber(randomInt()),
        initialMosaicGetAmount: Long.fromNumber(randomInt()),
        deadline: Long.fromNumber(randomInt()),
    };

    return offer;
};

const createSdaOfferBalances = (mosaicIdGive, mosaicIdGet) => {
    const sdaOffers = [];
    for (let i = 0; i < mosaicIdGive.length; ++i)
        sdaOffers.push(createSdaOfferBalance(mosaicIdGive[i], mosaicIdGet[i]));

    return sdaOffers;
};

const createSdaExchangeEntry = (id, owner, mosaicIdsGive, mosaicIdsGet) => ({
    _id: dbTestUtils.db.createObjectId(id),
    exchangesda: {
        owner: new Binary(owner.publicKey),
        ownerAddress: new Binary(owner.address),
        sdaOfferBalances: createSdaOfferBalances(
            mosaicIdsGive ? mosaicIdsGive : [randomInt(), randomInt()], 
            mosaicIdsGet ? mosaicIdsGet : [randomInt(), randomInt()])
    }
});

const createMosaicIds = (count, start) => {
    const mosaicIds = [];
    for (let i = 0; i < count; ++i) {
        mosaicIds.push(start + i);
    }

    return mosaicIds;
};

const createSdaExchangeEntries = (accounts) => {
    const entries = [];
    for (let i = 0; i < accounts.length; ++i) {
        entries.push(createSdaExchangeEntry(i, accounts[i], createMosaicIds(3, i * 100), createMosaicIds(3, i * 100 + 50)));
    }

    return entries;
};

const createSdaExchangeEntriesWithMosaicIds = (accounts, mosaicIdGive, mosaicIdGet) => {
    const entries = [];
    for (let i = 0; i < accounts.length; ++i) {
        entries.push(createSdaExchangeEntry(i, accounts[i], [mosaicIdGive], [mosaicIdGet]));
    }

    return entries;
};

const createSdaOfferBasicInfo = (owner, mosaicIdGive) => {
    const offer = {
        owner: new Binary(owner.address),     
        mosaicIdGive: Long.fromNumber(mosaicIdGive), 
        deadline: Long.fromNumber(randomInt()),
    };

    return offer;
};

const createSdaOfferBasicInfos = (owner, mosaicIdGive) => {
    const sdaOfferBasicInfos = [];
    for (let i = 0; i < mosaicIdGive.length; ++i)
        sdaOfferBasicInfos.push(createSdaOfferBasicInfo(owner, mosaicIdGive[i]));

    return sdaOfferBasicInfos;
};

const createSdaOfferGroupEntry = (id, owner, groupHash, mosaicIdGive) => ({
    _id: dbTestUtils.db.createObjectId(id),
    exchangesda: {
        groupHash: new Binary(groupHash),
        sdaOfferGroup: createSdaOfferBasicInfos(owner, mosaicIdGive)
    }
});

const createSdaOfferGroupEntries = (sdaOfferGroupInfos) => {
    let i = 0;
    return sdaOfferGroupInfos.map(sdaOfferGroupInfo => createSdaOfferGroupEntry(++i, sdaOfferGroupInfo.groupHash, sdaOfferGroupInfo.sdaOfferGroup));
};

const exchangeSdaDbTestUtils = {
    db: {
        createSdaExchangeEntry,
        createSdaExchangeEntries,
        createSdaExchangeEntriesWithMosaicIds,
        createSdaOfferGroupEntry,
        createSdaOfferGroupEntries,
        runDbTest: (dbEntities, collectionName, issueDbCommand, assertDbCommandResult) =>
            dbTestUtils.db.runDbTest(dbEntities, collectionName, db => new ExchangeSdaDb(db), issueDbCommand, assertDbCommandResult)
    }
};

Object.assign(exchangeSdaDbTestUtils, test);

module.exports = exchangeSdaDbTestUtils;