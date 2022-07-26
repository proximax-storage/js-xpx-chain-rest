/*
 * Copyright (c) 2016-present,
 * Jaguar0625, gimre, BloodyRookie, Tech Bureau, Corp. All rights reserved.
 *
 * This file is part of Catapult.
 *
 * Catapult is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Lesser General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * Catapult is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License
 * along with Catapult.  If not, see <http://www.gnu.org/licenses/>.
 */

const { convertToLong } = require('../../db/dbUtils');

const ReceiptType = {
	1: 'receipts.balanceTransfer',
	2: 'receipts.balanceChange',
	3: 'receipts.balanceChange',
	4: 'receipts.artifactExpiry',
	5: 'receipts.inflation',
	10: 'receipts.offerCreation',
	11: 'receipts.offerExchange',
	12: 'receipts.offerRemoval'
};

const getBasicReceiptType = type => ReceiptType[(type & 0xF000) >> 12] || 'receipts.unknown';

class ReceiptsDb {
	/**
	* Creates ReceiptsDb around CatapultDb.
	* @param {module:db/CatapultDb} db Catapult db instance.
	*/
	constructor(db) {
		this.catapultDb = db;
	}

	/**
	* Retrieves all the statements in a given collection and block.
	* @param {module:catapult.utils/uint64~uint64} height Given block height.
	* @param {string} statementsCollection Statements collection.
	* @returns {Promise.<array>} Statements from a collection in a block.
	*/
	statementsAtHeight(height, statementsCollection) {
		return this.catapultDb.queryDocuments(statementsCollection, { height: convertToLong(height) });
	}

	/**
	 * Retrieves the receipts by receipt type and height.
	 * @param {module:catapult.utils/uint64~uint64} height Given block height.
	 * @param {int} receiptType Receipt type.
	 * @returns {Promise.<array>} The receipts.
	 */
	getReceiptsAtHeightByReceiptType(height, receiptType) {
		let type = getBasicReceiptType(receiptType);
		const fieldName = 'receipts.type';
		const conditions = { $and: [ { height: convertToLong(height) }, { [fieldName]: type } ] };
		return this.catapultDb.queryDocuments('transactionStatements', conditions);
	}

	/**
	 * Retrieves the exchangesda receipts.
	 * @param {module:catapult.utils/uint64~uint64} height Given block height.
	 * @param {module:catapult.utils/uint64~uint64} publicKey The account public key.
	 * @returns {Promise.<array>} The exchangesda receipts.
	 */
	getSdaExchangeReceiptsAtHeight(height, publicKey) {
		const buffer = Buffer.from(publicKey);
		let [offerCreation, offerExchange, offerRemoval] = [getBasicReceiptType(6), getBasicReceiptType(7), getBasicReceiptType(8)];
		const fieldName = 'receipts.type';
		const conditions = { $and: [ { height: convertToLong(height) },  { 'receipts.sender': buffer}, { $or: [ { [fieldName]: offerCreation }, { [fieldName]: offerExchange }, { [fieldName]: offerRemoval } ] } ] };
		return this.catapultDb.queryDocuments('transactionStatements', conditions);
	};

	/**
	 * Retrieves the exchangesda receipts by account.
	 * @param {module:catapult.utils/uint64~uint64} height Given block height.
	 * @param {module:catapult.utils/uint64~uint64} publicKey The account public key.
	 * @returns {Promise.<array>} The exchangesda receipts for the account.
	 */
	 getSdaExchangeReceiptsByPublicKeyAtHeight(height, publicKey, filters) {
		const buffer = Buffer.from(publicKey);
		let [offerCreation, offerExchange, offerRemoval] = [getBasicReceiptType(6), getBasicReceiptType(7), getBasicReceiptType(8)];
		const fieldName = 'receipts.type';
		const conditions = { $and: [ { height: convertToLong(height) }, { 'receipts.sender': buffer}, { $or: [ { [fieldName]: offerCreation }, { [fieldName]: offerExchange }, { [fieldName]: offerRemoval } ] } ] };

		if (filters.receiptType !== undefined) {
			let receiptType = getBasicReceiptType(filters.receiptType);
			conditions = { $and: [ { 'receipts.sender': buffer, [fieldName]: receiptType } ] };
			return this.catapultDb.queryDocuments('transactionStatements', conditions);
		}

		return this.catapultDb.queryDocuments('transactionStatements', conditions);
	};
}

module.exports = ReceiptsDb;
