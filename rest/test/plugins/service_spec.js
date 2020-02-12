/**
 *** Copyright 2019 ProximaX Limited. All rights reserved.
 *** Use of this source code is governed by the Apache 2.0
 *** license that can be found in the LICENSE file.
 **/

const service = require('../../src/plugins/service');
const ServiceDb = require('../../src/plugins/db/ServiceDb');
const pluginTest = require('./utils/pluginTestUtils');
const catapult = require('catapult-sdk');
const test = require('../routes/utils/routeTestUtils');
const { expect } = require('chai');

const { address, networkInfo } = catapult.model;

const addressToString = (address) => catapult.model.address.addressToString(address);

describe('service plugin', () => {
	pluginTest.assertThat.pluginCreatesDb(service, ServiceDb);
	pluginTest.assertThat.pluginDoesNotRegisterAdditionalTransactionStates(service);

	describe('register message channels', () => {
		const registerAndExtractChannelDescriptor = channelDescriptorName => {
			// Arrange:
			const channelDescriptors = [];
			const builder = { add: (name, markerChar, handler, channelFilter) => { channelDescriptors.push({ name, markerChar, handler, channelFilter }); } };
			const services = {
				config: { network: { name: 'mijinTest' } }
			};

			// Act:
			service.registerMessageChannels(builder, services);
			const channelDescriptor = channelDescriptors.find(descriptor => channelDescriptorName === descriptor.name);

			// Sanity:
			expect(channelDescriptors.length).to.equal(1);
			expect(channelDescriptor).to.not.equal(undefined);
			return channelDescriptor;
		};

		it('registers driveState', () => {
			// Act:
			const descriptor = registerAndExtractChannelDescriptor('driveState');

			// Assert:
			expect(descriptor.name).to.equal('driveState');
			expect(descriptor.markerChar).to.equal('b');
		});

		it('handler emits nothing when receipt type invalid', () => {
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
				Buffer.of(0x0, 0x61),
				driveKey,
				Buffer.of(0x02)
			]);
			handler({}, eventData => emitted.push(eventData), filter)([0x01, 0x02], buffer, 'ignored data');

			// Assert:
			expect(emitted.length).to.equal(0);
		});

		it('handler emits nothing when drive address does not match filter', () => {
			// Arrange:
			const emitted = [];
			const { handler } = registerAndExtractChannelDescriptor('driveState');
			const driveKey = test.random.publicKey();
			const driveAddress = test.random.address();
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
			expect(emitted.length).to.equal(0);
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
				type: 'service.driveStateWithMetadata',
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

		it('channel filter', () => {
			// Arrange:
			const { channelFilter } = registerAndExtractChannelDescriptor('driveState');

			// Act:
			const channelTopic = channelFilter()();

			// Assert:
			expect(channelTopic).to.deep.equal(Buffer.of(0x62));
		});
	});

	describe('register routes', () => {
		it('registers service GET routes', () => {
			// Arrange:
			const routes = [];
			const server = test.setup.createCapturingMockServer('get', routes);

			// Act:
			service.registerRoutes(server, {});

			// Assert:
			test.assert.assertRoutes(routes, [
				'/drive/:accountId',
				'/account/:accountId/drive',
				'/account/:accountId/drive/owner',
				'/account/:accountId/drive/replicator',
				'/drive/:accountId/downloads',
				'/account/:accountId/downloads',
				'/downloads/:operationToken'
			]);
		});
	});
});
