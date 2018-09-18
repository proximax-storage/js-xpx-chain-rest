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

const restify = require('restify-clients');
const catapult = require('catapult-sdk');
const crypto = require('crypto');
const winston = require('winston');
const spammerUtils = require('./model/spammerUtils');
const transactionFactory = require('./model/transactionFactory');
const random = require('./utils/random');
const spammerOptions = require('./utils/spammerOptions');
const fs = require('fs');
const { createConnection } = require('net');
// TODO: Need to re-work it in future
const { createConnectionService } = require('../../rest/src/connection/connectionService');

const packetHeader = catapult.packet.header;
const { PacketType } = catapult.packet;
const { address } = catapult.model;
const { serialize, transactionExtensions } = catapult.modelBinary;
const modelCodec = catapult.plugins.catapultModelSystem.configure(['transfer', 'aggregate'], {}).codec;
const { uint64 } = catapult.utils;

const configureLogging = config => {
	winston.remove(winston.transports.Console);
	if ('production' !== process.env.NODE_ENV)
		winston.add(winston.transports.Console, config.console);

	winston.add(winston.transports.File, config.file);
};

const loadConfig = (options) => {
	winston.info(`loading config from ${options.configFile}`);
	return JSON.parse(fs.readFileSync(options.configFile, 'utf8'));
};

