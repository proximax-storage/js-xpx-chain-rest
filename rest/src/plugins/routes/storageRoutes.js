/**
 *** Copyright 2021 ProximaX Limited. All rights reserved.
 *** Use of this source code is governed by the Apache 2.0
 *** license that can be found in the LICENSE file.
 **/

const routeUtils = require('../../routes/routeUtils');

module.exports = {
    register: (server, db) => {
		server.get('/drives', (res, next) => {
			return db.bcdrives(options)
				.then(result => routeUtils.createSender('bcDriveEntry').sendPage(res, next)(result));
		});

        server.get('/drive/:accountId', (req, res, next) => {
			const [type, accountId] = routeUtils.parseArgument(req.params, 'accountId', 'accountId');
			return db.getBcDriveByAccountId(type, accountId)
				.then(routeUtils.createSender('bcDriveEntry').sendOne(req.params.height, res, next));
		});

		server.get('/replicators', (res, next) => {
			return db.replicators(options)
				.then(result => routeUtils.createSender('replicatorEntry').sendPage(res, next)(result));
		});

		server.get('/replicator/:key', (req, res, next) => {
			const key = routeUtils.parseArgument(req.params, 'key', 'publicKey');
			return db.getReplicatorByPublicKey(key)
				.then(routeUtils.createSender('replicatorEntry').sendOne('key', res, next));
		});

		server.get('/downloads/:downloadChannelId', (req, res, next) => {
			const downloadChannelId = routeUtils.parseArgument(req.params, 'downloadChannelId', 'hash256');
			return db.getDownloadsByDownloadChannelId(downloadChannelId)
				.then(routeUtils.createSender('downloadChannelEntry').sendOne('downloadChannelId', res, next));
		});

		server.get('/account/:owner/drive', (req, res, next) => {
			const owner = routeUtils.parseArgument(req.params, 'owner', 'publicKey');
			return db.getBcDriveByOwnerPublicKey(owner)
				.then(routeUtils.createSender('bcDriveEntry').sendOne('owner', res, next));
		});
    }
};