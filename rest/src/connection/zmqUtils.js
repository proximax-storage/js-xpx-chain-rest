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

const EventEmitter = require('events');

const logAllMonitorEvents = (zsocket, throttle, logger) => {
	const eventNameLevelPairs = {
		connect: 'info',
		connect_delay: 'debug',
		connect_retry: 'info',

		listen: 'debug',
		bind_error: 'error',
		accept: 'debug',
		accept_error: 'error',
		close: 'info',
		close_error: 'error',
		disconnect: 'warn',

		monitor_error: 'error'
	};

	const createLogHandler = (name, level) => {
		let lastTime;
		return (value, endpoint) => {
			const currentTime = new Date();
			const shouldThrottle = undefined !== lastTime && throttle > currentTime - lastTime;
			lastTime = currentTime;

			// skip this noisy log
			if (shouldThrottle)
				return;

			const formattedValue = undefined === value ? '' : ` (${value})`;
			logger[level](`zmq ${zsocket.key}: ${name} ${endpoint}${formattedValue}`);
		};
	};
	Object.keys(eventNameLevelPairs).forEach(eventName => {
		zsocket.on(eventName, createLogHandler(eventName, eventNameLevelPairs[eventName]));
	});
};

module.exports = {
	/**
	 * Prepares a zmq socket for a connection.
	 * @param {zmq.Socket} zsocket Zmq socket.
	 * @param {object} zmqConfig Zmq configuration.
	 * @param {logger} logger Level-based logger object.
	 */
	prepareZsocket: (zsocket, zmqConfig, logger) => {
		// override close to
		// 1. call unmonitor (required because of monitor call below)
		// 2. raise a zsocket_close event (cannot use 'close' because zmq monitor is already using 'close' to signal something else)
		let connectTimeoutTimerId;
		const originalZsocketClose = zsocket.close;
		zsocket.close = () => {
			// prevent the timer from attempting another close (zmq socket close is not idempotent and can only be called once)
			clearTimeout(connectTimeoutTimerId);

			zsocket.unmonitor();
			originalZsocketClose.call(zsocket);
			zsocket.emit('zsocket_close');
		};

		const closeWithError = (message, err) => {
			logger.error(`zmq : ${message}`, err);
			zsocket.close();
		};

		// log all monitor events
		logAllMonitorEvents(zsocket, zmqConfig.monitorLoggingThrottle, logger);

		// zmq js still forwards errors to error event that need to be handled
		zsocket.on('error', err => {
			closeWithError('error from zsocket', err);
		});

		// zmq appears to attempt to connect to a socket forever, so add some timeout
		connectTimeoutTimerId = setTimeout(() => {
			closeWithError('connection attempt timed out');
		}, zmqConfig.connectTimeout);

		zsocket.once('connect', () => {
			clearTimeout(connectTimeoutTimerId);
		});

		// enable monitoring (0 => read all events each interval)
		zsocket.monitor(zmqConfig.monitorInterval, 0);
	},

	/**
	 * Creates a multisocket emitter.
	 * @param {function} zsocketFactory Factory for creating a zmq socket given a key.
	 * @param {function} subcriptionInfoFactory Factory for creating a subcription info.
	 * @param {object} logger It is logger=).
	 * @param {function} resolver Topic's resolver.
	 * @returns {object} Event emitter with partial interface (on, removeAllListeners, listenerCount).
	 */
	createMultisocketEmitter: (zsocketFactory, subcriptionInfoFactory, logger, resolver) => {
		const emitter = new EventEmitter();
		let zsocket = null;
		const subscriptions = {};
		const handlers = {};

		function handle(unresolvedTopic, buffer, ...args) {
			const resolvedTopic = resolver ? resolver(unresolvedTopic, buffer, ...args) : unresolvedTopic;
			const handler = handlers[resolvedTopic.toString()];

			if (handler)
				handler(...arguments);
		}

		let multisocketEmitter = null;

		const closeZSocket = () => {
			logger.info('closeZSocket');
			zsocket = null;
			Object.keys(subscriptions).forEach(key => {
				multisocketEmitter.removeAllListeners(key);
			});
		};

		const getZSocket = () => {
			if (!zsocket) {
				zsocket = zsocketFactory();
				zsocket.subscribe('');
				zsocket.on('message', handle);
				zsocket.on('zsocket_close', () => {
					closeZSocket();
				});
			}

			return zsocket;
		};

		zsocket = getZSocket();
		const isSubEvent = key => -1 !== key.indexOf('.');
		const isValidSubEvent = key => key.endsWith('.close');
		multisocketEmitter = {
			on: (key, callback) => {
				if (!getZSocket())
					throw Error(`zsocket was not created for ${key}`);

				if (isSubEvent(key)) {
					if (!isValidSubEvent(key))
						throw Error(`${key} indicates an unsupported subevent`);
				} else if (!(key in subscriptions)) {
					logger.info(`subscribing to ${key}`);
					const info = subcriptionInfoFactory(key, emitter);
					subscriptions[key] = info;
					handlers[info.filter.toString()] = info.handler;
				}

				emitter.on(key, callback);
			},

			removeAllListeners: key => {
				if (isSubEvent(key))
					throw Error(`${key} must be a channel`);

				logger.info(`unsubscribing to ${key}`);
				emitter.emit(`${key}.close`);
				emitter.removeAllListeners(key);
				emitter.removeAllListeners(`${key}.close`);
				if (!(key in subscriptions))
					return;

				const info = subscriptions[key];
				delete handlers[info.filter];
				delete subscriptions[key];

				if (0 === multisocketEmitter.zsocketCount() && zsocket)
					multisocketEmitter.close();
			},

			listenerCount: key => emitter.listenerCount(key),

			/**
			  * Gets the number of active subscriptions.
			  * @returns {numeric} Number of active subscriptions.
			  */
			zsocketCount: () => Object.keys(subscriptions).length,

			/**
			 * Closes all subscriptions and zsocket.
			 */
			close: () => {
				if (zsocket) {
					zsocket.close();
					closeZSocket();
				}
			}
		};

		return multisocketEmitter;
	}
};
