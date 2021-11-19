/**
 *** Copyright 2021 ProximaX Limited. All rights reserved.
 *** Use of this source code is governed by the Apache 2.0
 *** license that can be found in the LICENSE file.
 **/

const routeUtils = require('../../routes/routeUtils');
const winston = require('winston');

module.exports = {
    register: (server, db, storage) => {
		server.get('/drives_v2', (req, res, next) => {
			const { params } = req;
			
			const filters = {
				size: params.size ? routeUtils.parseArgumentAsArray(params, 'size', 'uint64') : undefined,
				fromSize: params.fromSize ? routeUtils.parseArgumentAsArray(params, 'fromSize', 'uint64') : undefined,
				toSize: params.toSize ? routeUtils.parseArgumentAsArray(params, 'toSize', 'uint64') : undefined,

				usedSize: params.usedSize ? routeUtils.parseArgumentAsArray(params, 'usedSize', 'uint64') : undefined,
				fromUsedSize: params.fromUsedSize ? routeUtils.parseArgumentAsArray(params, 'fromUsedSize', 'uint64') : undefined,
				toUsedSize: params.toUsedSize ? routeUtils.parseArgumentAsArray(params, 'toUsedSize', 'uint64') : undefined,

				metaFilesSize: params.metaFilesSize ? routeUtils.parseArgumentAsArray(params, 'metaFilesSize', 'uint64') : undefined,
				fromMetaFilesSize: params.fromMetaFilesSize ? routeUtils.parseArgumentAsArray(params, 'fromMetaFilesSize', 'uint64') : undefined,
				toMetaFilesSize: params.toMetaFilesSize ? routeUtils.parseArgumentAsArray(params, 'toMetaFilesSize', 'uint64') : undefined,

				replicatorCount: params.replicatorCount ? routeUtils.parseArgumentAsArray(params, 'replicatorCount', 'uint16') : undefined,
				fromReplicatorCount: params.fromReplicatorCount ? routeUtils.parseArgumentAsArray(params, 'fromReplicatorCount', 'uint16') : undefined,
				toReplicatorCount: params.toReplicatorCount ? routeUtils.parseArgumentAsArray(params, 'toReplicatorCount', 'uint16') : undefined
			};

			const options = routeUtils.parsePaginationArguments(params, storage.config.pageSize);

			return db.bcdrives(filters, options)
				.then(result => routeUtils.createSender('bcDriveEntry').sendPage(res, next)(result));
		});

        server.get('/drive_v2/:accountId', (req, res, next) => {
			const [type, accountId] = routeUtils.parseArgument(req.params, 'accountId', 'accountId');
			return db.getBcDriveByAccountId(type, accountId)
				.then(routeUtils.createSender('bcDriveEntry').sendOne(req.params.height, res, next));
		});

		server.get('/replicators_v2', (req, res, next) => {
			const { params } = req;

			const filters = {
				version: params.version ? routeUtils.parseArgumentAsArray(params, 'version', 'uint32') : undefined,
				fromVersion: params.fromVersion ? routeUtils.parseArgumentAsArray(params, 'fromVersion', 'uint32') : undefined,
				toVersion: params.toVersion ? routeUtils.parseArgumentAsArray(params, 'toVersion', 'uint32') : undefined,

				capacity: params.capacity ? routeUtils.parseArgumentAsArray(params, 'capacity', 'uint64') : undefined,
				fromCapacity: params.fromCapacity ? routeUtils.parseArgumentAsArray(params, 'fromCapacity', 'uint64') : undefined,
				toCapacity: params.toCapacity ? routeUtils.parseArgumentAsArray(params, 'toCapacity', 'uint64') : undefined
			};

			const options = routeUtils.parsePaginationArguments(params, storage.config.pageSize);

			return db.replicators(filters, options)
				.then(result => routeUtils.createSender('replicatorEntry').sendPage(res, next)(result));
		});

		server.get('/replicator_v2/:publicKey', (req, res, next) => {
			const key = routeUtils.parseArgument(req.params, 'publicKey', 'publicKey');
			return db.getReplicatorByPublicKey(key)
				.then(routeUtils.createSender('replicatorEntry').sendOne('publicKey', res, next));
		});

		server.get('/downloads_v2', (req, res, next) => {
			const { params } = req;
			
			const filters = {
				downloadSize: params.downloadSize ? routeUtils.parseArgumentAsArray(params, 'downloadSize', 'uint64') : undefined,
				fromDownloadSize: params.fromDownloadSize ? routeUtils.parseArgumentAsArray(params, 'fromDownloadSize', 'uint64') : undefined,
				toDownloadSize: params.toDownloadSize ? routeUtils.parseArgumentAsArray(params, 'toDownloadSize', 'uint64') : undefined,

				downloadApprovalCount: params.downloadApprovalCount ? routeUtils.parseArgumentAsArray(params, 'downloadApprovalCount', 'uint16') : undefined,
				fromDownloadApprovalCount: params.fromDownloadApprovalCount ? routeUtils.parseArgumentAsArray(params, 'fromDownloadApprovalCount', 'uint16') : undefined,
				toDownloadApprovalCount: params.toDownloadApprovalCount ? routeUtils.parseArgumentAsArray(params, 'toDownloadApprovalCount', 'uint16') : undefined
			};

			const options = routeUtils.parsePaginationArguments(params, storage.config.pageSize);

			return db.downloadChannels(filters, options)
			.then(result => routeUtils.createSender('downloadChannelEntry').sendPage(res, next)(result));
		});

		server.get('/downloads_v2/:downloadChannelId', (req, res, next) => {
			const pagingOptions = routeUtils.parsePagingArguments(req.params);
			const downloadChannelId = routeUtils.parseArgument(req.params, 'downloadChannelId', 'hash256');
			return db.getDownloadsByDownloadChannelId(downloadChannelId, pagingOptions.id, pagingOptions.pageSize)
				.then(routeUtils.createSender('downloadChannelEntry').sendArray('downloadChannelId', res, next));
		});

		server.get('/account_v2/:owner/drive', (req, res, next) => {
			const owner = routeUtils.parseArgument(req.params, 'owner', 'publicKey');
			return db.getBcDriveByOwnerPublicKey(owner)
				.then(routeUtils.createSender('bcDriveEntry').sendOne('owner', res, next));
		});

		server.get('/account_v2/:blsKey/replicator', (req, res, next) => {
			const blsKey = routeUtils.parseArgument(req.params, 'blsKey', 'blsPublicKey');
			return db.getReplicatorByBlsKey(blsKey)
				.then(routeUtils.createSender('replicatorEntry').sendOne('blsKey', res, next));
		});

		server.get('/account_v2/:consumerKey/download', (req, res, next) => {
			const pagingOptions = routeUtils.parsePagingArguments(req.params);
			const consumer = routeUtils.parseArgument(req.params, 'consumerKey', 'publicKey');
			return db.getDownloadsByConsumerPublicKey(consumer, pagingOptions.id, pagingOptions.pageSize)
				.then(routeUtils.createSender('downloadChannelEntry').sendArray('consumerKey', res, next));
		});
    }
};