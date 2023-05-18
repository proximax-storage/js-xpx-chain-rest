/**
 *** Copyright 2023 ProximaX Limited. All rights reserved.
 *** Use of this source code is governed by the Apache 2.0
 *** license that can be found in the LICENSE file.
 **/

/** @module plugins/supercontractV2 */
const EntityType = require('../model/EntityType');
const ModelType = require('../model/ModelType');
const sizes = require('../modelBinary/sizes');

const constants = {sizes};

const parseString = (parser, size) => parser.buffer(size).toString('ascii');

const writeString = (serializer, str) => {
    serializer.writeBuffer(Buffer.from(str, 'ascii'));
};

/**
 * Creates a supercontractV2 plugin.
 * @type {module:plugins/CatapultPlugin}
 */
const superContractV2Plugin = {
    registerSchema: builder => {
        builder.addTransactionSupport(EntityType.deployContract, {
            driveKey: ModelType.binary,
            assignee: ModelType.binary,
            automaticExecutionsFileName: ModelType.string,
            automaticExecutionsFunctionName: ModelType.string,
            automaticExecutionCallPayment: ModelType.uint64,
            automaticDownloadCallPayment: ModelType.uint64,
            automaticExecutionsNumber: ModelType.uint32,
            fileName: ModelType.string,
            functionName: ModelType.string,
            actualArguments: ModelType.string,
            servicePayments: {type: ModelType.array, schemaName: 'servicePayment'},
            executionCallPayment: ModelType.uint64,
            downloadCallPayment: ModelType.uint64,
        });

        builder.addTransactionSupport(EntityType.manualCall, {
            contractKey: ModelType.binary,
            fileName: ModelType.string,
            functionName: ModelType.string,
            actualArguments: ModelType.string,
            servicePayments: {type: ModelType.array, schemaName: 'servicePayment'},
            executionCallPayment: ModelType.uint64,
            downloadCallPayment: ModelType.uint64,
        });

        builder.addTransactionSupport(EntityType.automaticExecutionsPayment, {
            contractKey: ModelType.binary,
            automaticExecutionsNumber: ModelType.uint32,
        });

        builder.addTransactionSupport(EntityType.successfulEndBatchExecution, {
            contractKey: ModelType.binary,
            batchId: ModelType.uint64,
            automaticExecutionsNextBlockToCheck: ModelType.uint64,
            storageHash: ModelType.binary,
            usedSizeBytes: ModelType.uint64,
            metaFilesSizeBytes: ModelType.uint64,
            proofOfExecutionVerificationInformation: ModelType.binary,
            callDigests: {type: ModelType.array, schemaName: 'extendedCallDigest'},
            opinions: {type: ModelType.array, schemaName: 'opinion'},
        });

        builder.addTransactionSupport(EntityType.unsuccessfulEndBatchExecution, {
            contractKey: ModelType.binary,
            batchId: ModelType.uint64,
            automaticExecutionsNextBlockToCheck: ModelType.uint64,
            callDigests: {type: ModelType.array, schemaName: 'shortCallDigest'},
            opinions: {type: ModelType.array, schemaName: 'opinion'},
        });

        builder.addTransactionSupport(EntityType.endBatchExecutionSingle, {
            contractKey: ModelType.binary,
            batchId: ModelType.uint64,
            poEx: {type: ModelType.array, schemaName: 'poEx'},
        });

        builder.addTransactionSupport(EntityType.synchronizationSingle, {
            contractKey: ModelType.binary,
            batchId: ModelType.uint64,
        });

        builder.addSchema('servicePayment', {
            id: ModelType.uint64,
            amount: ModelType.uint64,
        });

        builder.addSchema('shortCallDigest', {
            callId: ModelType.binary,
            manual: ModelType.boolean,
            block: ModelType.uint64,
        });

        builder.addSchema('extendedCallDigest', {
            callId: ModelType.binary,
            manual: ModelType.boolean,
            block: ModelType.uint64,
            status: ModelType.uint16,
            releasedTransactionHash: ModelType.binary,
        });

        builder.addSchema('opinion', {
            publicKey: ModelType.binary,
            signature: ModelType.binary,
            poEx: {type: ModelType.object, schemaName: 'poEx'},
            callPayments: {type: ModelType.array, schemaName: 'callPayment'},
        });

        builder.addSchema('shortPoEx', {
            startBatchId: ModelType.uint64,
            T: ModelType.binary,
            R: ModelType.binary,
        });

        builder.addSchema('poEx', {
            startBatchId: ModelType.uint64,
            T: ModelType.binary,
            R: ModelType.binary,
            F: ModelType.binary,
            K: ModelType.binary,
        });

        builder.addSchema('callPayment', {
            executionPayment: ModelType.uint64,
            downloadPayment: ModelType.uint64,
        });

        builder.addSchema('automaticExecutionsInfo', {
            automaticExecutionsFileName: ModelType.string,
            automaticExecutionsFunctionName: ModelType.string,
            automaticExecutionsNextBlockToCheck: ModelType.uint64,
            automaticExecutionCallPayment: ModelType.uint64,
            automaticDownloadCallPayment: ModelType.uint64,
            automaticExecutionsNumber: ModelType.uint32,
            automaticExecutionsPrepaidSinceHasValue: ModelType.uint8,
            automaticExecutionsPrepaidSince: ModelType.uint64,
        });

        builder.addSchema('requestedCall', {
            callId: ModelType.binary,
            caller: ModelType.binary,
            fileName: ModelType.string,
            functionName: ModelType.string,
            actualArguments: ModelType.string,
            executionCallPayment: ModelType.uint64,
            downloadCallPayment: ModelType.uint64,
            servicePayments: {type: ModelType.array, schemaName: 'servicePayment'},
            blockHeight: ModelType.uint64,
        });

        builder.addSchema('executorsInfo', {
            replicatorKey: ModelType.binary,
            nextBatchToApprove: ModelType.uint64,
            poEx: {type: ModelType.object, schemaName: 'shortPoEx'},
        });

        builder.addSchema('completedCall', {
            callId: ModelType.binary,
            caller: ModelType.binary,
            status: ModelType.uint16,
            executionWork: ModelType.uint64,
            downloadWork: ModelType.uint64,
        });

        builder.addSchema('batch', {
            batchId: ModelType.uint64,
            success: ModelType.boolean,
            poExVerificationInformation: ModelType.binary,
            completedCalls: {type: ModelType.array, schemaName: 'completedCall'},
        });

        builder.addSchema('supercontract', {
            contractKey: ModelType.binary,
            contractAddress: ModelType.binary,
            driveKey: ModelType.binary,
            executionPaymentKey: ModelType.binary,
            assignee: ModelType.binary,
            creator: ModelType.binary,
            deploymentBaseModificationId: ModelType.binary,
            automaticExecutionsInfo: {type: ModelType.object, schemaName: 'automaticExecutionsInfo'},
            requestedCalls: {type: ModelType.array, schemaName: 'requestedCall'},
            executorsInfo: {type: ModelType.array, schemaName: 'executorsInfo'},
            batches: {type: ModelType.array, schemaName: 'batch'},
            releasedTransactions: {type: ModelType.array, schemaName: ModelType.binary},
        });

        builder.addSchema('supercontractEntry', {
            supercontract: { type: ModelType.object, schemaName: 'supercontract' }
        });
    },

    registerCodecs: codecBuilder => {
        codecBuilder.addTransactionSupport(EntityType.deployContract, {
            deserialize: parser => {
                const transaction = {};
                transaction.driveKey = parser.buffer(constants.sizes.signer);

                // region manual call static data
                const fileNameSize = parser.uint16();
                const functionNameSize = parser.uint16();
                const actualArgumentsSize = parser.uint16();
                transaction.executionCallPayment = parser.uint64();
                transaction.downloadCallPayment = parser.uint64();
                const servicePaymentsCount = parser.uint8();
                // endregion

                // region automatic calls static data
                const automaticExecutionsFileNameSize = parser.uint16();
                const automaticExecutionsFunctionNameSize = parser.uint16();
                transaction.automaticExecutionCallPayment = parser.uint64();
                transaction.automaticDownloadCallPayment = parser.uint64();
                transaction.automaticExecutionsNumber = parser.uint32();
                // end region

                transaction.assignee = parser.buffer(constants.sizes.signer);

                // region manual call dynamic data
                transaction.fileName = parseString(parser, fileNameSize);
                transaction.functionName = parseString(parser, functionNameSize);
                transaction.actualArguments = parseString(parser, actualArgumentsSize);
                transaction.servicePayments = [];
                for (let i = 0; i < servicePaymentsCount; i++) {
                    const servicePayment = {};
                    servicePayment.id = parser.uint64();
                    servicePayment.amount = parser.uint64();
                    transaction.servicePayments.push(servicePayment);
                }
                // endregion

                // region automatic calls dynamic data
                transaction.automaticExecutionsFileName = parseString(parser, automaticExecutionsFileNameSize);
                transaction.automaticExecutionsFunctionName = parseString(parser, automaticExecutionsFunctionNameSize);
                // endregion

                return transaction;
            },

            serialize: (transaction, serializer) => {
                serializer.writeBuffer(transaction.driveKey);

                // region manual call static data

                serializer.writeUint16(transaction.fileName.length);
                serializer.writeUint16(transaction.functionName.length);
                serializer.writeUint16(transaction.actualArguments.length);
                serializer.writeUint64(transaction.executionCallPayment);
                serializer.writeUint64(transaction.downloadCallPayment);
                serializer.writeUint8(transaction.servicePayments.length)

                // endregion

                // region automatic calls static data

                serializer.writeUint16(transaction.automaticExecutionsFileName.length);
                serializer.writeUint16(transaction.automaticExecutionsFunctionName.length);
                serializer.writeUint64(transaction.automaticExecutionCallPayment);
                serializer.writeUint64(transaction.automaticDownloadCallPayment);
                serializer.writeUint32(transaction.automaticExecutionsNumber);

                // endregion

                serializer.writeBuffer(transaction.assignee);

                // region manual call dynamic data

                writeString(serializer, transaction.fileName);
                writeString(serializer, transaction.functionName);
                writeString(serializer, transaction.actualArguments);
                transaction.servicePayments.forEach(servicePayment => {
                    serializer.writeUint64(servicePayment.id);
                    serializer.writeUint64(servicePayment.amount);
                });

                // endregion

                // region automatic calls dynamic data

                writeString(serializer, transaction.automaticExecutionsFileName);
                writeString(serializer, transaction.automaticExecutionsFunctionName);

                // endregion
            }
        });

        codecBuilder.addTransactionSupport(EntityType.manualCall, {
            deserialize: parser => {
                const transaction = {};
                transaction.contractKey = parser.buffer(constants.sizes.signer);

                // region manual call static data
                const fileNameSize = parser.uint16();
                const functionNameSize = parser.uint16();
                const actualArgumentsSize = parser.uint16();
                transaction.executionCallPayment = parser.uint64();
                transaction.downloadCallPayment = parser.uint64();
                const servicePaymentsCount = parser.uint8();
                // endregion

                // region manual call dynamic data
                transaction.fileName = parseString(parser, fileNameSize);
                transaction.functionName = parseString(parser, functionNameSize);
                transaction.actualArguments = parseString(parser, actualArgumentsSize);
                transaction.servicePayments = [];
                for (let i = 0; i < servicePaymentsCount; i++) {
                    const servicePayment = {};
                    servicePayment.id = parser.uint64();
                    servicePayment.amount = parser.uint64();
                    transaction.servicePayments.push(servicePayment);
                }
                // endregion

                return transaction;
            },

            serialize: (transaction, serializer) => {
                serializer.writeBuffer(transaction.contractKey);

                // region manual call static data

                serializer.writeUint16(transaction.fileName.length);
                serializer.writeUint16(transaction.functionName.length);
                serializer.writeUint16(transaction.actualArguments.length);
                serializer.writeUint64(transaction.executionCallPayment);
                serializer.writeUint64(transaction.downloadCallPayment);
                serializer.writeUint8(transaction.servicePayments.length)

                // endregion

                // region manual call dynamic data

                writeString(serializer, transaction.fileName);
                writeString(serializer, transaction.functionName);
                writeString(serializer, transaction.actualArguments);
                transaction.servicePayments.forEach(servicePayment => {
                    serializer.writeUint64(servicePayment.id);
                    serializer.writeUint64(servicePayment.amount);
                });

                // endregion
            }
        });

        codecBuilder.addTransactionSupport(EntityType.automaticExecutionsPayment, {
            deserialize: parser => {
                const transaction = {};
                transaction.contractKey = parser.buffer(constants.sizes.signer);
                transaction.automaticExecutionsNumber = parser.uint32();

                return transaction;
            },

            serialize: (transaction, serializer) => {
                serializer.writeBuffer(transaction.contractKey);
                serializer.writeUint32(transaction.automaticExecutionsNumber);
            }
        });

        codecBuilder.addTransactionSupport(EntityType.successfulEndBatchExecution, {
            deserialize: parser => {
                const transaction = {};
                transaction.contractKey = parser.buffer(constants.sizes.signer);
                transaction.batchId = parser.uint64();
                transaction.storageHash = parser.buffer(constants.sizes.hash256);
                transaction.usedSizeBytes = parser.uint64();
                transaction.metaFilesSizeBytes = parser.uint64();
                transaction.proofOfExecutionVerificationInformation = parser.buffer(constants.sizes.curvePoint);
                transaction.automaticExecutionsNextBlockToCheck = parser.uint64();

                const cosignersNumber = parser.uint16();
                const callsNumber = parser.uint16();

                transaction.publicKeys = []
                for(let i = 0; i < cosignersNumber; i++) {
                    transaction.publicKeys.push(parser.buffer(constants.sizes.signer));
                }

                transaction.signatures = []
                for (let i = 0; i < cosignersNumber; i++) {
                    transaction.signatures.push(parser.buffer(constants.sizes.signature));
                }

                transaction.proofsOfExecution = []
                for (let i = 0; i < cosignersNumber; i++) {
                    let proof = {}
                    proof.startBatchId = parser.uint64();
                    proof.T = parser.buffer(constants.sizes.curvePoint);
                    proof.R = parser.buffer(constants.sizes.scalar);
                    proof.F = parser.buffer(constants.sizes.curvePoint);
                    proof.K = parser.buffer(constants.sizes.scalar);
                    transaction.proofsOfExecution.push(proof);
                }

                transaction.callDigests = []
                for (let i = 0; i < callsNumber; i++) {
                    let callDigest = {};
                    callDigest.callId = parser.buffer(constants.sizes.hash256);
                    callDigest.manual = parser.uint8();
                    callDigest.block = parser.uint64();
                    callDigest.status = parser.uint16();
                    callDigest.releasedTransactionHash = parser.buffer(constants.sizes.hash256);
                    transaction.callDigests.push(callDigest);
                }

                transaction.callPayments = []
                for (let i = 0; i < cosignersNumber; i++) {
                    for (let j = 0; j < callsNumber; j++) {
                        let callPayment = {}
                        callPayment.executionPayment = parser.uint64();
                        callPayment.downloadPayment = parser.uint64();
                        transaction.callPayments.push(callPayment);
                    }
                }

                return transaction;
            },

            serialize: (transaction, serializer) => {
                serializer.writeBuffer(transaction.contractKey);
                serializer.writeUint64(transaction.batchId);
                serializer.writeBuffer(transaction.storageHash);
                serializer.writeUint64(transaction.usedSizeBytes);
                serializer.writeUint64(transaction.metaFilesSizeBytes);
                serializer.writeBuffer(transaction.proofOfExecutionVerificationInformation);
                serializer.writeUint64(transaction.automaticExecutionsNextBlockToCheck);

                serializer.writeUint16(transaction.publicKeys.length);
                serializer.writeUint16(transaction.callDigests.length);

                transaction.publicKeys.forEach(publicKey => {
                   serializer.writeBuffer(publicKey);
                });

                transaction.signatures.forEach(signature => {
                    serializer.writeBuffer(signature);
                });

                transaction.proofsOfExecution.forEach(proofOfExecution => {
                    serializer.writeUint64(proofOfExecution.startBatchId);
                    serializer.writeBuffer(proofOfExecution.T);
                    serializer.writeBuffer(proofOfExecution.R);
                    serializer.writeBuffer(proofOfExecution.F);
                    serializer.writeBuffer(proofOfExecution.K);
                });

                transaction.callDigests.forEach(callDigest => {
                    serializer.writeBuffer(callDigest.callId);
                    serializer.writeUint8(callDigest.manual);
                    serializer.writeUint64(callDigest.block);
                    serializer.writeUint16(callDigest.status);
                    serializer.writeBuffer(callDigest.releasedTransactionHash);
                });

                transaction.callPayments.forEach(callPayment => {
                    serializer.writeUint64(callPayment.executionPayment);
                    serializer.writeUint64(callPayment.downloadPayment);
                });
            }
        });

        codecBuilder.addTransactionSupport(EntityType.unsuccessfulEndBatchExecution, {
            deserialize: parser => {
                const transaction = {};
                transaction.contractKey = parser.buffer(constants.sizes.signer);
                transaction.batchId = parser.uint64();
                transaction.automaticExecutionsNextBlockToCheck = parser.uint64();

                const cosignersNumber = parser.uint16();
                const callsNumber = parser.uint16();

                transaction.publicKeys = []
                for(let i = 0; i < cosignersNumber; i++) {
                    transaction.publicKeys.push(parser.buffer(constants.sizes.signer));
                }

                transaction.signatures = []
                for (let i = 0; i < cosignersNumber; i++) {
                    transaction.signatures.push(parser.buffer(constants.sizes.signature));
                }

                transaction.proofsOfExecution = []
                for (let i = 0; i < cosignersNumber; i++) {
                    let proof = {}
                    proof.startBatchId = parser.uint64();
                    proof.T = parser.buffer(constants.sizes.curvePoint);
                    proof.R = parser.buffer(constants.sizes.scalar);
                    proof.F = parser.buffer(constants.sizes.curvePoint);
                    proof.K = parser.buffer(constants.sizes.scalar);
                    transaction.proofsOfExecution.push(proof);
                }

                transaction.callDigests = []
                for (let i = 0; i < callsNumber; i++) {
                    let callDigest = {};
                    callDigest.callId = parser.buffer(constants.sizes.hash256);
                    callDigest.manual = parser.uint8();
                    callDigest.block = parser.uint64();
                    transaction.callDigests.push(callDigest);
                }

                transaction.callPayments = []
                for (let i = 0; i < cosignersNumber; i++) {
                    for (let j = 0; j < callsNumber; j++) {
                        let callPayment = {}
                        callPayment.executionPayment = parser.uint64();
                        callPayment.downloadPayment = parser.uint64();
                        transaction.callPayments.push(callPayment);
                    }
                }

                return transaction;
            },

            serialize: (transaction, serializer) => {
                serializer.writeBuffer(transaction.contractKey);
                serializer.writeUint64(transaction.batchId);
                serializer.writeUint64(transaction.automaticExecutionsNextBlockToCheck);

                serializer.writeUint16(transaction.publicKeys.length);
                serializer.writeUint16(transaction.callDigests.length);

                transaction.publicKeys.forEach(publicKey => {
                    serializer.writeBuffer(publicKey);
                });

                transaction.signatures.forEach(signature => {
                    serializer.writeBuffer(signature);
                });

                transaction.proofsOfExecution.forEach(proofOfExecution => {
                    serializer.writeUint64(proofOfExecution.startBatchId);
                    serializer.writeBuffer(proofOfExecution.T);
                    serializer.writeBuffer(proofOfExecution.R);
                    serializer.writeBuffer(proofOfExecution.F);
                    serializer.writeBuffer(proofOfExecution.K);
                });

                transaction.callDigests.forEach(callDigest => {
                    serializer.writeBuffer(callDigest.callId);
                    serializer.writeUint8(callDigest.manual);
                    serializer.writeUint64(callDigest.block);
                });

                transaction.callPayments.forEach(callPayment => {
                    serializer.writeUint64(callPayment.executionPayment);
                    serializer.writeUint64(callPayment.downloadPayment);
                });
            }
        });

        codecBuilder.addTransactionSupport(EntityType.endBatchExecutionSingle, {
            deserialize: parser => {
                const transaction = {};
                transaction.contractKey = parser.buffer(constants.sizes.signer);
                transaction.batchId = parser.uint64();
                transaction.poEx = {};
                transaction.poEx.startBatchId = parser.uint64();
                transaction.poEx.T = parser.buffer(constants.sizes.curvePoint);
                transaction.poEx.R = parser.buffer(constants.sizes.curvePoint);
                transaction.poEx.F = parser.buffer(constants.sizes.curvePoint);
                transaction.poEx.K = parser.buffer(constants.sizes.curvePoint);

                return transaction;
            },

            serialize: (transaction, serializer) => {
                serializer.writeBuffer(transaction.contractKey);
                serializer.writeUint64(transaction.batchId);
                serializer.writeUint64(transaction.poEx.startBatchId);
                serializer.writeBuffer(transaction.poEx.T);
                serializer.writeBuffer(transaction.poEx.R);
                serializer.writeBuffer(transaction.poEx.F);
                serializer.writeBuffer(transaction.poEx.K);
            }
        });

        codecBuilder.addTransactionSupport(EntityType.synchronizationSingle, {
            deserialize: parser => {
                const transaction = {};
                transaction.contractKey = parser.buffer(constants.sizes.signer);
                transaction.batchId = parser.uint64();

                return transaction;
            },

            serialize: (transaction, serializer) => {
                serializer.writeBuffer(transaction.contractKey);
                serializer.writeUint64(transaction.batchId);
            }
        });
    }
};

module.exports = superContractV2Plugin;
