/**
 *** Copyright 2019 ProximaX Limited. All rights reserved.
 *** Use of this source code is governed by the Apache 2.0
 *** license that can be found in the LICENSE file.
 * */

const EntityType = require('../../src/model/EntityType');
const ModelSchemaBuilder = require('../../src/model/ModelSchemaBuilder');
const test = require('../binaryTestUtils');
const { expect } = require('chai');

const metadataPlugin = require('../../src/plugins/metadata');

describe('metadata plugin', () => {
	describe('register schema', () => {
		it('adds metadata system schema', () => {
			// Arrange:
			const builder = new ModelSchemaBuilder();
			const numDefaultKeys = Object.keys(builder.build()).length;

			// Act:
			metadataPlugin.registerSchema(builder);
			const modelSchema = builder.build();

			// Assert:
			expect(Object.keys(modelSchema).length).to.equal(numDefaultKeys + 7);
			expect(modelSchema).to.contain.all.keys([
				'metadataAddress',
				'metadataMosaic',
				'metadataNamespace',
				'modifyMetadata.modification',
				'metadataEntry',
				'Field',
				'metadataEntry.metadataId'
			]);

			expect(Object.keys(modelSchema['metadataEntry.metadataId']).length).to.equal(3);
			expect(modelSchema['metadataEntry.metadataId'])
				.to.contain.all.keys(['metadataId', 'metadataType', 'fields']);

			// - metadata transactions
			const assertSchema = schema => {
				expect(Object.keys(schema).length).to.equal(Object.keys(modelSchema.transaction).length + 3);
				expect(schema).to.contain.all.keys(['metadataType', 'metadataId', 'modifications']);
			};

			assertSchema(modelSchema.metadataAddress);
			assertSchema(modelSchema.metadataMosaic);
			assertSchema(modelSchema.metadataNamespace);
		});
	});

	describe('register codecs', () => {
		const getCodecs = () => {
			const codecs = {};
			metadataPlugin.registerCodecs({
				addTransactionSupport: (type, codec) => { codecs[type] = codec; }
			});

			return codecs;
		};

		it('adds metadata codec', () => {
			// Act:
			const codecs = getCodecs();

			// Assert: codec was registered
			expect(Object.keys(codecs).length).to.equal(3);
			expect(codecs).to.contain.all.keys([
				EntityType.metadataAddress.toString(),
				EntityType.metadataMosaic.toString(),
				EntityType.metadataNamespace.toString()
			]);
		});

		const assertSupportMetadataTransaction = (entityType, metadataId, expectedId) => {
			const codec = getCodecs()[entityType];
			const metadataType = Buffer.of(0x0);

			const key = Buffer.of(0x98);
			const value = Buffer.of(0x97);

			test.binary.test.addAll(codec, 1 + metadataId.length + 4 + 1 + 1 + 2 + 1 + 1, () => ({
				buffer: Buffer.concat([
					metadataType,
					metadataId,
					Buffer.of(0xA, 0x0, 0x0, 0x0),
					Buffer.of(0x0),
					Buffer.of(0x1),
					Buffer.of(0x1, 0x0),
					Buffer.of(0x98),
					Buffer.of(0x97)
				]),
				object: {
					metadataType: 0,
					metadataId: expectedId,
					modifications: [{
						modificationType: 0,
						key,
						value
					}]
				}
			}));
		};

		describe('supports metadata address transaction', () => {
			const address = Buffer.of(
				0x77, 0xBE, 0xE1, 0xCA, 0xD0, 0x8E, 0x6E, 0x48, 0x95, 0xE8, 0x18, 0xB2, 0x7B, 0xD8, 0xFA, 0xC9,
				0x47, 0x0D, 0xB8, 0xFD, 0x2D, 0x81, 0x47, 0x6A, 0xC5
			);
			assertSupportMetadataTransaction(EntityType.metadataAddress, address, address);
		});

		describe('supports metadata mosaic transaction', () => {
			const mosaicId = Buffer.of(0x78, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0);
			assertSupportMetadataTransaction(EntityType.metadataMosaic, mosaicId, [0x78, 0]);
		});

		describe('supports metadata namespace transaction', () => {
			const namespaceId = Buffer.of(0x77, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0);
			assertSupportMetadataTransaction(EntityType.metadataNamespace, namespaceId, [0x77, 0]);
		});
	});
});
