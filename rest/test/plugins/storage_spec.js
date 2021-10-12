/**
 *** Copyright 2021 ProximaX Limited. All rights reserved.
 *** Use of this source code is governed by the Apache 2.0
 *** license that can be found in the LICENSE file.
 **/

 const storage = require('../../src/plugins/storage');
 const StorageDb = require('../../src/plugins/db/StorageDb');
 const pluginTest = require('./utils/pluginTestUtils');
 const catapult = require('catapult-sdk');
 const { test } = require('../routes/utils/routeTestUtils');
 const { expect } = require('chai');
 
 const { address, networkInfo } = catapult.model;
 
 const addressToString = (address) => catapult.model.address.addressToString(address);
 
 describe('storage plugin', () => {
     pluginTest.assertThat.pluginCreatesDb(storage, StorageDb);
     pluginTest.assertThat.pluginDoesNotRegisterAdditionalTransactionStates(storage);
 
     describe('register message channels', () => {
         const registerAndExtractChannelDescriptor = channelDescriptorName => {
             // Arrange:
             const channelDescriptors = [];
             const channelResolvers = [];
             const builder = {
                 add: (name, markerChar, handler, channelFilter) => { channelDescriptors.push({ name, markerChar, handler, channelFilter }); },
                 addResolver: (topic, resolver) => { channelResolvers.push({ topic, resolver }); }
             };
             const services = {
                 config: { network: { name: 'mijinTest' } }
             };
 
             // Act:
             storage.registerMessageChannels(builder, services);
             const channelDescriptor = channelDescriptors.find(descriptor => channelDescriptorName === descriptor.name);
 
             // Sanity:
             expect(channelDescriptors.length).to.equal(1);
             expect(channelResolvers.length).to.equal(1);
             expect(channelDescriptor).to.not.equal(undefined);
             expect(channelResolvers).to.not.equal(undefined);
             return channelDescriptor;
         };
 
         it('registers driveState', () => {
             // Act:
             const descriptor = registerAndExtractChannelDescriptor('driveState');
 
             // Assert:
             expect(descriptor.name).to.equal('driveState');
             expect(descriptor.markerChar).to.equal('d');
         });
 
         it('handler emits drive state', () => {
             // Arrange:
             const emitted = [];
             const { handler } = registerAndExtractChannelDescriptor('driveState');
             const driveKey = test.random.publicKey();
             const driveAddress = address.publicKeyToAddress(driveKey, networkInfo.networks.mijinTest.id);
             const filter = addressToString(driveAddress);
 
             // Act:
             const buffer = Buffer.concat([
                 Buffer.of(0x5B, 0x0, 0x0, 0x0),
                 Buffer.of(0x5B, 0x0, 0x0, 0x0),
                 Buffer.of(0x5B, 0x61),
                 driveKey,
                 Buffer.of(0x02)
             ]);
             handler({}, eventData => emitted.push(eventData), filter)([0x01, 0x02], buffer, 'ignored data');
 
             // Assert:
             expect(emitted.length).to.equal(1);
             expect(emitted[0]).to.deep.equal({
                 type: 'storage.driveStateWithMetadata',
                 payload: {
                     driveKey,
                     state: 0x02,
                     meta: {
                         channelName: 'driveState',
                         address: driveAddress,
                     }
                 }
             });
         });
     });
 
     describe('register routes', () => {
         it('registers storage GET routes', () => {
             // Arrange:
             const routes = [];
             const server = test.setup.createCapturingMockServer('get', routes);
 
             // Act:
             storage.registerRoutes(server, {});
 
             // Assert:
             test.assert.assertRoutes(routes, [
                 '/drive/:accountId',
                 '/drives',
                 '/account/:accountId/drive',
                 '/account/:accountId/drive/owner',
                 '/account/:accountId/drive/replicator',
                 '/drive/:accountId/downloads',
                 '/account/:accountId/downloads',
                 '/downloads/:operationToken',
                 '/replicators'
             ]);
         });
     });
 });
 