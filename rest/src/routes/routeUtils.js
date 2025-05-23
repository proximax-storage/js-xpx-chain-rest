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

const catapult = require('catapult-sdk');
const dbFacade = require('./dbFacade');
const errors = require('../server/errors');
const routeResultTypes = require('./routeResultTypes');

const { address, networkInfo } = catapult.model;
const { buildAuditPath, indexOfLeafWithHash } = catapult.crypto.merkle;
const { convert, uint64 } = catapult.utils;
const packetHeader = catapult.packet.header;
const constants = {
	sizes: {
		hexPublicKey: 64,
		addressEncoded: 40,
		hash256: 32,
		hash512: 64,
		hexUint64: 16,
		blsPublicKey: 48,
	}
};

const isObjectId = str => 24 === str.length && convert.isHexString(str);

const namedParserMap = {
	objectId: str => {
		if (!isObjectId(str))
			throw Error('must be 12-byte hex string');

		return str;
	},
	uint: str => {
		const result = convert.tryParseUint(str);
		if (undefined === result)
			throw Error('must be non-negative number');

		return result;
	},
	uint64: str => uint64.fromString(str),
	uint64hex: str => uint64.fromHex(str),
	address: str => {
		if (constants.sizes.addressEncoded === str.length)
			return address.stringToAddress(str);

		throw Error(`invalid length of address '${str.length}'`);
	},
	publicKey: str => {
		if (constants.sizes.hexPublicKey === str.length)
			return convert.hexToUint8(str);

		throw Error(`invalid length of publicKey '${str.length}'`);
	},
	accountId: str => {
		if (constants.sizes.hexPublicKey === str.length)
			return ['publicKey', convert.hexToUint8(str)];
		else if (constants.sizes.addressEncoded === str.length)
			return ['address', address.stringToAddress(str)];

		throw Error(`invalid length of account id '${str.length}'`);
	},
	hash256: str => {
		if (2 * constants.sizes.hash256 === str.length)
			return convert.hexToUint8(str);

		throw Error(`invalid length of hash256 '${str.length}'`);
	},
	hash512: str => {
		if (2 * constants.sizes.hash512 === str.length)
			return convert.hexToUint8(str);

		throw Error(`invalid length of hash512 '${str.length}'`);
	},
	mosaicId: str => {
		try {
			return uint64.fromHex(str)
		} catch (err) {
			throw Error(`invalid mosaic id`);
		}
	},
	boolean: str => {
		if (('true' !== str) && ('false' !== str))
			throw Error('must be boolean value \'true\' or \'false\'');

		return 'true' === str;
	},
	blsPublicKey: str => {
		if (2 * constants.sizes.blsPublicKey === str.length)
			return convert.hexToUint8(str);

		throw Error(`invalid length of blsPublicKey '${str.length}'`);
	}
};

const getBoundedPageSize = (pageSize, optionsPageSize) =>
	Math.max(optionsPageSize.min, Math.min(optionsPageSize.max, pageSize || optionsPageSize.default));

const isPage = page => undefined !== page.data && undefined !== page.pagination.pageNumber && undefined !== page.pagination.pageSize;