{
	const Mijin_Test_Network = catapult.model.networkInfo.networks.mijinTest.id;
	const options = spammerOptions.options();
	let client;

	if (options.type === 'rest') {
		client = restify.createJsonClient({
			url: `http://${options.address}:${options.port}`,
			connectTimeout: 1000
		});
	} else if (options.type === 'node') {
		const config = loadConfig(options);
		configureLogging(config.logging);
		winston.verbose('finished loading rest server config', config);

		const connectionService = createConnectionService(config, createConnection, catapult.auth.createAuthPromise, winston.verbose);

		client = connectionService.lease();
	}

	const Private_Keys = options.privateKeys;

	const txCounters = { initiated: 0, successful: 0 };
	const timer = (() => {
		let startTime = new Date().getTime();
		return {
			elapsed: () => new Date().getTime() - startTime,
			restart: () => { startTime = new Date().getTime(); }
		};
	})();

	const logStats = spammerStats => {
		if (0 !== spammerStats.successful % 10)
			return;

		const throughput = (spammerStats.successful * 1000 / timer.elapsed()).toFixed(2);
		winston.info(`transactions successfully sent so far: ${spammerStats.successful} (${throughput} txes / s)`);
	};

	const predefinedRecipient = (() => {
		const Seed_Private_Key = '0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF';
		const recipients = [];
		let curPrivateKey = Seed_Private_Key;
		for (let i = 0; i < options.predefinedRecipients; ++i) {
			const keyPair = catapult.crypto.createKeyPairFromPrivateKeyString(curPrivateKey);
			curPrivateKey = catapult.utils.convert.uint8ToHex(keyPair.publicKey);
			recipients.push(address.publicKeyToAddress(keyPair.publicKey, Mijin_Test_Network));
		}

		return () => recipients[random.uint32(options.predefinedRecipients - 1)];
	})();

	const randomRecipient = () => {
		const keySize = 32;
		const privateKey = crypto.randomBytes(keySize);
		const keyPair = catapult.crypto.createKeyPairFromPrivateKeyString(catapult.utils.convert.uint8ToHex(privateKey));
		return address.publicKeyToAddress(keyPair.publicKey, Mijin_Test_Network);
	};

	const pickKeyPair = (privateKeys => {
		const keyPairs = privateKeys.map(privateKey => catapult.crypto.createKeyPairFromPrivateKeyString(privateKey));
		return () => keyPairs[crypto.randomBytes(1)[0] % privateKeys.length];
	})(Private_Keys);

	const createPayload = transfer => {
		if (options.type === 'rest')
			return { payload: serialize.toHex(modelCodec, transfer) };
		else if (options.type === 'node') {
			const data = Buffer.from(serialize.toHex(modelCodec, transfer), 'hex');
			const length = packetHeader.size + data.length;
			const header = packetHeader.createBuffer(PacketType.pushTransactions, length);
			const buffers = [header, data];
			return Buffer.concat(buffers, length);
		}

		return null;
	};

	const prepareTransferTransaction = txId => {
		const keyPair = pickKeyPair();
		const transfer = transactionFactory.createRandomTransfer(
			{ signerPublicKey: keyPair.publicKey, networkId: Mijin_Test_Network, transferId: txId },
			0 === options.predefinedRecipients ? randomRecipient : predefinedRecipient
		);
		transactionExtensions.sign(modelCodec, keyPair, transfer);
		return transfer;
	};

	const randomKeyPair = () => {
		const keySize = 32;
		const privateKey = crypto.randomBytes(keySize);
		return catapult.crypto.createKeyPairFromPrivateKeyString(catapult.utils.convert.uint8ToHex(privateKey));
	};

	const createTransfer = (signer, recipient, transferId, amount) => {
		const transfer = transactionFactory.createRandomTransfer(
			{ signerPublicKey: signer, networkId: Mijin_Test_Network, transferId },
			() => recipient
		);

		transfer.mosaics[0].amount = amount;
		return transfer;
	};

	const prepareAggregateTransaction = txId => {
		const keyPairSender = pickKeyPair();
		const numProxies = 1 + random.uint32(5);
		const keyPairs = Array.from(Array(numProxies), randomKeyPair);
		keyPairs.unshift(keyPairSender);

		const addresses = keyPairs.map(keyPair => address.publicKeyToAddress(keyPair.publicKey, Mijin_Test_Network));
		const transfers = [];

		for (let i = 0; i < numProxies; ++i) {
			transfers.push(createTransfer(
				keyPairs[i].publicKey,
				addresses[i + 1],
				txId,
				uint64.fromUint(((numProxies + 1 - i) * 1000000) + random.uint32(1000000))
			));
		}

		transfers.push(createTransfer(
			keyPairs[keyPairs.length - 1].publicKey,
			randomRecipient(),
			txId,
			uint64.fromUint(random.uint32(1000000))
		));

		const aggregate = transactionFactory.createAggregateTransaction(
			{ signerPublicKey: keyPairSender.publicKey, networkId: Mijin_Test_Network },
			transfers
		);

		keyPairs.shift();
		spammerUtils.signAndStitchAggregateTransaction(modelCodec, keyPairSender, keyPairs, aggregate);
		return aggregate;
	};

	if (options.help) {
		winston.info(spammerOptions.usage());
		process.exit();
	}

	const transactionFactories = {
		transfer: prepareTransferTransaction,
		aggregate: prepareAggregateTransaction
	};
	const createTransaction = transactionFactories[options.mode in transactionFactories ? options.mode : 'transfer'];

	{
		let cache = null;

		if (options.sameTransaction) {
			const transaction = createTransaction(0);
			cache = createPayload(transaction);
		}

		const interval = options.rate <= 0 ? 0 : 1000 / options.rate;
		let initTransaction = true;

		const sendTransaction = () => {
			// don't initiate more transactions than wanted. If a send fails txCounters.initiated will be decremented
			// and thus another transaction will be sent.
			if (txCounters.initiated >= options.total)
				return;

			let txData = cache;

			if (!cache) {
				const transaction = createTransaction(txCounters.initiated);
				txData = createPayload(transaction);
			}

			++txCounters.initiated;
			const callback = err => {
				if (err) {
					winston.error(`an error occurred while sending the transaction with id ${txCounters.initiated}`, err);
					--txCounters.initiated;
				} else {
					++txCounters.successful;
					logStats(txCounters);
				}

				if (initTransaction) {
					initTransaction = false;
					sendTransaction();
				}
			};

			if (options.type == 'rest') {
				client.put('/transaction', txData, callback);
				if (!initTransaction) {
					setTimeout(sendTransaction, interval);
				}
			} else if (options.type == 'node') {
				client.then(connection => connection.send(txData)).then(() => {
					callback();
					if (interval === 0) {
						sendTransaction();
					} else {
						setTimeout(sendTransaction, interval);
					}
				});
			}
		};

		sendTransaction();
	}
}
