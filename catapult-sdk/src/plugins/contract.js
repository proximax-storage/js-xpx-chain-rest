/**
 *** Copyright 2018 ProximaX Limited. All rights reserved.
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
		builder.addTransactionSupport(EntityType.modifyContract, {
			durationDelta: 	{ type: ModelType.uint64, schemaName: 'modifyContract.durationDelta' },
			hash: 			{ type: ModelType.binary, schemaName: 'modifyContract.hash' },
			customers: 		{ type: ModelType.array, schemaName: 'modifyContract.modification' },
			executors:		{ type: ModelType.array, schemaName: 'modifyContract.modification' },
			verifiers: 		{ type: ModelType.array, schemaName: 'modifyContract.modification' }
		});

		builder.addSchema('modifyContract.modification', {
			cosignatoryPublicKey: ModelType.binary
		});

		builder.addSchema('contractEntry', {
			contract: { type: ModelType.object, schemaName: 'contractEntry.multisig' }
		});

		builder.addSchema('HashSnapshot', {
			hash: ModelType.binary,
			height: ModelType.uint64
		});

		builder.addSchema('contractEntry.multisig', {
			start: ModelType.uint64,
			duration: ModelType.uint64,
			multisig: ModelType.binary,
			multisigAddress: ModelType.binary,
			hash: ModelType.binary,
			hashes: { type: ModelType.array, schemaName: 'HashSnapshot' },
			customers: { type: ModelType.array, schemaName: ModelType.binary },
			executors: { type: ModelType.array, schemaName: ModelType.binary },
			verifiers: { type: ModelType.array, schemaName: ModelType.binary }
		});
	},

	registerCodecs: codecBuilder => {
		codecBuilder.addTransactionSupport(EntityType.modifyContract, {
			deserialize: parser => {
				const transaction = {};
				transaction.durationDelta = parser.uint64();
				transaction.hash = parser.buffer(constants.sizes.hash256);

				const customersCount = parser.uint8();
				const executorsCount = parser.uint8();
				const verifiersCount = parser.uint8();
				transaction.customers = [];
				transaction.executors = [];
				transaction.verifiers = [];

				const readModifications = function (modificaion, count) {
					while (modificaion.length < count) {
						const type = parser.uint8();
						const cosignatoryPublicKey = parser.buffer(constants.sizes.signer);
						modificaion.push({ type, cosignatoryPublicKey });
					}
				};

				readModifications(transaction.customers, customersCount);
				readModifications(transaction.executors, executorsCount);
				readModifications(transaction.verifiers, verifiersCount);

				return transaction;
			},

			serialize: (transaction, serializer) => {
				serializer.writeUint64(transaction.durationDelta);
				serializer.writeBuffer(transaction.hash);

				const CustomerModificationCount = transaction.customers.length;
				const ExecutorModificationCount = transaction.executors.length;
				const VerifierModificationCount = transaction.verifiers.length;
				serializer.writeUint8(CustomerModificationCount);
				serializer.writeUint8(ExecutorModificationCount);
				serializer.writeUint8(VerifierModificationCount);

				const writeModifications = function (modifications) {
					modifications.forEach(modification => {
						serializer.writeUint8(modification.type);
						serializer.writeBuffer(modification.cosignatoryPublicKey);
					});
				};

				writeModifications(transaction.customers);
				writeModifications(transaction.executors);
				writeModifications(transaction.verifiers);
			}
		});
	}
};

module.exports = contractPlugin;
