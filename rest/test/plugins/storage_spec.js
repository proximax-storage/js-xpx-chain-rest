/**
 *** Copyright 2021 ProximaX Limited. All rights reserved.
 *** Use of this source code is governed by the Apache 2.0
 *** license that can be found in the LICENSE file.
 **/

 const storage = require('../../src/plugins/storage');
 const StorageDb = require('../../src/plugins/db/StorageDb');
 const pluginTest = require('./utils/pluginTestUtils');
 const { test } = require('../routes/utils/routeTestUtils');
 
 describe('storage plugin', () => {
     pluginTest.assertThat.pluginCreatesDb(storage, StorageDb);
     pluginTest.assertThat.pluginDoesNotRegisterAdditionalTransactionStates(storage);
 
     describe('register routes', () => {
         it('registers storage GET routes', () => {
             // Arrange:
             const routes = [];
             const server = test.setup.createCapturingMockServer('get', routes);
 
             // Act:
             storage.registerRoutes(server, {});
 
             // Assert:
             test.assert.assertRoutes(routes, [
                '/drivesV2',
                '/driveV2/:accountId',
                '/replicatorsV2',
                '/replicatorV2/:publicKey',
                '/downloadsV2',
                '/downloadsV2/:downloadChannelId',
                '/downloadsV2/:consumerKey',
                '/accountV2/:owner/drive',
                '/accountV2/:blsKey/replicator',
             ]);
         });
     });
 });
 