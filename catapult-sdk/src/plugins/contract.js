/*
 * Copyright (c) 2018-present,
 *
 * This file is part of Catapult.
 *
 * Catapult is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Lesser General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * Catapult is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License
 * along with Catapult.  If not, see <http://www.gnu.org/licenses/>.
 */

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
			duration: 	{ type: ModelType.uint64, schemaName: 'modifyContract.duration' },
			multisig: 	{ type: ModelType.binary, schemaName: 'modifyContract.multisig' },
			hash: 		{ type: ModelType.binary, schemaName: 'modifyContract.hash' },
			customers: 	{ type: ModelType.array, schemaName: 'modifyContract.modification' },
			executors:	{ type: ModelType.array, schemaName: 'modifyContract.modification' },
			verifiers: 	{ type: ModelType.array, schemaName: 'modifyContract.modification' }
		});

		builder.addSchema('modifyContract.modification', {
			cosignatoryPublicKey: ModelType.binary
		});

		builder.addSchema('contractEntry', {
			contract: { type: ModelType.object, schemaName: 'contractEntry.multisig' }
		});
		builder.addSchema('contractEntry.multisig', {
			start: ModelType.uint64,
			duration: ModelType.uint64,
			multisig: ModelType.binary,
			multisigAddress: ModelType.binary,
			hash: ModelType.binary,
			customers: { type: ModelType.array, schemaName: ModelType.binary },
			executors: { type: ModelType.array, schemaName: ModelType.binary },
			verifiers: { type: ModelType.array, schemaName: ModelType.binary }
		});
	},

	registerCodecs: codecBuilder => {
		codecBuilder.addTransactionSupport(EntityType.modifyContract, {
			deserialize: parser => {
				const transaction = {};
				transaction.duration = parser.uint64();
				transaction.multisig = parser.buffer(constants.sizes.signer);
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
				serializer.writeUint64(transaction.DurationDelta);
				serializer.writeBuffer(transaction.Multisig);
				serializer.writeBuffer(transaction.Hash);

				const CustomerModificationCount = transaction.CustomerModifications.length;
				const ExecutorModificationCount = transaction.ExecutorModifications.length;
				const VerifierModificationCount = transaction.VerifierModifications.length;
				serializer.writeUint8(CustomerModificationCount);
				serializer.writeUint8(ExecutorModificationCount);
				serializer.writeUint8(VerifierModificationCount);

				const writeModifications = function (modifications) {
					modifications.forEach(modification => {
						serializer.writeUint8(modification.type);
						serializer.writeBuffer(modification.cosignatoryPublicKey);
					});
				};

				writeModifications(transaction.CustomerModifications);
				writeModifications(transaction.ExecutorModifications);
				writeModifications(transaction.VerifierModifications);
			}
		});
	}
};

module.exports = contractPlugin;
