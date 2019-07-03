/**
 *** Copyright 2019 ProximaX Limited. All rights reserved.
 *** Use of this source code is governed by the Apache 2.0
 *** license that can be found in the LICENSE file.
 * */

const EntityType = require('../../src/model/EntityType');
const ModelSchemaBuilder = require('../../src/model/ModelSchemaBuilder');
const test = require('../binaryTestUtils');
const { expect } = require('chai');

const contractPlugin = require('../../src/plugins/contract');

describe('contract plugin', () => {
	describe('register schema', () => {
		it('adds contract system schema', () => {
			// Arrange:
			const builder = new ModelSchemaBuilder();
			const numDefaultKeys = Object.keys(builder.build()).length;

			// Act:
			contractPlugin.registerSchema(builder);
			const modelSchema = builder.build();

			// Assert:
			expect(Object.keys(modelSchema).length).to.equal(numDefaultKeys + 5);
			expect(modelSchema).to.contain.all.keys([
				'modifyContract',
				'modifyContract.modification',
				'contractEntry',
				'HashSnapshot',
				'contractEntry.multisig'
			]);

			expect(Object.keys(modelSchema['contractEntry.multisig']).length).to.equal(9);
			expect(modelSchema['contractEntry.multisig'])
				.to.contain.all.keys([
					'start',
					'duration',
					'multisig',
					'multisigAddress',
					'hash',
					'hashes',
					'customers',
					'executors',
					'verifiers'
				]);

			// - contract
			expect(Object.keys(modelSchema.modifyContract).length).to.equal(Object.keys(modelSchema.transaction).length + 5);
			expect(modelSchema.modifyContract).to.contain.all.keys([
				'durationDelta',
				'hash',
				'customers',
				'executors',
				'verifiers'
			]);
		});
	});

	describe('register codecs', () => {
		const getCodecs = () => {
			const codecs = {};
			contractPlugin.registerCodecs({
				addTransactionSupport: (type, codec) => { codecs[type] = codec; }
			});

			return codecs;
		};

		it('adds contract codec', () => {
			// Act:
			const codecs = getCodecs();

			// Assert: codec was registered
			expect(Object.keys(codecs).length).to.equal(1);
			expect(codecs).to.contain.all.keys([EntityType.modifyContract.toString()]);
		});

		const codec = getCodecs()[EntityType.modifyContract];

		describe('supports modify contract transaction', () => {
			const durationDelta = Buffer.of(0x77, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0);
			const hash = Buffer.of(
				0x77, 0xBE, 0xE1, 0xCA, 0xD0, 0x8E, 0x6E, 0x48, 0x95, 0xE8, 0x18, 0xB2, 0x7B, 0xD8, 0xFA, 0xC9,
				0x47, 0x0D, 0xB8, 0xFD, 0x2D, 0x81, 0x47, 0x6A, 0xC5, 0x61, 0xA4, 0xCE, 0xE1, 0x81, 0x40, 0x83
			);
			const customer = hash;
			const executor = hash;
			const verifier = hash;

			test.binary.test.addAll(codec, 8 + 32 + 3 /* size */ + ((1 /* type */ + 32) * 3), () => ({
				buffer: Buffer.concat([
					durationDelta,
					hash,
					Buffer.of(0x01),
					Buffer.of(0x01),
					Buffer.of(0x01),
					Buffer.of(0x00),
					customer,
					Buffer.of(0x00),
					executor,
					Buffer.of(0x00),
					verifier
				]),
				object: {
					durationDelta: [119, 0],
					hash,
					customers: [{ cosignatoryPublicKey: customer, type: 0 }],
					executors: [{ cosignatoryPublicKey: executor, type: 0 }],
					verifiers: [{ cosignatoryPublicKey: verifier, type: 0 }]
				}
			}));
		});
	});
});
