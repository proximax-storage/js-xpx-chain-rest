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

const allRoutes = require('./routes/allRoutes');
const bootstrapper = require('./server/bootstrapper');
const catapult = require('catapult-sdk');
const CatapultDb = require('./db/CatapultDb');
const dbFormattingRules = require('./db/dbFormattingRules');
const formatters = require('./server/formatters');
const fs = require('fs');
const messageFormattingRules = require('./server/messageFormattingRules');
const routeSystem = require('./plugins/routeSystem');
const winston = require('winston');
const path = require('path');
const { createConnection } = require('net');
const { createConnectionService } = require('./connection/connectionService');
const { createTransactionCache } = require('./server/transactionCache');
const { createZmqConnectionService } = require('./connection/zmqService');

const configureLogging = config => {
	winston.remove(winston.transports.Console);
	if ('production' !== process.env.NODE_ENV)
		winston.add(new winston.transports.Console(config.console));

	winston.add(new winston.transports.File(config.file));
};

const loadConfig = () => {
	let configFilePath;
	if (2 >= process.argv.length)
		configFilePath = path.join(__dirname, '../resources/rest.json');
	else
		configFilePath = process.argv[2];

	winston.info(`loading config from ${configFilePath}`);
	const mainConfig = JSON.parse(fs.readFileSync(configFilePath, 'utf8'));

	var httpsConfig = {
		ca: null,
		certificate: null,
		key: null,
		passphrase: null
	}

	if ((mainConfig.https.certificate && mainConfig.https.key) ||
		(process.env.HTTPS_CERTIFICATE && process.env.HTTPS_KEY)) {
			
		const pathToCert = process.env.HTTPS_CERTIFICATE
						 ? process.env.HTTPS_CERTIFICATE
						 : path.join(__dirname, mainConfig.https.certificate);

		winston.info(`loading server certificate from ${pathToCert}`);
		const certificate = fs.readFileSync(pathToCert);

		httpsConfig.certificate = certificate;

		const pathToKey = process.env.HTTPS_KEY
						? process.env.HTTPS_KEY
						: path.join(__dirname, mainConfig.https.key);

		winston.info(`loading server private key from ${pathToKey}`);
		const key = fs.readFileSync(pathToKey);

		httpsConfig.key = key;

		httpsConfig.passphrase = process.env.HTTPS_PASSPHRASE
							   ? process.env.HTTPS_PASSPHRASE
							   : mainConfig.https.passphrase

		if (mainConfig.https.ca || process.env.HTTPS_CA) {
			const pathToCa = process.env.HTTPS_CA
						   ? process.env.HTTPS_CA
						   : path.join(__dirname, mainConfig.https.ca);

			winston.info(`loading CA certificate from ${pathToCa}`);
			const ca = fs.readFileSync(pathToCa);

			httpsConfig.ca = ca;
		}
	}

	return {
		mainConfig: mainConfig,
		httpsConfig: httpsConfig
	};
};

const createServiceManager = () => {
	const shutdownHandlers = [];
	return {
		pushService: (object, shutdownHandlerName) => {
			shutdownHandlers.push(() => { object[shutdownHandlerName](); });
		},
		stopAll: () => {
			while (0 < shutdownHandlers.length)
				shutdownHandlers.pop()();
		}
	};
};

const connectToDbWithRetry = (db, config) => catapult.utils.future.makeRetryable(
	() => db.connect(config.url, config.name),
	config.maxConnectionAttempts,
	(i, err) => {
		const waitTime = (2 ** (i - 1)) * config.baseRetryDelay;
		winston.warn(`db connection failed, retrying in ${waitTime}ms`, err);
		return waitTime;
	}
);

const createServer = config => {
	const modelSystem = catapult.plugins.catapultModelSystem.configure(config.mainConfig.extensions, {
		json: dbFormattingRules,
		ws: messageFormattingRules
	});
	return {
		server: bootstrapper.createServer(config.mainConfig.crossDomainHttpMethods, formatters.create(modelSystem.formatters), config.mainConfig.cors, config.mainConfig.throttling, config.httpsConfig, config.mainConfig.endpoints),
		codec: modelSystem.codec
	};
};

const registerRoutes = (server, db, services) => {
	// 1. create a services view for extension routes
	const servicesView = {
		config: {
			network: services.config.mainConfig.network,
			pageSize: {
				min: services.config.mainConfig.db.pageSizeMin,
				max: services.config.mainConfig.db.pageSizeMax,
				step: services.config.mainConfig.db.pageSizeStep
			},
			apiNode: services.config.mainConfig.apiNode,
			websocket: services.config.mainConfig.websocket
		},
		connections: services.connectionService,
		transactionCache: services.transactionCache
	};

	// 2. configure extension routes
	const { transactionStates, messageChannelDescriptors } = routeSystem.configure(services.config.mainConfig.extensions, server, db, servicesView);

	// 3. augment services with extension-dependent config and services
	servicesView.config.transactionStates = transactionStates;
	servicesView.zmqService = createZmqConnectionService(services.config.mainConfig.websocket.mq, services.codec, messageChannelDescriptors, winston);

	// 4. configure basic routes
	allRoutes.register(server, db, servicesView);
};

(() => {
	const config = loadConfig();
	configureLogging(config.mainConfig.logging);

	const network = catapult.model.networkInfo.networks[config.mainConfig.network.name];
	if (!network) {
		winston.error(`no network found with name: '${config.mainConfig.network.name}'`);
		return;
	}

	const serviceManager = createServiceManager();
	const db = new CatapultDb({
		networkId: network.id,
		pageSizeMin: config.mainConfig.db.pageSizeMin,
		pageSizeMax: config.mainConfig.db.pageSizeMax
	});

	serviceManager.pushService(db, 'close');

	winston.info(`connecting to ${config.mainConfig.db.url} (database:${config.mainConfig.db.name})`);
	connectToDbWithRetry(db, config.mainConfig.db)
		.then(() => {
			winston.info('registering routes');
			const serverAndCodec = createServer(config);
			const { server } = serverAndCodec;
			serviceManager.pushService(server, 'close');

			const connectionService = createConnectionService(config.mainConfig, createConnection, catapult.auth.createAuthPromise, winston.verbose);
			let transactionCache = null;
			if (config.mainConfig.transactionCache)
				transactionCache = createTransactionCache(config.mainConfig.transactionCache, connectionService, winston.verbose);

			registerRoutes(server, db, {
				codec: serverAndCodec.codec, config, connectionService, transactionCache
			});

			winston.info(`listening on port ${config.mainConfig.port}`);
			server.listen(config.mainConfig.port);
		})
		.catch(err => {
			winston.error('rest server is exiting due to error', err);
			serviceManager.stopAll();
		});

	process.on('SIGINT', () => {
		winston.info('SIGINT detected, shutting down rest server');
		serviceManager.stopAll();
	});
})();