const routeUtils = {
	namedParserMap: namedParserMap,
	/**
	 * Parses an argument and throws an invalid argument error if it is invalid.
	 * @param {object} args Container containing the argument to parse.
	 * @param {string} key Name of the argument to parse.
	 * @param {Function|string} parser Parser to use or the name of a named parser.
	 * @returns {object} Parsed value.
	 */
	parseArgument: (args, key, parser) => {
		try {
			return ('string' === typeof parser ? namedParserMap[parser] : parser)(args[key]);
		} catch (err) {
			throw errors.createInvalidArgumentError(`${key} has an invalid format`, err);
		}
	},

	/**
	 * Parses an argument as an array and throws an invalid argument error if any element is invalid.
	 * @param {object} args Container containing the argument to parse.
	 * @param {string} key Name of the argument to parse.
	 * @param {Function|string} parser Parser to use or the name of a named parser.
	 * @returns {object} Array with parsed values.
	 */
	parseArgumentAsArray: (args, key, parser) => {
		const realParser = 'string' === typeof parser ? namedParserMap[parser] : parser;
		if (!Array.isArray(args[key]))
			throw errors.createInvalidArgumentError(`${key} has an invalid format: not an array`);

		try {
			return args[key].map(realParser);
		} catch (err) {
			throw errors.createInvalidArgumentError(`element in array ${key} has an invalid format`, err);
		}
	},

	/**
	 * Parses optional paging arguments and throws an invalid argument error if any is invalid.
	 * @param {object} args Arguments to parse.
	 * @returns {object} Parsed paging options.
	 */
	parsePagingArguments: args => {
		const parsedOptions = { id: undefined, pageSize: 0 };
		const parsers = {
			id: { tryParse: str => (isObjectId(str) ? str : undefined), type: 'object id' },
			pageSize: { tryParse: convert.tryParseUint, type: 'unsigned integer' }
		};

		Object.keys(parsedOptions).filter(key => args[key]).forEach(key => {
			const parser = parsers[key];
			parsedOptions[key] = parser.tryParse(args[key]);
			if (!parsedOptions[key])
				throw errors.createInvalidArgumentError(`${key} is not a valid ${parser.type}`);
		});

		return parsedOptions;
	},

	/**
	 * Parses an optional uint argument
	 * @param {object} args Container containing the argument to parse.
	 * @param {string} key Name of the argument to parse.
	 * @returns {object} Parsed value.
	 */
	parseOptionalUintArgument: (args, key) => {
		if (args[key])
			return convert.tryParseUint(args[key]);

		return undefined
	},


	/**
	 * Generates valid page sizes from page size config.
	 * @param {object} config Page size config.
	 * @returns {object} Valid limits.
	 */
	generateValidPageSizes: config => {
		const pageSizes = [];
		const start = config.min + (0 === config.min % config.step ? 0 : config.step - (config.min % config.step));
		for (let pageSize = start; config.max >= pageSize; pageSize += config.step)
			pageSizes.push(pageSize);

		if (0 === pageSizes.length)
			throw Error('page size configuration does not specify any valid page sizes');

		return pageSizes;
	},

	/**
	 * Parses pagination arguments and throws an invalid argument error if any is invalid.
	 * @param {object} args Arguments to parse.
	 * @param {object} optionsPageSize Page size options.
	 * @returns {object} Parsed pagination options.
	 */
	parsePaginationArguments: (args, optionsPageSize) => {
		let sortBy = args.sortField || '_id';
		if (sortBy === 'id')
			sortBy = '_id';

		const parsedArgs = {
			offset: args.offset,
			sortField: sortBy,
			sortDirection: 'desc' === args.order ? -1 : 1
		};

		if (args.pageSize) {
			const numericPageSize = convert.tryParseUint(args.pageSize);
			if (undefined === numericPageSize)
				throw errors.createInvalidArgumentError('pageSize is not a valid unsigned integer');

			parsedArgs.pageSize = getBoundedPageSize(numericPageSize, optionsPageSize);
		} else {
			parsedArgs.pageSize = optionsPageSize.default;
		}

		if (args.pageNumber) {
			const numericPageNumber = convert.tryParseUint(args.pageNumber);
			if (undefined === numericPageNumber)
				throw errors.createInvalidArgumentError('pageNumber is not a valid unsigned integer');

			parsedArgs.pageNumber = numericPageNumber;
		}
		parsedArgs.pageNumber = 0 < parsedArgs.pageNumber ? parsedArgs.pageNumber : 1;

		if (args.offset && !isObjectId(args.offset))
			throw errors.createInvalidArgumentError('offset is not a valid object id');

		return parsedArgs;
	},

	/**
	 * Creates a sender for forwarding one or more objects of a given type.
	 * @param {module:routes/routeResultTypes} type Object type.
	 * @returns {object} Sender.
	 */
	createSender: type => ({
		/**
		 * Creates an array handler that forwards an array.
		 * @param {object} id Array identifier.
		 * @param {object} res Restify response object.
		 * @param {Function} next Restify next callback handler.
		 * @returns {Function} An appropriate array handler.
		 */
		sendArray(id, res, next) {
			return array => {
				if (!Array.isArray(array))
					res.send(errors.createInternalError(`error retrieving data for id: '${id}'`));
				else
					res.send({ payload: array, type });

				next();
			};
		},

		/**
		 * Creates an object handler that either forwards an object corresponding to an identifier
		 * or sends a not found error if no such object exists.
		 * @param {object} id Object identifier.
		 * @param {object} res Restify response object.
		 * @param {Function} next Restify next callback handler.
		 * @returns {Function} An appropriate object handler.
		 */
		sendOne(id, res, next) {
			const sendOneObject = object => {
				if (!object)
					res.send(errors.createNotFoundError(id));
				else
					res.send({ payload: object, type });
			};

			return object => {
				if (Array.isArray(object)) {
					if (2 <= object.length)
						res.send(errors.createInternalError(`error retrieving data for id: '${id}' (length ${object.length})`));
					else
						sendOneObject(object.length && object[0]);
				} else {
					sendOneObject(object);
				}

				next();
			};
		},

		/**
		 * Creates a page handler that forwards a paginated result.
		 * @param {object} res Restify response object.
		 * @param {Function} next Restify next callback handler.
		 * @returns {Function} An appropriate object handler.
		 */
		sendPage(res, next) {
			return page => {
				if (!isPage(page))
					res.send(errors.createInternalError('error retrieving data'));
				else
					res.send({ payload: page, type, structure: 'page' });
				next();
			};
		}
	}),

	/**
	 * Adds GET and POST routes for looking up documents of a single type.
	 * @param {object} server Server on which to register the routes.
	 * @param {object} sender Sender to use for sending the results.
	 * @param {object} routeInfo Information about the routes.
	 * @param {Function} documentRetriever Lookup function for retrieving the documents.
	 * @param {Function|string} parser Parser to use or the name of a named parser.
	 */
	addGetPostDocumentRoutes: (server, sender, routeInfo, documentRetriever, parser) => {
		const routes = {
			get: `${routeInfo.base}/:${routeInfo.singular}`,
			post: `${routeInfo.base}`
		};
		if (routeInfo.postfixes) {
			routes.get += `/${routeInfo.postfixes.singular}`;
			routes.post += `/${routeInfo.postfixes.plural}`;
		}

		server.get(routes.get, (req, res, next) => {
			const key = routeUtils.parseArgument(req.params, routeInfo.singular, parser);
			return documentRetriever([key]).then(sender.sendOne(req.params[routeInfo.singular], res, next));
		});

		server.post(routes.post, (req, res, next) => {
			const keys = routeUtils.parseArgumentAsArray(req.params, routeInfo.plural, parser);
			return documentRetriever(keys).then(sender.sendArray(req.params[routeInfo.plural], res, next));
		});
	},

	/**
	 * Adds PUT route for sending a packet to an api server.
 	 * @param {object} server Server on which to register the routes.
 	 * @param {object} connections Api server connection pool.
	 * @param {object} routeInfo Information about the route.
	 * @param {Function} parser Parser to use to parse the route parameters into a packet payload.
	 * @param {object} transactionCache Cache of transactions.
	 */
	addPutPacketRoute: (server, connections, routeInfo, parser, transactionCache) => {
		const createPacketFromBuffer = (data, packetType) => {
			const length = packetHeader.size + data.length;
			const header = packetHeader.createBuffer(packetType, length);
			const buffers = [header, Buffer.from(data)];
			return Buffer.concat(buffers, length);
		};

		let processTransaction = null;

		if (transactionCache) {
			processTransaction = function (packetBuffer, res, next) {
				transactionCache.addTransactionBuffer(packetBuffer);
				res.send(202, { message: `packet ${routeInfo.packetType} was pushed to the rest via ${routeInfo.routeName}` });
				next();
			};
		} else {
			processTransaction = function (packetBuffer, res, next) {
				return connections.lease()
					.then(connection => connection.send(packetBuffer))
					.then(() => {
						res.send(202, { message: `packet ${routeInfo.packetType} was pushed to the network via ${routeInfo.routeName}` });
						next();
					});
			};
		}

		server.put(routeInfo.routeName, (req, res, next) => {
			const packetBuffer = createPacketFromBuffer(parser(req.params), routeInfo.packetType);
			return processTransaction(packetBuffer, res, next);
		});
	},

	/**
	 * Returns function for processing merkle tree path requests.
	 * @param {module:db/CatapultDb} db Catapult database.
	 * @param {string} blockMetaCountField Field name for block meta count.
	 * @param {string} blockMetaTreeField Field name for block meta merkle tree.
	 * @returns {Function} Restify response function to process merkle path requests.
	 */
	blockRouteMerkleProcessor: (db, blockMetaCountField, blockMetaTreeField) => (req, res, next) => {
		const height = routeUtils.parseArgument(req.params, 'height', 'uint');
		const hash = routeUtils.parseArgument(req.params, 'hash', 'hash256');

		return dbFacade.runHeightDependentOperation(db, height, () => db.blockWithMerkleTreeAtHeight(height, blockMetaTreeField))
			.then(result => {
				if (!result.isRequestValid) {
					res.send(errors.createNotFoundError(height));
					return next();
				}

				const block = result.payload;
				if (!block.meta[blockMetaCountField]) {
					res.send(errors.createInvalidArgumentError(`hash '${req.params.hash}' not included in block height '${height}'`));
					return next();
				}

				const merkleTree = {
					count: block.meta[blockMetaCountField],
					nodes: block.meta[blockMetaTreeField].map(merkleHash => merkleHash.buffer)
				};

				if (0 > indexOfLeafWithHash(hash, merkleTree)) {
					res.send(errors.createInvalidArgumentError(`hash '${req.params.hash}' not included in block height '${height}'`));
					return next();
				}

				const merklePath = buildAuditPath(hash, merkleTree);

				res.send({
					payload: { merklePath },
					type: routeResultTypes.merkleProofInfo
				});

				return next();
			});
	}
};

module.exports = routeUtils;
