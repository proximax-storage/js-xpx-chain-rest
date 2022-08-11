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

const receiptsRoutes = require('../../../src/plugins/routes/receiptsRoutes');
const routeUtils = require('../../../src/routes/routeUtils');
const sinon = require('sinon');
const catapult = require('catapult-sdk');
const { test } = require('../../routes/utils/routeTestUtils');
const { expect } = require('chai');

const { publicKeys } = test.sets;
const { convert } = catapult.utils;

describe('receipts routes', () => {
	describe('get transaction statements by height', () => {
		const endpointUnderTest = '/block/:height/receipts';

		const highestHeight = 50;
		const correctQueriedHeight = highestHeight - 10;

		const transactionStatementData = ['dummyStatement'];
		const addressResolutionStatementData = ['dummyStatement', 'dummyStatement'];
		const mosaicResolutionStatementData = ['dummyStatement'];
		const statementsFake = sinon.stub();
		const orderedStatementsCollections = ['transactionStatements', 'addressResolutionStatements', 'mosaicResolutionStatements'];
		statementsFake.withArgs(correctQueriedHeight, orderedStatementsCollections[0]).returns(transactionStatementData);
		statementsFake.withArgs(correctQueriedHeight, orderedStatementsCollections[1]).returns(addressResolutionStatementData);
		statementsFake.withArgs(correctQueriedHeight, orderedStatementsCollections[2]).returns(mosaicResolutionStatementData);

		const routes = {};
		const server = {
			get: (path, handler) => {
				routes[path] = handler;
			}
		};

		receiptsRoutes.register(server, {
			catapultDb: {
				chainInfo: () => Promise.resolve({ height: highestHeight })
			},
			statementsAtHeight: statementsFake
		});

		let sentResponse;
		const next = () => {};
		const res = {
			send: response => {
				sentResponse = response;
			},
			redirect: () => {
				next();
			}
		};

		beforeEach(() => statementsFake.resetHistory());

		it('returns result if provided height is valid', () => {
			// Arrange:
			const req = { params: { height: correctQueriedHeight.toString() } };

			// Act:
			const route = routes[endpointUnderTest];
			return route(req, res, next).then(() => {
				// Assert:
				expect(statementsFake.calledThrice).to.equal(true);
				orderedStatementsCollections.forEach((statementCollection, index) => expect(
					statementsFake.calledWith(correctQueriedHeight, statementCollection),
					`failed at index ${index}`
				).to.equal(true));

				expect(sentResponse).to.deep.equal({
					payload: {
						transactionStatements: transactionStatementData,
						addressResolutionStatements: addressResolutionStatementData,
						mosaicResolutionStatements: mosaicResolutionStatementData
					},
					type: 'receipts'
				});
			});
		});

		it('returns 404 if not found in the database', () => {
			// Arrange:
			const queriedHeight = highestHeight + 10;
			const req = { params: { height: queriedHeight.toString() } };

			// Act:
			const route = routes[endpointUnderTest];
			return route(req, res, next).then(() => {
				// Assert:
				expect(statementsFake.calledThrice).to.equal(true);
				expect(sentResponse.statusCode).to.equal(404);
				expect(sentResponse.message).to.equal(`no resource exists with id '${highestHeight + 10}'`);
			});
		});

		it('returns 409 if height is invalid', () => {
			// Arrange:
			const req = { params: { height: '10A' } };

			// Act:
			const route = routes[endpointUnderTest];
			const apiResponse = expect(() => route(req, res, next).then(() => {})).to;

			// Assert:
			apiResponse.throw('height has an invalid format');
			apiResponse.with.property('statusCode', 409);
			apiResponse.with.property('message', 'height has an invalid format');
			expect(statementsFake.notCalled).to.equal(true);
		});
	});

	describe('get receipts merkle path', () => {
		it('calls blockRouteMerkleProcessor with correct params', () => {
			// Arrange:
			const blockRouteMerkleProcessorSpy = sinon.spy(routeUtils, 'blockRouteMerkleProcessor');
			const routes = {};
			const server = {
				get: (path, handler) => {
					routes[path] = handler;
				}
			};

			// Act:
			receiptsRoutes.register(server, {}, {});

			// Assert:
			expect(blockRouteMerkleProcessorSpy.calledOnce).to.equal(true);
			expect(blockRouteMerkleProcessorSpy.firstCall.args[1]).to.equal('numStatements');
			expect(blockRouteMerkleProcessorSpy.firstCall.args[2]).to.equal('statementMerkleTree');
			blockRouteMerkleProcessorSpy.restore();
		});
	});

	describe('get transaction statements by height and receipt type', () => {
		const endpointUnderTest = '/block/:height/receipts/:receiptType';

		const highestHeight = 50;
		const correctQueriedHeight = highestHeight - 10;
		const receiptType = 8515;

		const transactionStatementData = ['dummyStatement'];
		const statementsFake = sinon.stub();
		statementsFake.withArgs(correctQueriedHeight, receiptType).returns(transactionStatementData);

		const routes = {};
		const server = {
			get: (path, handler) => {
				routes[path] = handler;
			}
		};

		receiptsRoutes.register(server, {
			catapultDb: {
				chainInfo: () => Promise.resolve({ height: highestHeight })
			},
			getReceiptsAtHeightByReceiptType: statementsFake
		});

		let sentResponse;
		const next = () => {};
		const res = {
			send: response => {
				sentResponse = response;
			},
			redirect: () => {
				next();
			}
		};

		beforeEach(() => statementsFake.resetHistory());

		it('returns result if provided height is valid', () => {
			// Arrange:
			const req = { params: { height: correctQueriedHeight.toString(), receiptType: receiptType.toString() } };

			// Act:
			const route = routes[endpointUnderTest];
			return route(req, res, next).then(() => {
				// Assert:
				expect(statementsFake.calledOnce).to.equal(true);
				expect(statementsFake.calledWith(correctQueriedHeight, receiptType), `failed at index 0`).to.equal(true);

				expect(sentResponse).to.deep.equal({
					payload: {
						receiptStatements: transactionStatementData
					},
					type: 'receiptStatements'
				});
			});
		});

		it('returns 404 if not found in the database', () => {
			// Arrange:
			const queriedHeight = highestHeight + 10;
			const req = { params: { height: queriedHeight.toString(), receiptType: receiptType.toString() } };

			// Act:
			const route = routes[endpointUnderTest];
			return route(req, res, next).then(() => {
				// Assert:
				expect(statementsFake.calledOnce).to.equal(true);
				expect(sentResponse.statusCode).to.equal(404);
				expect(sentResponse.message).to.equal(`no resource exists with id '${highestHeight + 10}'`);
			});
		});

		it('returns 409 if height is invalid', () => {
			// Arrange:
			const req = { params: { height: '10A', receiptTye: receiptType.toString() } };

			// Act:
			const route = routes[endpointUnderTest];
			const apiResponse = expect(() => route(req, res, next).then(() => {})).to;

			// Assert:
			apiResponse.throw('height has an invalid format');
			apiResponse.with.property('statusCode', 409);
			apiResponse.with.property('message', 'height has an invalid format');
			expect(statementsFake.notCalled).to.equal(true);
		});
	});

	describe('get exchangesda transaction statements', () => {
		const endpointUnderTest = '/block/:height/receipts/exchangesda';

		const highestHeight = 50;
		const correctQueriedHeight = highestHeight - 10;

		const offerCreationData = ['dummyStatement'];
		const offerExchangeData = ['dummyStatement', 'dummyStatement'];
		const offerRemovalData = ['dummyStatement'];
		const statementsFake = sinon.stub();
		const orderedSdaExchangeEntityTypes = [41322, 45674, 50026];
		statementsFake.withArgs(correctQueriedHeight, orderedSdaExchangeEntityTypes[0]).returns(offerCreationData);
		statementsFake.withArgs(correctQueriedHeight, orderedSdaExchangeEntityTypes[1]).returns(offerExchangeData);
		statementsFake.withArgs(correctQueriedHeight, orderedSdaExchangeEntityTypes[2]).returns(offerRemovalData);

		const routes = {};
		const server = {
			get: (path, handler) => {
				routes[path] = handler;
			}
		};

		receiptsRoutes.register(server, {
			catapultDb: {
				chainInfo: () => Promise.resolve({ height: highestHeight })
			},
			getReceiptsAtHeightByReceiptType: statementsFake
		});
		
		let sentResponse;
		const next = () => {};
		const res = {
			send: response => {
				sentResponse = response;
			},
			redirect: () => {
				next();
			}
		};

		beforeEach(() => statementsFake.resetHistory());

		it('returns result if provided height is valid', () => {
			// Arrange:
			const req = { params: { height: correctQueriedHeight.toString() } };

			// Act:
			const route = routes[endpointUnderTest];
			return route(req, res, next).then(() => {
				// Assert:
				expect(statementsFake.calledThrice).to.equal(true);
				orderedSdaExchangeEntityTypes.forEach((sdaExchangeData, index) => expect(
					statementsFake.calledWith(correctQueriedHeight, sdaExchangeData),
					`failed at index ${index}`
				).to.equal(true));

				expect(sentResponse).to.deep.equal({
					payload: {
						offerCreation: offerCreationData,
						offerExchange: offerExchangeData,
						offerRemoval: offerRemovalData
					},
					type: 'receipts.exchangesda'
				});
			});
		});

		it('returns 404 if not found in the database', () => {
			// Arrange:
			const queriedHeight = highestHeight + 10;
			const req = { params: { height: queriedHeight.toString() } };

			// Act:
			const route = routes[endpointUnderTest];
			return route(req, res, next).then(() => {
				// Assert:
				expect(statementsFake.calledThrice).to.equal(true);
				expect(sentResponse.statusCode).to.equal(404);
				expect(sentResponse.message).to.equal(`no resource exists with id '${highestHeight + 10}'`);
			});
		});

		it('returns 409 if height is invalid', () => {
			// Arrange:
			const req = { params: { height: '10A' } };

			// Act:
			const route = routes[endpointUnderTest];
			const apiResponse = expect(() => route(req, res, next).then(() => {})).to;

			// Assert:
			apiResponse.throw('height has an invalid format');
			apiResponse.with.property('statusCode', 409);
			apiResponse.with.property('message', 'height has an invalid format');
			expect(statementsFake.notCalled).to.equal(true);
		});
	});

	describe('get exchangesda transaction statements by public key', () => {
		const endpointUnderTest = '/block/:height/receipts/exchangesda/:publicKey';

		const highestHeight = 50;
		const correctQueriedHeight = highestHeight - 10;

		const offerCreationData = ['dummyStatement'];
		const offerExchangeData = ['dummyStatement', 'dummyStatement'];
		const offerRemovalData = ['dummyStatement'];
		const statementsFake = sinon.stub();
		const orderedSdaExchangeEntityTypes = [41322, 45674, 50026];
		statementsFake.withArgs(correctQueriedHeight, orderedSdaExchangeEntityTypes[0]).returns(offerCreationData);
		statementsFake.withArgs(correctQueriedHeight, orderedSdaExchangeEntityTypes[1]).returns(offerExchangeData);
		statementsFake.withArgs(correctQueriedHeight, orderedSdaExchangeEntityTypes[2]).returns(offerRemovalData);

		const routes = {};
		const server = {
			get: (path, handler) => {
				routes[path] = handler;
			}
		};

		receiptsRoutes.register(server, {
			catapultDb: {
				chainInfo: () => Promise.resolve({ height: highestHeight, publicKey: publicKeys.valid[0] })
			},
			getSdaExchangeReceiptsByPublicKeyAtHeight: statementsFake
		});
		
		let sentResponse;
		const next = () => {};
		const res = {
			send: response => {
				sentResponse = response;
			},
			redirect: () => {
				next();
			}
		};

		beforeEach(() => statementsFake.resetHistory());

		it('returns result if provided height is valid', () => {
			// Arrange:
			const req = { params: { height: correctQueriedHeight.toString(), publicKey: publicKeys.valid[0] } };

			// Act:
			const route = routes[endpointUnderTest];
			return route(req, res, next).then(() => {
				// Assert:
				expect(statementsFake.calledThrice).to.equal(true);
				orderedSdaExchangeEntityTypes.forEach((sdaExchangeData, index) => expect(
					statementsFake.calledWith(correctQueriedHeight, sdaExchangeData),
					`failed at index ${index}`
				).to.equal(true));

				expect(sentResponse).to.deep.equal({
					payload: {
						offerCreation: offerCreationData,
						offerExchange: offerExchangeData,
						offerRemoval: offerRemovalData
					},
					type: 'receipts.exchangesda'
				});
			});
		});

		it('returns 404 if not found in the database', () => {
			// Arrange:
			const queriedHeight = highestHeight + 10;
			const req = { params: { height: queriedHeight.toString(), publicKey: publicKeys.valid[0] } };

			// Act:
			const route = routes[endpointUnderTest];
			return route(req, res, next).then(() => {
				// Assert:
				expect(statementsFake.calledThrice).to.equal(true);
				expect(sentResponse.statusCode).to.equal(404);
				expect(sentResponse.message).to.equal(`no resource exists with id '${convert.hexToUint8(publicKeys.valid[0])}'`);
			});
		});

		it('returns 409 if height is invalid', () => {
			// Arrange:
			const req = { params: { height: '10A' } };

			// Act:
			const route = routes[endpointUnderTest];
			const apiResponse = expect(() => route(req, res, next).then(() => {})).to;

			// Assert:
			apiResponse.throw('height has an invalid format');
			apiResponse.with.property('statusCode', 409);
			apiResponse.with.property('message', 'height has an invalid format');
			expect(statementsFake.notCalled).to.equal(true);
		});
	});
});
