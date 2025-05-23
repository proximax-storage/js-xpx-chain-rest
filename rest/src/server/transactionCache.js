/**
 *** Copyright 2019 ProximaX Limited. All rights reserved.
 *** Use of this source code is governed by the Apache 2.0
 *** license that can be found in the LICENSE file.
 * */

/**
 * @param {object} transactionCacheConfig  of transaction cache.
 * @param {object} connections Api server connection pool.
 * @param {object} logger Logger.
 * @returns {object} transaction cache
 */
module.exports.createTransactionCache = (transactionCacheConfig, connections, logger) => {
	let cache;

	cache = {
		sending: false,
		transactions: [],
		sendTransactionToBlockchain: () => {
			logger(`sendTransactionToBlockchain with transactions.length = ${cache.transactions.length}`);
			const temp = cache.transactions;
			cache.transactions = [];

			connections.lease().then(connection => {
				connection.send(Buffer.concat(temp)).then(() => {
					if (0 !== cache.transactions.length)
						cache.sendTransactionToBlockchain();
					else
						cache.sending = false;
				}).catch(() => {
					logger(`got error during pushing ${temp.length} transactions`);
					// if we got error during sending, let's add transactions back, and fire query again
					cache.transactions = cache.transactions.concat(temp);
					cache.sending = false;
					cache.startTimer();
				});
			}).catch(() => {
				logger(`got error during connecting to send ${temp.length} transactions`);
				// if we got error during connecting, let's add transactions back, and fire query again
				cache.transactions = cache.transactions.concat(temp);
				cache.sending = false;
				cache.startTimer();
			});
		},

		startTimer: () => {
			logger(`startTimer when cache.sending = ${cache.sending} and transactions.length = ${cache.transactions.length}`);
			if (!cache.sending && cache.transactions.length) {
				cache.sending = true;
				setTimeout(cache.sendTransactionToBlockchain, transactionCacheConfig.flushFrequency);
			}
		},

		addTransactionBuffer: transactionBuffer => {
			cache.transactions.push(transactionBuffer);
			cache.startTimer();
		}
	};

	return cache;
};
