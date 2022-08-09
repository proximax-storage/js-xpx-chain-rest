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

	queryTransactionStatementsReceipts(collectionName, height, receiptType, publicKey) {
		const matchHeight = { $match: {"height": convertToLong(height)} };
		const unwind = { $unwind: "$receipts" };
		const matching1 = { $match: {"receipts.type": receiptType} };
		const matching2 = {
			$match: { $and: [{"receipts.type": receiptType}, { $or: [{"receipts.sender": [publicKey]}, {"receipts.exchangeDetails.recipient": publicKey}] }] }
		};

		const project = {
			$project: { _id: 0, height: "$height", source: "$source", receipts: ["$receipts"] }
		};

		const pipe = [matchHeight, unwind];
		if (height && receiptType && !publicKey)
			pipe.push(matching1);
		else if (height && receiptType && publicKey)
			pipe.push(matching2);
		pipe.push(project);

		return this.catapultDb.queryPagedDocumentsUsingAggregate(collectionName, pipe, 0, 25);
	}

	/**
	 * Retrieves the receipts by receipt type and height.
	 * @param {module:catapult.utils/uint64~uint64} height Given block height.
	 * @param {int} receiptType Receipt type.
	 * @returns {Promise.<array>} The receipts.
	 */
	getReceiptsAtHeightByReceiptType(height, receiptType) {
		return this.queryTransactionStatementsReceipts('transactionStatements', height, receiptType, null);
	}

	/**
	 * Retrieves the exchangesda receipts by account.
	 * @param {module:catapult.utils/uint64~uint64} height Given block height.
	 * @param {module:catapult.utils/uint64~uint64} publicKey The account public key.
	 * @returns {Promise.<array>} The exchangesda receipts for the account.
	 */
	 getSdaExchangeReceiptsByPublicKeyAtHeight(height, receiptType, publicKey) {
		const buffer = Buffer.from(publicKey);
		return this.queryTransactionStatementsReceipts('transactionStatements', height, receiptType, buffer);
	};
}

module.exports = ReceiptsDb;
