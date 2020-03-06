/**
 *** Copyright 2019 ProximaX Limited. All rights reserved.
 *** Use of this source code is governed by the Apache 2.0
 *** license that can be found in the LICENSE file.
 **/

const MongoDb = require('mongodb');

const { Long } = MongoDb;

class RichlistDb {
	/**
	 * Creates RichlistDb around CatapultDb.
	 * @param {module:db/CatapultDb} db Catapult db instance.
	 */
	constructor(db) {
		this.catapultDb = db;
	}

	descendingAccountMosaicBalances(id, page, pageSize) {
		const mosaicId = new Long(id[0], id[1]);
		const unwindStep = { $unwind: '$account.mosaics' };
		const filterStep = { $match: { 'account.mosaics.id': mosaicId } };
		const projectStep = { $project: {
			'address': '$account.address',
			'publicKey': '$account.publicKey',
			'amount': '$account.mosaics.amount'
		} };
		const sortStep = { $sort: { 'amount' : -1 } };

		const pipe = [unwindStep, filterStep, projectStep, sortStep];

		return this.catapultDb.queryPagedDocumentsUsingAggregate('accounts', pipe, page || 0, pageSize || 25);
	}
}

module.exports = RichlistDb;
