const MongoDb = require("mongodb");
/**
 *** Copyright 2020 ProximaX Limited. All rights reserved.
 *** Use of this source code is governed by the Apache 2.0
 *** license that can be found in the LICENSE file.
 * */
const { Long } = MongoDb;

class LockFundDb {
	/**
	 * Creates LockFundDb around CatapultDb.
	 * @param {module:db/CatapultDb} db Catapult db instance.
	 */
	constructor(db) {
		this.catapultDb = db;
	}

	// region super contract retrieval

	/**
	 * Retrieves super contract entry by account id.
	 * @param {array<object>} accountId Account public key.
	 * @returns {Promise.<object>} The lock fund key indexed record group.
	 */
	getLockFundRecordGroupByKey(key) {
		const buffer = Buffer.from(key);
		return this.catapultDb.queryDocument('lockFundKeyRecords', { ["lockFundRecordGroup.identifier"]: buffer });
	}

	/**
	 * Retrieves super contract entry by account id.
	 * @param {uint64} height Height.
	 * @returns {Promise.<object>} The lock fund height indexed record group.
	 */
	getLockFundRecordGroupByHeight(height) {
		return this.catapultDb.queryDocument('lockFundHeightRecords', { ["lockFundRecordGroup.identifier"]: new Long(height[0], height[1]) });
	}

	// endregion
}

module.exports = LockFundDb;
