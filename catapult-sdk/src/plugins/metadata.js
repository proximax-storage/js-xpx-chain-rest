/**
 *** Copyright 2019 ProximaX Limited. All rights reserved.
 *** Use of this source code is governed by the Apache 2.0
 *** license that can be found in the LICENSE file.
 **/

/** @module plugins/contract */
const EntityType = require('../model/EntityType');
const ModelType = require('../model/ModelType');
const sizes = require('../modelBinary/sizes');

const constants = { sizes };

/**
 * Creates a contract plugin.
 * @type {module:plugins/CatapultPlugin}
 */
const contractPlugin = {
	registerSchema: builder => {

		builder.addTransactionSupport(EntityType.metadataAddress, {
			metadataType: { type: ModelType.uint8, schemaName: 'modifyMetadata.metadataType' },
			metadataId: { type: ModelType.binary, schemaName: 'modifyMetadata.metadataId' },
			modifications: { type: ModelType.array, schemaName: 'modifyMetadata.modification' }
		});
		builder.addTransactionSupport(EntityType.metadataMosaic, {
			metadataType: { type: ModelType.uint8, schemaName: 'modifyMetadata.metadataType' },
			metadataId: { type: ModelType.uint64, schemaName: 'modifyMetadata.metadataId' },
			modifications: { type: ModelType.array, schemaName: 'modifyMetadata.modification' }
		});
		builder.addTransactionSupport(EntityType.metadataNamespace, {
			metadataType: { type: ModelType.uint8, schemaName: 'modifyMetadata.metadataType' },
			metadataId: { type: ModelType.uint64, schemaName: 'modifyMetadata.metadataId' },
			modifications: { type: ModelType.array, schemaName: 'modifyMetadata.modification' }
		});

		builder.addSchema('modifyMetadata.modification', {
			size:				ModelType.uint32,
			modificationType:	ModelType.uint8,
			keySize:			ModelType.uint8,
			valueSize:			ModelType.uint16,
			key:				ModelType.string,
			value:				ModelType.string
		});

		builder.addSchema('metadataEntry', {
			metadata: { type: ModelType.object, schemaName: 'metadataEntry.metadataId' }
		});

		builder.addSchema('Field', {
			key:	ModelType.string,
			value:	ModelType.string
		});

		builder.addSchema('metadataEntry.metadataId', {
			metadataId: ModelType.metadataId,
			metadataType:	ModelType.uint8,
			fields:			{ type: ModelType.array, schemaName: 'Field' }
		});
	},

	registerCodecs: codecBuilder => {
		const readModifications = function (parser) {
			const modification = {};
			modification.size = parser.uint32();
			modification.modificationType = parser.uint8();
			const keySize = parser.uint8();
			const valueSize = parser.uint16();

			if (modification.size !== 4 + 1 + 1 + 2 + keySize + valueSize) throw Error('metadata modification must is wrong size');

			if (keySize !== 0)
				modification.key = parser.buffer(keySize);

			if (valueSize !== 0)
				modification.value = parser.buffer(valueSize);

			return modification;
		};

		const deserialize = function (parser, bodySize, metadataIdParser) {
			const transaction = {};
			const initialBytes = parser.numUnprocessedBytes();
			transaction.metadataType = parser.uint8();
			transaction.metadataId = metadataIdParser(parser);
			let modificationsSize = bodySize - (initialBytes - parser.numUnprocessedBytes());

			transaction.modifications = [];
			while (0 < modificationsSize) {
				const modification = readModifications(parser);
				modificationsSize -= modification.size;
				delete modification.size;
				transaction.modifications.push(modification);
			}

			return transaction;
		};

		const writeModification = function (modification, serializer) {
			serializer.writeUint32(4 + 1 + 1 + 2 + modification.key.length + modification.value.length);
			serializer.writeUint8(modification.modificationType);

			serializer.writeUint8(modification.key.length);
			serializer.writeUint16(modification.value.length);
			serializer.writeBuffer(modification.key);
			serializer.writeBuffer(modification.value);
		};

		const serialize = function (transaction, serializer, metadataIdWriter) {
			serializer.writeUint8(transaction.metadataType);
			metadataIdWriter(transaction, serializer);

			transaction.modifications.forEach(modification => {
				writeModification(modification, serializer);
			});
		};

		codecBuilder.addTransactionSupport(EntityType.metadataAddress, {
			deserialize: (parser, size, txCodecs, preprocessedBytes) => {
				const addressParser = p => p.buffer(constants.sizes.addressDecoded);
				return deserialize(parser, size - preprocessedBytes, addressParser);
			},

			serialize: (transaction, serializer) => {
				const addressWriter = (t, s) => s.writeBuffer(t.metadataId);
				serialize(transaction, serializer, addressWriter);
			}
		});

		codecBuilder.addTransactionSupport(EntityType.metadataMosaic, {
			deserialize: (parser, size, txCodecs, preprocessedBytes) => {
				const addressParser = p => p.uint64();
				return deserialize(parser, size - preprocessedBytes, addressParser);
			},

			serialize: (transaction, serializer) => {
				const addressWriter = (t, s) => s.writeUint64(t.metadataId);
				serialize(transaction, serializer, addressWriter);
			}
		});

		codecBuilder.addTransactionSupport(EntityType.metadataNamespace, {
			deserialize: (parser, size, txCodecs, preprocessedBytes) => {
				const addressParser = p => p.uint64();
				return deserialize(parser, size - preprocessedBytes, addressParser);
			},

			serialize: (transaction, serializer) => {
				const addressWriter = (t, s) => s.writeUint64(t.metadataId);
				serialize(transaction, serializer, addressWriter);
			}
		});
	}
};

module.exports = contractPlugin;
