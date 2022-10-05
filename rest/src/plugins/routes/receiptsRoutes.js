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

const dbFacade = require('../../routes/dbFacade');
const errors = require('../../server/errors');
const routeResultTypes = require('../../routes/routeResultTypes');
const routeUtils = require('../../routes/routeUtils');

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
const parseHeight = params => routeUtils.parseArgument(params, 'height', 'uint');

const getStatementsPromise = (db, height, statementsCollection) =>
	dbFacade.runHeightDependentOperation(db.catapultDb, height, () => db.statementsAtHeight(height, statementsCollection));
const getReceiptsAtHeightByReceiptTypePromise =  (db, height, receiptType) =>
	dbFacade.runHeightDependentOperation(db.catapultDb, height, () => db.getReceiptsAtHeightByReceiptType(height, receiptType));
const getSdaExchangeReceiptsByAccountIdAtHeightPromise =  (db, height, receiptType, accountId) =>
	dbFacade.runHeightDependentOperation(db.catapultDb, height, () => db.getSdaExchangeReceiptsByAccountIdAtHeight(height, receiptType, accountId));

module.exports = {
	register: (server, db) => {
		server.get('/block/:height/receipts', (req, res, next) => {
			const height = parseHeight(req.params);

			return Promise.all([
				getStatementsPromise(db, height, 'transactionStatements'),
				getStatementsPromise(db, height, 'addressResolutionStatements'),
				getStatementsPromise(db, height, 'mosaicResolutionStatements')
			]).then(results => {
				const [
					transactionStatementsInfo,
					addressResolutionStatementsInfo,
					mosaicResolutionStatementsInfo
				] = results;

				if (results.some(result => !result.isRequestValid)) {
					res.send(errors.createNotFoundError(height));
					return next();
				}

				const result = {
					transactionStatements: transactionStatementsInfo.payload,
					addressResolutionStatements: addressResolutionStatementsInfo.payload,
					mosaicResolutionStatements: mosaicResolutionStatementsInfo.payload
				};

				res.send({
					payload: result,
					type: routeResultTypes.receipts
				});

				return next();
			});
		});

		server.get(
			'/block/:height/receipt/:hash/merkle',
			routeUtils.blockRouteMerkleProcessor(db.catapultDb, 'numStatements', 'statementMerkleTree')
		);

		server.get('/block/:height/receipts/:receiptType', (req, res, next) => {
			const { params } = req;
			const height = parseHeight(params);
			const receiptType = routeUtils.parseArgument(params, 'receiptType', 'uint');
			const type = getBasicReceiptType(receiptType);

			if (type == 'receipts.unknown')
				throw errors.createInvalidArgumentError('receipt type not recognized');

			return Promise.all([
				getReceiptsAtHeightByReceiptTypePromise(db, height, receiptType)
			]).then(results => {
				const [ receiptStatementsInfo ] = results;

				if (results.some(result => !result.isRequestValid)) {
					res.send(errors.createNotFoundError(height));
					return next();
				}

				const result = {
					receiptStatements: receiptStatementsInfo.payload
				};

				res.send({
					payload: result,
					type: 'receiptStatements'
				});

				return next();
			});
		});

		server.get('/block/:height/receipts/exchangesda', (req, res, next) => {
			const height = parseHeight(req.params);

			return Promise.all([
				getReceiptsAtHeightByReceiptTypePromise(db, height, 41322),
				getReceiptsAtHeightByReceiptTypePromise(db, height, 45674),
				getReceiptsAtHeightByReceiptTypePromise(db, height, 50026)
			]).then(results => {
				const [
					offerCreationInfo,
					offerExchangeInfo,
					offerRemovalInfo
				] = results;

				if (results.some(result => !result.isRequestValid)) {
					res.send(errors.createNotFoundError(height));
					return next();
				}

				const result = {
					offerCreation: offerCreationInfo.payload,
					offerExchange: offerExchangeInfo.payload,
					offerRemoval: offerRemovalInfo.payload
				};

				res.send({
					payload: result,
					type: 'receipts.exchangesda'
				});

				return next();
			});
		});

		server.get('/block/:height/receipts/exchangesda/:accountId', (req, res, next) => {
			const { params } = req;
			const height = parseHeight(params);
			const [type, accountId] = routeUtils.parseArgument(params, 'accountId', 'accountId');

			return Promise.all([
				getSdaExchangeReceiptsByAccountIdAtHeightPromise(db, height, 41322, accountId),
				getSdaExchangeReceiptsByAccountIdAtHeightPromise(db, height, 45674, accountId),
				getSdaExchangeReceiptsByAccountIdAtHeightPromise(db, height, 50026, accountId),
			]).then(results => {
				const [
					offerCreationInfo,
					offerExchangeInfo,
					offerRemovalInfo
				] = results;

				if (results.some(result => !result.isRequestValid)) {
					res.send(errors.createNotFoundError(accountId));
					return next();
				}

				const result = {
					offerCreation: offerCreationInfo.payload,
					offerExchange: offerExchangeInfo.payload,
					offerRemoval: offerRemovalInfo.payload
				};
				
				res.send({
					payload: result,
					type: 'receipts.exchangesda'
				});

				return next();
			});
		});
	}
};
