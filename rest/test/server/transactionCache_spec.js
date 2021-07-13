/**
 *** Copyright 2019 ProximaX Limited. All rights reserved.
 *** Use of this source code is governed by the Apache 2.0
 *** license that can be found in the LICENSE file.
 * */

const catapultConnection = require('../../src/connection/catapultConnection');
const { createTransactionCache } = require('../../src/server/transactionCache');
const { expect } = require('chai');

describe('transaction cache', () => {
	const createTestContext = () => {
		const context = {
			onceCalls: {},
			writeCalls: [],
			mockConnection: {
				once: (name, handler) => {
					context.onceCalls[name] = handler;
				},
				removeListener: name => {
					delete context.onceCalls[name];
				},
				write: (payload, callback) => {
					context.writeCalls.push({ payload, callback });
				}
			}
		};
		return context;
	};

	describe('addTransactionBuffer', () => {
		it('should add after timeout', () => {
			const payload1 = Buffer.of(0x1);
			const payload2 = Buffer.of(0x2);
			const context = createTestContext();

			// Act:
			const connectionService = {
				lease: () => new Promise(resolve => {
					resolve(catapultConnection.wrap(context.mockConnection));
				})
			};

			const config = {
				flushFrequency: 1
			};

			const transactionCache = createTransactionCache(config, connectionService, () => {});
			transactionCache.addTransactionBuffer(payload1);

			expect(transactionCache.transactions.length).to.equal(1);
			expect(context.writeCalls.length).to.equal(0);

			setTimeout(() => {
				// Assert:
				expect(transactionCache.transactions.length).to.equal(0);
				expect(context.writeCalls.length).to.equal(1);
				expect(context.writeCalls[0].payload).to.deep.equal(payload1);
				expect(context.onceCalls).to.have.all.keys('close');

				// close socket
				context.onceCalls.close();
				setTimeout(() => {
					// Assert:
					expect(transactionCache.transactions.length).to.equal(1);
					expect(transactionCache.transactions).to.deep.equal([payload1]);

					setTimeout(() => {
						// Assert:
						expect(transactionCache.transactions.length).to.equal(0);
						expect(context.writeCalls.length).to.equal(2);
						expect(context.writeCalls[1].payload).to.deep.equal(payload1);

						transactionCache.addTransactionBuffer(payload2);

						expect(transactionCache.transactions.length).to.equal(1);
						expect(transactionCache.transactions).to.deep.equal([payload2]);
						context.writeCalls[1].callback();
						setTimeout(() => {
							// Assert:
							expect(transactionCache.transactions.length).to.equal(0);
						}, 1);
					}, 200);
				}, 1);
			}, 100);
		});

		it('should restart after crash on least', () => {
			const payload1 = Buffer.of(0x1);

			let transactionCache;
			// Act:
			const connectionService = {
				lease: () => new Promise((resolve, reject) => {
					expect(transactionCache.transactions.length).to.equal(0);
					reject(errors.createServiceUnavailableError('connection failed'));
				})
			};

			const config = {
				flushFrequency: 1
			};

			transactionCache = createTransactionCache(config, connectionService, () => {});
			transactionCache.addTransactionBuffer(payload1);

			expect(transactionCache.transactions.length).to.equal(1);
			expect(transactionCache.sending).to.equal(true);

			setTimeout(() => {
				// Assert:
				expect(transactionCache.transactions.length).to.equal(1);
				expect(transactionCache.sending).to.equal(true);

				setTimeout(() => {
					// Assert:
					expect(transactionCache.transactions.length).to.equal(1);
					expect(transactionCache.sending).to.equal(true);

					// rejection of connection will cause infinity loop, so break it by cleaning transactions
					transactionCache.transactions = [];
					setTimeout(() => {
						// Assert:
						expect(transactionCache.transactions.length).to.equal(0);
						expect(transactionCache.sending).to.equal(false);
					}, 2);
				}, 2);
			}, 2);
		});
	});
});
