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
			});
		},

		startTimer: () => {
			if (!cache.sending) {
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
