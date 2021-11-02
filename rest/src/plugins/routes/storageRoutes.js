/**
 *** Copyright 2021 ProximaX Limited. All rights reserved.
 *** Use of this source code is governed by the Apache 2.0
 *** license that can be found in the LICENSE file.
 **/

const routeUtils = require('../../routes/routeUtils');

module.exports = {
    register: (server, db) => {
		server.get('/drivesV2', (req, res, next) => {
			const { params } = req;
			
			const filters = {
				fromSize: params.fromSize ? routeUtils.parseArgumentAsArray(params, 'fromSize', 'uint') : undefined,
				fromUsedSize: params.fromUsedSize ? routeUtils.parseArgumentAsArray(params, 'fromUsedSize', 'uint') : undefined,
				fromMetaFilesSize: params.fromMetaFilesSize ? routeUtils.parseArgumentAsArray(params, 'fromMetaFilesSize', 'uint') : undefined,
				fromReplicatorCount: params.fromReplicatorCount ? routeUtils.parseArgumentAsArray(params, 'fromReplicatorCount', 'uint') : undefined
			};

			const options = routeUtils.parsePaginationArguments(params, storage.config.pageSize);

			return db.bcdrives(filters, options)
				.then(result => routeUtils.createSender('bcDriveEntry').sendPage(res, next)(result));
		});

        server.get('/driveV2/:accountId', (req, res, next) => {
			const [type, accountId] = routeUtils.parseArgument(req.params, 'accountId', 'accountId');
			return db.getBcDriveByAccountId(type, accountId)
				.then(routeUtils.createSender('bcDriveEntry').sendOne(req.params.height, res, next));
		});

		server.get('/replicatorsV2', (req, res, next) => {
			const { params } = req;
			
			const filters = {
				fromVersion: params.fromVersion ? routeUtils.parseArgumentAsArray(params, 'fromVersion', 'uint') : undefined,
				fromCapacity: params.fromCapacity ? routeUtils.parseArgumentAsArray(params, 'fromCapacity', 'uint') : undefined
			};

			const options = routeUtils.parsePaginationArguments(params, storage.config.pageSize);

			return db.replicators(filters, options)
				.then(result => routeUtils.createSender('replicatorEntry').sendPage(res, next)(result));
		});

		server.get('/replicatorV2/:publicKey', (req, res, next) => {
			const key = routeUtils.parseArgument(req.params, 'key', 'publicKey');
			return db.getReplicatorByPublicKey(key)
				.then(routeUtils.createSender('replicatorEntry').sendOne('key', res, next));
		});

		server.get('/downloadsV2', (req, res, next) => {
			const { params } = req;
			
			const filters = {
				fromDownloadSize: params.fromDownloadSize ? routeUtils.parseArgumentAsArray(params, 'fromDownloadSize', 'uint') : undefined,
				fromDownloadApprovalCount: params.fromDownloadApprovalCount ? routeUtils.parseArgumentAsArray(params, 'fromDownloadApprovalCount', 'uint') : undefined
			};

			const options = routeUtils.parsePaginationArguments(params, storage.config.pageSize);

			return db.downloadChannels(filters, options)
			.then(result => routeUtils.createSender('downloadChannelEntry').sendPage(res, next)(result));
		});

		server.get('/downloadsV2/:downloadChannelId', (req, res, next) => {
			const pagingOptions = routeUtils.parsePagingArguments(req.params);
			const downloadChannelId = routeUtils.parseArgument(req.params, 'downloadChannelId', 'hash256');
			return db.getDownloadsByDownloadChannelId(downloadChannelId, pagingOptions.id, pagingOptions.pageSize)
				.then(routeUtils.createSender('downloadChannelEntry').sendArray('downloadChannelId', res, next));
		});

		server.get('/downloadsV2/:consumerKey', (req, res, next) => {
			const consumer = routeUtils.parseArgument(req.params, 'consumer', 'publicKey');
			return db.getDownloadsByConsumerPublicKey(consumer)
				.then(routeUtils.createSender('downloadChannelEntry').sendOne('consumer', res, next));
		});

		server.get('/accountV2/:owner/drive', (req, res, next) => {
			const owner = routeUtils.parseArgument(req.params, 'owner', 'publicKey');
			return db.getBcDriveByOwnerPublicKey(owner)
				.then(routeUtils.createSender('bcDriveEntry').sendOne('owner', res, next));
		});

		server.get('/accountV2/:blsKey/replicator', (req, res, next) => {
			const blsKey = routeUtils.parseArgument(req.params, 'blsKey', 'blsPublicKey');
			return db.getReplicatorByBlsKey(blsKey)
				.then(routeUtils.createSender('replicatorEntry').sendOne('blsKey', res, next));
		});
    }
};