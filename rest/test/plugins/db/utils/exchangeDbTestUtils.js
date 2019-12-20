/**
 *** Copyright 2019 ProximaX Limited. All rights reserved.
 *** Use of this source code is governed by the Apache 2.0
 *** license that can be found in the LICENSE file.
 **/

const dbTestUtils = require('../../../db/utils/dbTestUtils');
const MongoDb = require('mongodb');
const ExchangeDb = require('../../../../src/plugins/db/ExchangeDb');
const test = require('../../../testUtils');

const { Binary, Long } = MongoDb;

const randomDouble = () => {
	return Math.random() * 0xFFFFFFFF;
};

const randomInt = () => {
	return Math.floor(randomDouble());
};

const createOffer = (type, mosaicId) => {
	const offer = {
		mosaicId: Long.fromNumber(mosaicId),
		amount: Long.fromNumber(randomInt()),
		initialAmount: Long.fromNumber(randomInt()),
		initialCost: Long.fromNumber(randomInt()),
		deadline: Long.fromNumber(randomInt()),
		price: randomDouble()
	};

	if ('buy' === type)
		offer.residualCost = Long.fromNumber(randomInt());

	return offer;
};

const createSellOffers = (mosaicIds) => {
	const offers = [];
	for (let i = 0; i < mosaicIds.length; ++i)
		offers.push(createOffer('sell',  mosaicIds[i]));

	return offers;
};

const createBuyOffers = (mosaicIds) => {
	const offers = [];
	for (let i = 0; i < mosaicIds.length; ++i)
		offers.push(createOffer('buy', mosaicIds[i]));

	return offers;
};

const createExchangeEntry = (id, owner, sellMosaicIds, buyMosaicIds) => ({
	_id: dbTestUtils.db.createObjectId(id),
	exchange: {
		owner: new Binary(owner.publicKey),
		ownerAddress: new Binary(owner.address),
		sellOffers: createSellOffers(sellMosaicIds ? sellMosaicIds : [randomInt(), randomInt()]),
		buyOffers: createBuyOffers(buyMosaicIds ? buyMosaicIds : [randomInt(), randomInt(), randomInt()])
	}
});

const createMosaicIds = (count, start) => {
	const mosaicIds = [];
	for (let i = 0; i < count; ++i) {
		mosaicIds.push(start + i);
	}

	return mosaicIds;
};

const createExchangeEntries = (accounts) => {
	const entries = [];
	for (let i = 0; i < accounts.length; ++i) {
		entries.push(createExchangeEntry(i, accounts[i], createMosaicIds(2, i * 100), createMosaicIds(3, i * 100 + 50)));
	}

	return entries;
};

const createExchangeEntriesWithMosaicId = (accounts, mosaicId) => {
	const entries = [];
	for (let i = 0; i < accounts.length; ++i) {
		entries.push(createExchangeEntry(i, accounts[i], [mosaicId], [mosaicId]));
	}

	return entries;
};

const exchangeDbTestUtils = {
	db: {
		createExchangeEntry,
		createExchangeEntries,
		createExchangeEntriesWithMosaicId,
		runDbTest: (dbEntities, issueDbCommand, assertDbCommandResult) =>
			dbTestUtils.db.runDbTest(dbEntities, 'exchanges', db => new ExchangeDb(db), issueDbCommand, assertDbCommandResult)
	}
};
Object.assign(exchangeDbTestUtils, test);

module.exports = exchangeDbTestUtils;
