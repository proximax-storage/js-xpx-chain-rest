/**
 *** Copyright 2021 ProximaX Limited. All rights reserved.
 *** Use of this source code is governed by the Apache 2.0
 *** license that can be found in the LICENSE file.
 **/

const routeUtils = require('../../routes/routeUtils');
const winston = require('winston');

module.exports = {
    register: (server, db, service) => {
		server.get('/drives_v2', (req, res, next) => {
			const { params } = req;
			
			const filters = {
				size: params.size ? routeUtils.parseArgument(params, 'size', 'uint64') : undefined,
				fromSize: params.fromSize ? routeUtils.parseArgument(params, 'fromSize', 'uint64') : undefined,
				toSize: params.toSize ? routeUtils.parseArgument(params, 'toSize', 'uint64') : undefined,

				usedSize: params.usedSize ? routeUtils.parseArgument(params, 'usedSize', 'uint64') : undefined,
				fromUsedSize: params.fromUsedSize ? routeUtils.parseArgument(params, 'fromUsedSize', 'uint64') : undefined,
				toUsedSize: params.toUsedSize ? routeUtils.parseArgument(params, 'toUsedSize', 'uint64') : undefined,

				metaFilesSize: params.metaFilesSize ? routeUtils.parseArgument(params, 'metaFilesSize', 'uint64') : undefined,
				fromMetaFilesSize: params.fromMetaFilesSize ? routeUtils.parseArgument(params, 'fromMetaFilesSize', 'uint64') : undefined,
				toMetaFilesSize: params.toMetaFilesSize ? routeUtils.parseArgument(params, 'toMetaFilesSize', 'uint64') : undefined,

				replicatorCount: params.replicatorCount ? routeUtils.parseArgument(params, 'replicatorCount', 'uint16') : undefined,
				fromReplicatorCount: params.fromReplicatorCount ? routeUtils.parseArgument(params, 'fromReplicatorCount', 'uint16') : undefined,
				toReplicatorCount: params.toReplicatorCount ? routeUtils.parseArgument(params, 'toReplicatorCount', 'uint16') : undefined
			};

			const options = routeUtils.parsePaginationArguments(params, service.config.pageSize);

			return db.bcdrives(filters, options)
				.then(result => routeUtils.createSender('bcDriveEntry').sendPage(res, next)(result));
		});

        server.get('/drives_v2/:accountId', (req, res, next) => {
			const [type, accountId] = routeUtils.parseArgument(req.params, 'accountId', 'accountId');
			return db.getBcDriveByAccountId(type, accountId)
				.then(routeUtils.createSender('bcDriveEntry').sendOne(req.params.accountId, res, next));
		});

		server.get('/replicators_v2', (req, res, next) => {
			const { params } = req;

			const filters = {
				version: params.version ? routeUtils.parseArgument(params, 'version', 'uint32') : undefined,
				fromVersion: params.fromVersion ? routeUtils.parseArgument(params, 'fromVersion', 'uint32') : undefined,
				toVersion: params.toVersion ? routeUtils.parseArgument(params, 'toVersion', 'uint32') : undefined,

				capacity: params.capacity ? routeUtils.parseArgument(params, 'capacity', 'uint64') : undefined,
				fromCapacity: params.fromCapacity ? routeUtils.parseArgument(params, 'fromCapacity', 'uint64') : undefined,
				toCapacity: params.toCapacity ? routeUtils.parseArgument(params, 'toCapacity', 'uint64') : undefined
			};

			const options = routeUtils.parsePaginationArguments(params, service.config.pageSize);

			return db.replicators(filters, options)
				.then(result => routeUtils.createSender('replicatorEntry').sendPage(res, next)(result));
		});

		server.get('/replicators_v2/:publicKey', (req, res, next) => {
			const key = routeUtils.parseArgument(req.params, 'publicKey', 'publicKey');
			return db.getReplicatorByPublicKey(key)
				.then(routeUtils.createSender('replicatorEntry').sendOne('publicKey', res, next));
		});

		server.get('/downloads_v2', (req, res, next) => {
			const { params } = req;
			
			const filters = {
				downloadSize: params.downloadSize ? routeUtils.parseArgument(params, 'downloadSize', 'uint64') : undefined,
				fromDownloadSize: params.fromDownloadSize ? routeUtils.parseArgument(params, 'fromDownloadSize', 'uint64') : undefined,
				toDownloadSize: params.toDownloadSize ? routeUtils.parseArgument(params, 'toDownloadSize', 'uint64') : undefined,

				downloadApprovalCount: params.downloadApprovalCount ? routeUtils.parseArgument(params, 'downloadApprovalCount', 'uint16') : undefined,
				fromDownloadApprovalCount: params.fromDownloadApprovalCount ? routeUtils.parseArgument(params, 'fromDownloadApprovalCount', 'uint16') : undefined,
				toDownloadApprovalCount: params.toDownloadApprovalCount ? routeUtils.parseArgument(params, 'toDownloadApprovalCount', 'uint16') : undefined,

				consumerKey: params.consumerKey ? routeUtils.parseArgument(req.params, 'consumerKey', 'publicKey') : undefined
			};

			const options = routeUtils.parsePaginationArguments(params, service.config.pageSize);

			return db.downloadChannels(filters, options)
			.then(result => routeUtils.createSender('downloadChannelEntry').sendPage(res, next)(result));
		});

		server.get('/downloads_v2/:downloadChannelId', (req, res, next) => {
			const pagingOptions = routeUtils.parsePagingArguments(req.params);
			const downloadChannelId = routeUtils.parseArgument(req.params, 'downloadChannelId', 'hash256');
			return db.getDownloadsByDownloadChannelId(downloadChannelId, pagingOptions.id, pagingOptions.pageSize)
				.then(routeUtils.createSender('downloadChannelEntry').sendArray('downloadChannelId', res, next));
		});

		server.get('/account/:owner/drives_v2', (req, res, next) => {
			const pagingOptions = routeUtils.parsePagingArguments(req.params);
			const owner = routeUtils.parseArgument(req.params, 'owner', 'publicKey');
			return db.getBcDrivesByOwnerPublicKey(owner, pagingOptions.id, pagingOptions.pageSize)
				.then(routeUtils.createSender('bcDriveEntry').sendArray('owner', res, next));
		});

		server.get('/account/:blsKey/replicators_v2', (req, res, next) => {
			const blsKey = routeUtils.parseArgument(req.params, 'blsKey', 'blsPublicKey');
			return db.getReplicatorByBlsKey(blsKey)
				.then(routeUtils.createSender('replicatorEntry').sendOne('blsKey', res, next));
		});
    }
};