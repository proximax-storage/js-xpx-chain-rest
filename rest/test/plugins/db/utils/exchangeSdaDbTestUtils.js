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

const createSdaOfferBalance = (mosaicIdGive, mosaicIdGet, amountGive, amountGet) => {
    const offer = {
        mosaicIdGive: Long.fromNumber(mosaicIdGive),
        mosaicIdGet: Long.fromNumber(mosaicIdGet),
        currentMosaicGiveAmount: amountGive,
        currentMosaicGetAmount: amountGet,
        initialMosaicGiveAmount: amountGive,
        initialMosaicGetAmount: amountGet,
        deadline: Long.fromNumber(randomInt()),
    };

    return offer;
};

const createSdaOfferBalances = (mosaicIdGive, mosaicIdGet) => {
    const sdaOffers = [];
    for (let i = 0; i < mosaicIdGive.length; ++i)
        sdaOffers.push(createSdaOfferBalance(mosaicIdGive[i], mosaicIdGet[i], i * 100 + 1, i * 100 + 5));

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

const createSdaOfferBasicInfo = (owner, mosaicIdGive, deadline) => {
    const offer = {
        owner: new Binary(owner.publicKey),     
        mosaicGiveAmount: Long.fromNumber(mosaicIdGive), 
        deadline: Long.fromNumber(deadline),
    };

    return offer;
};

const createSdaOfferBasicInfos = (accounts) => {
    const sdaOfferBasicInfos = [];
    for (let i = 0; i < accounts.length; ++i)
        sdaOfferBasicInfos.push(createSdaOfferBasicInfo(accounts[i].owner, createMosaicIds(1, i * 180), accounts[i].deadline));

    return sdaOfferBasicInfos;
};

const createSdaOfferGroupEntry = (id, groupHash, accounts) => ({
    _id: dbTestUtils.db.createObjectId(id),
    sdaoffergroups: {
        groupHash: new Binary(groupHash),
        sdaOfferGroup: createSdaOfferBasicInfos(accounts)
    }
});

const createSdaOfferGroupEntries = (sdaOfferGroupInfos) => {
    const entries = [];
    for (let i = 0; i < sdaOfferGroupInfos.length; ++i) {
        entries.push(createSdaOfferGroupEntry(i, sdaOfferGroupInfos[i].groupHash, sdaOfferGroupInfos[i].sdaOfferGroup));
    }

    return entries;
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