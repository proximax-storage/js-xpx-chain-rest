/**
 *** Copyright 2019 ProximaX Limited. All rights reserved.
 *** Use of this source code is governed by the Apache 2.0
 *** license that can be found in the LICENSE file.
 **/

const routeUtils = require('../../routes/routeUtils');
const {convertToLong} = require("../../db/dbUtils");

const parseHeight = params => routeUtils.parseArgument(params, 'height', 'uint');

module.exports = {
	register: (server, db, services) => {
		const validOperator = ["eq", "lt", "gt", "lte", "gte"];
		server.get('/config/:height', (req, res, next) => {
			const height = parseHeight(req.params);
			return db.configsLessOrEqualThanHeight(height, 1 /* limit */)
				.then(routeUtils.createSender('networkConfigEntry').sendOne(req.params.height, res, next));
		});

		server.get('/config', (req, res, next) => {
			const { params } = req;
			const height = parseHeight(params);
			let minHeight
			if(params.minHeight) {
				minHeight = routeUtils.parseArgument(req.params, 'minHeight', 'uint');
				let operation = {
					$gte : convertToLong(minHeight),
					$lte : convertToLong(height)
				};
				const options = routeUtils.parsePaginationArguments(params, services.config.pageSize, { id: 'objectId' });
				return db.networkConfigurations(operation, options)
					.then(result => routeUtils.createSender('networkConfigEntry').sendPage(res, next)(result));
			}
			const evaluator = params["operator"];
			if(!validOperator.includes(evaluator))
				throw errors.createInvalidArgumentError(
					'Invalid comparison operator'
				);
			const operator = "$"+evaluator;
			let operation = { [operator] : convertToLong(height) };
			const options = routeUtils.parsePaginationArguments(params, services.config.pageSize, { id: 'objectId' });
			return db.networkConfigurations(operation, options)
				.then(result => routeUtils.createSender('networkConfigEntry').sendPage(res, next)(result));
		});
	}
};
