/**
 *** Copyright 2023 ProximaX Limited. All rights reserved.
 *** Use of this source code is governed by the Apache 2.0
 *** license that can be found in the LICENSE file.
 * */

const EntityType = require('../../src/model/EntityType');
const ModelSchemaBuilder = require('../../src/model/ModelSchemaBuilder');
const test = require('../binaryTestUtils');
const {expect} = require('chai');

const supercontractV2Plugin = require('../../src/plugins/supercontract_v2');

describe('supercontract v2 plugin', () => {
    describe('register schema', () => {
        it('adds supercontract system schema', () => {
            // Arrange:
            const builder = new ModelSchemaBuilder();
            const numDefaultKeys = Object.keys(builder.build()).length;

            // Act:
            supercontractV2Plugin.registerSchema(builder);
            const modelSchema = builder.build();

            // Assert:
            expect(Object.keys(modelSchema).length).to.equal(numDefaultKeys + 20);
            expect(modelSchema).to.contain.all.keys([
                'deployContract',
                'manualCall',
                'automaticExecutionsPayment',
                'successfulEndBatchExecution',
                'unsuccessfulEndBatchExecution',
                'endBatchExecutionSingle',
                'synchronizationSingle',
                'servicePayment',
                'shortCallDigest',
                'extendedCallDigest',
                'opinion',
                'shortPoEx',
                'poEx',
                'callPayment',
                'automaticExecutionsInfo',
                'requestedCall',
                'executorsInfo',
                'completedCall',
                'batch',
                'supercontract',
            ]);

            expect(Object.keys(modelSchema.deployContract).length).to.equal(Object.keys(modelSchema.transaction).length + 13);
            expect(modelSchema.deployContract).to.contain.all.keys([
                'driveKey',
                'assignee',
                'automaticExecutionsFileName',
                'automaticExecutionsFunctionName',
                'automaticExecutionCallPayment',
                'automaticDownloadCallPayment',
                'automaticExecutionsNumber',
                'fileName',
                'functionName',
                'actualArguments',
                'servicePayments',
                'executionCallPayment',
                'downloadCallPayment',
            ]);

            expect(Object.keys(modelSchema.manualCall).length).to.equal(Object.keys(modelSchema.transaction).length + 7);
            expect(modelSchema.manualCall).to.contain.all.keys([
                'contractKey',
                'fileName',
                'functionName',
                'actualArguments',
                'servicePayments',
                'executionCallPayment',
                'downloadCallPayment',
            ]);

            expect(Object.keys(modelSchema.automaticExecutionsPayment).length).to.equal(Object.keys(modelSchema.transaction).length + 2);
            expect(modelSchema.automaticExecutionsPayment).to.contain.all.keys([
                'contractKey',
                'automaticExecutionsNumber',
            ]);

            expect(Object.keys(modelSchema.successfulEndBatchExecution).length).to.equal(Object.keys(modelSchema.transaction).length + 9);
            expect(modelSchema.successfulEndBatchExecution).to.contain.all.keys([
                'contractKey',
                'batchId',
                'automaticExecutionsNextBlockToCheck',
                'storageHash',
                'usedSizeBytes',
                'metaFilesSizeBytes',
                'proofOfExecutionVerificationInformation',
                'callDigests',
                'opinions',
            ]);

            expect(Object.keys(modelSchema.unsuccessfulEndBatchExecution).length).to.equal(Object.keys(modelSchema.transaction).length + 5);
            expect(modelSchema.unsuccessfulEndBatchExecution).to.contain.all.keys([
                'contractKey',
                'batchId',
                'automaticExecutionsNextBlockToCheck',
                'callDigests',
                'opinions',
            ]);

            expect(Object.keys(modelSchema.endBatchExecutionSingle).length).to.equal(Object.keys(modelSchema.transaction).length + 3);
            expect(modelSchema.endBatchExecutionSingle).to.contain.all.keys([
                'contractKey',
                'batchId',
                'poEx',
            ]);

            expect(Object.keys(modelSchema.synchronizationSingle).length).to.equal(Object.keys(modelSchema.transaction).length + 2);
            expect(modelSchema.synchronizationSingle).to.contain.all.keys([
                'contractKey',
                'batchId',
            ]);

            expect(Object.keys(modelSchema['servicePayment']).length).to.equal(2);
            expect(modelSchema['servicePayment']).to.contain.all.keys([
                'id',
                'amount',
            ]);

            expect(Object.keys(modelSchema['shortCallDigest']).length).to.equal(3);
            expect(modelSchema['shortCallDigest']).to.contain.all.keys([
                'callId',
                'manual',
                'block',
            ]);

            expect(Object.keys(modelSchema['extendedCallDigest']).length).to.equal(5);
            expect(modelSchema['extendedCallDigest']).to.contain.all.keys([
                'callId',
                'manual',
                'block',
                'status',
                'releasedTransactionHash',
            ]);

            expect(Object.keys(modelSchema['opinion']).length).to.equal(4);
            expect(modelSchema['opinion']).to.contain.all.keys([
                'publicKey',
                'signature',
                'poEx',
                'callPayments',
            ]);

            expect(Object.keys(modelSchema['shortPoEx']).length).to.equal(3);
            expect(modelSchema['shortPoEx']).to.contain.all.keys([
                'startBatchId',
                'T',
                'R',
            ]);

            expect(Object.keys(modelSchema['poEx']).length).to.equal(5);
            expect(modelSchema['poEx']).to.contain.all.keys([
                'startBatchId',
                'T',
                'R',
                'F',
                'K',
            ]);

            expect(Object.keys(modelSchema['callPayment']).length).to.equal(2);
            expect(modelSchema['callPayment']).to.contain.all.keys([
                'executionPayment',
                'downloadPayment',
            ]);

            expect(Object.keys(modelSchema['automaticExecutionsInfo']).length).to.equal(8);
            expect(modelSchema['automaticExecutionsInfo']).to.contain.all.keys([
                'automaticExecutionsFileName',
                'automaticExecutionsFunctionName',
                'automaticExecutionsNextBlockToCheck',
                'automaticExecutionCallPayment',
                'automaticDownloadCallPayment',
                'automaticExecutionsNumber',
                'automaticExecutionsPrepaidSinceHasValue',
                'automaticExecutionsPrepaidSince',
            ]);

            expect(Object.keys(modelSchema['requestedCall']).length).to.equal(9);
            expect(modelSchema['requestedCall']).to.contain.all.keys([
                'callId',
                'caller',
                'fileName',
                'functionName',
                'actualArguments',
                'executionCallPayment',
                'downloadCallPayment',
                'servicePayments',
                'blockHeight',
            ]);

            expect(Object.keys(modelSchema['executorsInfo']).length).to.equal(3);
            expect(modelSchema['executorsInfo']).to.contain.all.keys([
                'replicatorKey',
                'nextBatchToApprove',
                'poEx',
            ]);

            expect(Object.keys(modelSchema['completedCall']).length).to.equal(5);
            expect(modelSchema['completedCall']).to.contain.all.keys([
                'callId',
                'caller',
                'status',
                'executionWork',
                'downloadWork',
            ]);

            expect(Object.keys(modelSchema['batch']).length).to.equal(4);
            expect(modelSchema['batch']).to.contain.all.keys([
                'batchId',
                'success',
                'poExVerificationInformation',
                'completedCalls',
            ]);

            expect(Object.keys(modelSchema['supercontract']).length).to.equal(12);
            expect(modelSchema['supercontract']).to.contain.all.keys([
                'contractKey',
                'contractAddress',
                'driveKey',
                'executionPaymentKey',
                'assignee',
                'creator',
                'deploymentBaseModificationId',
                'automaticExecutionsInfo',
                'requestedCalls',
                'executorsInfo',
                'batches',
                'releasedTransactions',
            ]);
        });
    });

    describe('register codecs', () => {
        const getCodecs = () => {
            const codecs = {};
            supercontractV2Plugin.registerCodecs({
                addTransactionSupport: (type, codec) => {
                    codecs[type] = codec;
                }
            });

            return codecs;
        };

        const createByteArray = (number, size = 32) => {
            const hash = new Uint8Array(size);
            hash[0] = number;

            return hash;
        };

        it('adds supercontract codec', () => {
            // Act:
            const codecs = getCodecs();

            // Assert: codec was registered
            expect(Object.keys(codecs).length).to.equal(7);
            expect(codecs).to.contain.all.keys([
                EntityType.deployContract.toString(),
                EntityType.manualCall.toString(),
                EntityType.automaticExecutionsPayment.toString(),
                EntityType.successfulEndBatchExecution.toString(),
                EntityType.unsuccessfulEndBatchExecution.toString(),
                EntityType.endBatchExecutionSingle.toString(),
                EntityType.synchronizationSingle.toString(),
            ]);
        });

        describe('supports deploy contract transaction', () => {
            const codec = getCodecs()[EntityType.deployContract];

            const driveKey = createByteArray(0x01);

            const fileNameSize = Buffer.of(0x0A, 0x0);
            const functionNameSize = Buffer.of(0x0A, 0x0);
            const actualArgumentsSize = Buffer.of(0x0C, 0x0);
            const executionCallPayment = Buffer.of(0x0A, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0);
            const downloadCallPayment = Buffer.of(0x0B, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0);
            const servicePaymentsCount = Buffer.of(0x02);

            const automaticExecutionsFileNameSize = Buffer.of(0x0A, 0x00);
            const automaticExecutionsFunctionNameSize = Buffer.of(0x0A, 0x00);
            const automaticExecutionCallPayment = Buffer.of(0x03, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00);
            const automaticDownloadCallPayment = Buffer.of(0x04, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00);
            const automaticExecutionsNumber = Buffer.of(0x05, 0x0, 0x0, 0x0);

            const assignee = createByteArray(0x02);

            const fileName = Buffer.of(0x65, 0x67, 0x46, 0x69, 0x6C, 0x065, 0x4E, 0x61, 0x6D, 0x65);
            const functionName = Buffer.of(0x65, 0x67, 0x46, 0x75, 0x6E, 0x63, 0x4E, 0x61, 0x6D, 0x65);
            const actualArguments = Buffer.of(0x65, 0x67, 0x41, 0x72, 0x67, 0x73, 0x20, 0x2D, 0x41, 0x20, 0x2D, 0x4B);
            const servicePaymentId1 = Buffer.of(0x06, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0);
            const servicePaymentAmount1 = Buffer.of(0x07, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0);
            const servicePaymentId2 = Buffer.of(0x08, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0);
            const servicePaymentAmount2 = Buffer.of(0x09, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0);


            const automaticExecutionsFileName = Buffer.of(0x65, 0x67, 0x46, 0x69, 0x6C, 0x065, 0x4E, 0x61, 0x6D, 0x65);
            const automaticExecutionsFunctionName = Buffer.of(0x65, 0x67, 0x46, 0x75, 0x6E, 0x63, 0x4E, 0x61, 0x6D, 0x65);


            test.binary.test.addAll(codec, 32 + 3 * 2 + 2 * 8 + 1 + 2 * 2 + 2 * 8 + 4 + 32 + 2 * 10 + 12 + 2 * (8 + 8) + 2 * 10, () => ({
                buffer: Buffer.concat([
                    driveKey,
                    fileNameSize,
                    functionNameSize,
                    actualArgumentsSize,
                    executionCallPayment,
                    downloadCallPayment,
                    servicePaymentsCount,
                    automaticExecutionsFileNameSize,
                    automaticExecutionsFunctionNameSize,
                    automaticExecutionCallPayment,
                    automaticDownloadCallPayment,
                    automaticExecutionsNumber,
                    assignee,
                    fileName,
                    functionName,
                    actualArguments,
                    servicePaymentId1,
                    servicePaymentAmount1,
                    servicePaymentId2,
                    servicePaymentAmount2,
                    automaticExecutionsFileName,
                    automaticExecutionsFunctionName,
                ]),
                object: {
                    driveKey,
                    assignee,
                    automaticExecutionsFileName: 'egFileName',
                    automaticExecutionsFunctionName: 'egFuncName',
                    automaticExecutionCallPayment: [0x03, 0x0],
                    automaticDownloadCallPayment: [0x04, 0x0],
                    automaticExecutionsNumber: 0x05,
                    fileName: 'egFileName',
                    functionName: 'egFuncName',
                    actualArguments: 'egArgs -A -K',
                    servicePayments: [
                        {
                            id: [0x06, 0x0],
                            amount: [0x07, 0x0]
                        },
                        {
                            id: [0x08, 0x0],
                            amount: [0x09, 0x0]
                        }
                    ],
                    executionCallPayment: [0x0A, 0x0],
                    downloadCallPayment: [0x0B, 0x0]
                }
            }));
        });

        describe('supports manual call transaction', () => {
            const codec = getCodecs()[EntityType.manualCall];

            const contractKey = createByteArray(0x01);

            const fileNameSize = Buffer.of(0x0A, 0x0);
            const functionNameSize = Buffer.of(0x0A, 0x0);
            const actualArgumentsSize = Buffer.of(0x0C, 0x0);
            const executionCallPayment = Buffer.of(0x06, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0);
            const downloadCallPayment = Buffer.of(0x07, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0);
            const servicePaymentsCount = Buffer.of(0x02);

            const fileName = Buffer.of(0x65, 0x67, 0x46, 0x69, 0x6C, 0x065, 0x4E, 0x61, 0x6D, 0x65);
            const functionName = Buffer.of(0x65, 0x67, 0x46, 0x75, 0x6E, 0x63, 0x4E, 0x61, 0x6D, 0x65);
            const actualArguments = Buffer.of(0x65, 0x67, 0x41, 0x72, 0x67, 0x73, 0x20, 0x2D, 0x41, 0x20, 0x2D, 0x4B);
            const servicePaymentId1 = Buffer.of(0x02, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0);
            const servicePaymentAmount1 = Buffer.of(0x03, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0);
            const servicePaymentId2 = Buffer.of(0x04, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0);
            const servicePaymentAmount2 = Buffer.of(0x05, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0);

            test.binary.test.addAll(codec, 32 + 3 * 2 + 2 * 8 + 1 + 2 * 10 + 12 + 2 * (8 + 8), () => ({
                buffer: Buffer.concat([
                    contractKey,

                    fileNameSize,
                    functionNameSize,
                    actualArgumentsSize,
                    executionCallPayment,
                    downloadCallPayment,
                    servicePaymentsCount,
                    fileName,
                    functionName,
                    actualArguments,
                    servicePaymentId1,
                    servicePaymentAmount1,
                    servicePaymentId2,
                    servicePaymentAmount2,
                ]),
                object: {
                    contractKey,
                    fileName: 'egFileName',
                    functionName: 'egFuncName',
                    actualArguments: 'egArgs -A -K',
                    servicePayments: [
                        {
                            id: [0x02, 0x0],
                            amount: [0x03, 0x0]
                        },
                        {
                            id: [0x04, 0x0],
                            amount: [0x05, 0x0]
                        }
                    ],
                    executionCallPayment: [0x06, 0x0],
                    downloadCallPayment: [0x07, 0x0],
                }
            }));
        });

        describe('supports automatic executions payment transaction', () => {
            const codec = getCodecs()[EntityType.automaticExecutionsPayment];
            const contractKey = createByteArray(0x01);
            const automaticExecutionsNumber = Buffer.of(0x02, 0x0, 0x0, 0x0);

            test.binary.test.addAll(codec, 32 + 4, () => ({
                buffer: Buffer.concat([
                    contractKey,
                    automaticExecutionsNumber,
                ]),
                object: {
                    contractKey,
                    automaticExecutionsNumber: 0x02,
                }
            }));
        });

        describe('supports successful end batch execution transaction', () => {
            const codec = getCodecs()[EntityType.successfulEndBatchExecution];
            const contractKey = createByteArray(0x01);
            const batchId = Buffer.of(0x02, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0);
            const storageHash = createByteArray(0x03)
            const usedSizeBytes = Buffer.of(0x05, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0);
            const metaFilesSizeBytes = Buffer.of(0x06, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0);
            const proofOfExecutionVerificationInformation = createByteArray(0x07)
            const automaticExecutionsNextBlockToCheck = Buffer.of(0x03, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0);

            const cosignersNumber = Buffer.of(0x03, 0x00);
            const callsNumber = Buffer.of(0x02, 0x00);

            const publicKey1 = createByteArray(0x01);
            const publicKey2 = createByteArray(0x02);
            const publicKey3 = createByteArray(0x03);

            const signature1 = createByteArray(0x04, 64);
            const signature2 = createByteArray(0x05, 64);
            const signature3 = createByteArray(0x06, 64);

            const proof1StartBatchId = Buffer.of(0x10, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0);
            const proof1T = createByteArray(0x11);
            const proof1R = createByteArray(0x12);
            const proof1F = createByteArray(0x13);
            const proof1K = createByteArray(0x14);

            const proof2StartBatchId = Buffer.of(0x20, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0);
            const proof2T = createByteArray(0x21);
            const proof2R = createByteArray(0x22);
            const proof2F = createByteArray(0x23);
            const proof2K = createByteArray(0x24);

            const proof3StartBatchId = Buffer.of(0x30, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0);
            const proof3T = createByteArray(0x31);
            const proof3R = createByteArray(0x32);
            const proof3F = createByteArray(0x33);
            const proof3K = createByteArray(0x34);

            const callDigest1callId = createByteArray(0x40)
            const callDigest1manual = Buffer.of(0x01);
            const callDigest1block = Buffer.of(0x41, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0);
            const callDigest1status = Buffer.of(0x42, 0x0);
            const callDigest1releasedTransactionHash = createByteArray(0x43);

            const callDigest2callId = createByteArray(0x50)
            const callDigest2manual = Buffer.of(0x01);
            const callDigest2block = Buffer.of(0x51, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0);
            const callDigest2status = Buffer.of(0x52, 0x0);
            const callDigest2releasedTransactionHash = createByteArray(0x53);

            const callExecutionPayment1 = createByteArray(0x71, 8);
            const callDownloadPayment1 = createByteArray(0x72, 8);
            const callExecutionPayment2 = createByteArray(0x73, 8);
            const callDownloadPayment2 = createByteArray(0x74, 8);
            const callExecutionPayment3 = createByteArray(0x75, 8);
            const callDownloadPayment3 = createByteArray(0x76, 8);
            const callExecutionPayment4 = createByteArray(0x77, 8);
            const callDownloadPayment4 = createByteArray(0x78, 8);
            const callExecutionPayment5 = createByteArray(0x79, 8);
            const callDownloadPayment5 = createByteArray(0x7A, 8);
            const callExecutionPayment6 = createByteArray(0x7B, 8);
            const callDownloadPayment6 = createByteArray(0x7C, 8);

            test.binary.test.addAll(codec,
                32 + 8 + 32 + 2 * 8 + 32 + 8 + 2 + 2 + 3 * 32 + 3 * 64 + 3 * (8 + 4 * 32)
                + 2 * (32 + 1 + 8 + 2 + 32) + 6 * (8 + 8), () => ({
                    buffer: Buffer.concat([
                        contractKey,
                        batchId,
                        storageHash,
                        usedSizeBytes,
                        metaFilesSizeBytes,
                        proofOfExecutionVerificationInformation,
                        automaticExecutionsNextBlockToCheck,
                        cosignersNumber,
                        callsNumber,
                        publicKey1,
                        publicKey2,
                        publicKey3,
                        signature1,
                        signature2,
                        signature3,
                        proof1StartBatchId,
                        proof1T,
                        proof1R,
                        proof1F,
                        proof1K,
                        proof2StartBatchId,
                        proof2T,
                        proof2R,
                        proof2F,
                        proof2K,
                        proof3StartBatchId,
                        proof3T,
                        proof3R,
                        proof3F,
                        proof3K,
                        callDigest1callId,
                        callDigest1manual,
                        callDigest1block,
                        callDigest1status,
                        callDigest1releasedTransactionHash,
                        callDigest2callId,
                        callDigest2manual,
                        callDigest2block,
                        callDigest2status,
                        callDigest2releasedTransactionHash,
                        callExecutionPayment1,
                        callDownloadPayment1,
                        callExecutionPayment2,
                        callDownloadPayment2,
                        callExecutionPayment3,
                        callDownloadPayment3,
                        callExecutionPayment4,
                        callDownloadPayment4,
                        callExecutionPayment5,
                        callDownloadPayment5,
                        callExecutionPayment6,
                        callDownloadPayment6,
                    ]),
                    object: {
                        contractKey,
                        batchId: [0x02, 0x00],
                        storageHash,
                        usedSizeBytes: [0x05, 0x00],
                        metaFilesSizeBytes: [0x06, 0x00],
                        proofOfExecutionVerificationInformation,
                        automaticExecutionsNextBlockToCheck: [0x03, 0x00],
                        publicKeys: [
                            publicKey1,
                            publicKey2,
                            publicKey3
                        ],
                        signatures: [
                            signature1,
                            signature2,
                            signature3
                        ],
                        proofsOfExecution: [
                            {
                                startBatchId: [0x10, 0x00],
                                T: proof1T,
                                R: proof1R,
                                F: proof1F,
                                K: proof1K
                            },
                            {
                                startBatchId: [0x20, 0x00],
                                T: proof2T,
                                R: proof2R,
                                F: proof2F,
                                K: proof2K
                            }, {
                                startBatchId: [0x30, 0x00],
                                T: proof3T,
                                R: proof3R,
                                F: proof3F,
                                K: proof3K
                            }
                        ],
                        callDigests: [
                            {
                                callId: callDigest1callId,
                                manual: 0x01,
                                block: [0x41, 0x0],
                                status: 0x42,
                                releasedTransactionHash: callDigest1releasedTransactionHash
                            },
                            {
                                callId: callDigest2callId,
                                manual: 0x01,
                                block: [0x51, 0x0],
                                status: 0x52,
                                releasedTransactionHash: callDigest2releasedTransactionHash
                            }
                        ],
                        callPayments: [
                            {
                                executionPayment: [0x71, 0x00],
                                downloadPayment: [0x72, 0x00]
                            },
                            {
                                executionPayment: [0x73, 0x00],
                                downloadPayment: [0x74, 0x00]
                            },
                            {
                                executionPayment: [0x75, 0x00],
                                downloadPayment: [0x76, 0x00]
                            },
                            {
                                executionPayment: [0x77, 0x00],
                                downloadPayment: [0x78, 0x00]
                            },
                            {
                                executionPayment: [0x79, 0x00],
                                downloadPayment: [0x7A, 0x00]
                            }, {
                                executionPayment: [0x7B, 0x00],
                                downloadPayment: [0x7C, 0x00]
                            }
                        ]
                    }
                }));
        });

        describe('supports unsuccessful end batch execution transaction', () => {
            const codec = getCodecs()[EntityType.unsuccessfulEndBatchExecution];
            const contractKey = createByteArray(0x01);
            const batchId = Buffer.of(0x02, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0);
            const automaticExecutionsNextBlockToCheck = Buffer.of(0x03, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0);

            const cosignersNumber = Buffer.of(0x03, 0x00);
            const callsNumber = Buffer.of(0x02, 0x00);

            const publicKey1 = createByteArray(0x01);
            const publicKey2 = createByteArray(0x02);
            const publicKey3 = createByteArray(0x03);

            const signature1 = createByteArray(0x04, 64);
            const signature2 = createByteArray(0x05, 64);
            const signature3 = createByteArray(0x06, 64);

            const proof1StartBatchId = Buffer.of(0x10, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0);
            const proof1T = createByteArray(0x11);
            const proof1R = createByteArray(0x12);
            const proof1F = createByteArray(0x13);
            const proof1K = createByteArray(0x14);

            const proof2StartBatchId = Buffer.of(0x20, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0);
            const proof2T = createByteArray(0x21);
            const proof2R = createByteArray(0x22);
            const proof2F = createByteArray(0x23);
            const proof2K = createByteArray(0x24);

            const proof3StartBatchId = Buffer.of(0x30, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0);
            const proof3T = createByteArray(0x31);
            const proof3R = createByteArray(0x32);
            const proof3F = createByteArray(0x33);
            const proof3K = createByteArray(0x34);

            const callDigest1callId = createByteArray(0x40)
            const callDigest1manual = Buffer.of(0x01);
            const callDigest1block = Buffer.of(0x41, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0);

            const callDigest2callId = createByteArray(0x50)
            const callDigest2manual = Buffer.of(0x01);
            const callDigest2block = Buffer.of(0x51, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0);

            const callExecutionPayment1 = createByteArray(0x71, 8);
            const callDownloadPayment1 = createByteArray(0x72, 8);
            const callExecutionPayment2 = createByteArray(0x73, 8);
            const callDownloadPayment2 = createByteArray(0x74, 8);
            const callExecutionPayment3 = createByteArray(0x75, 8);
            const callDownloadPayment3 = createByteArray(0x76, 8);
            const callExecutionPayment4 = createByteArray(0x77, 8);
            const callDownloadPayment4 = createByteArray(0x78, 8);
            const callExecutionPayment5 = createByteArray(0x79, 8);
            const callDownloadPayment5 = createByteArray(0x7A, 8);
            const callExecutionPayment6 = createByteArray(0x7B, 8);
            const callDownloadPayment6 = createByteArray(0x7C, 8);

            test.binary.test.addAll(codec,
                32 + 8 + 8 + 2 + 2 + 3 * 32 + 3 * 64 + 3 * (8 + 4 * 32)
                + 2 * (32 + 1 + 8) + 6 * (8 + 8), () => ({
                    buffer: Buffer.concat([
                        contractKey,
                        batchId,
                        automaticExecutionsNextBlockToCheck,
                        cosignersNumber,
                        callsNumber,
                        publicKey1,
                        publicKey2,
                        publicKey3,
                        signature1,
                        signature2,
                        signature3,
                        proof1StartBatchId,
                        proof1T,
                        proof1R,
                        proof1F,
                        proof1K,
                        proof2StartBatchId,
                        proof2T,
                        proof2R,
                        proof2F,
                        proof2K,
                        proof3StartBatchId,
                        proof3T,
                        proof3R,
                        proof3F,
                        proof3K,
                        callDigest1callId,
                        callDigest1manual,
                        callDigest1block,
                        callDigest2callId,
                        callDigest2manual,
                        callDigest2block,
                        callExecutionPayment1,
                        callDownloadPayment1,
                        callExecutionPayment2,
                        callDownloadPayment2,
                        callExecutionPayment3,
                        callDownloadPayment3,
                        callExecutionPayment4,
                        callDownloadPayment4,
                        callExecutionPayment5,
                        callDownloadPayment5,
                        callExecutionPayment6,
                        callDownloadPayment6,
                    ]),
                    object: {
                        contractKey,
                        batchId: [0x02, 0x00],
                        automaticExecutionsNextBlockToCheck: [0x03, 0x00],
                        publicKeys: [
                            publicKey1,
                            publicKey2,
                            publicKey3
                        ],
                        signatures: [
                            signature1,
                            signature2,
                            signature3
                        ],
                        proofsOfExecution: [
                            {
                                startBatchId: [0x10, 0x00],
                                T: proof1T,
                                R: proof1R,
                                F: proof1F,
                                K: proof1K
                            },
                            {
                                startBatchId: [0x20, 0x00],
                                T: proof2T,
                                R: proof2R,
                                F: proof2F,
                                K: proof2K
                            }, {
                                startBatchId: [0x30, 0x00],
                                T: proof3T,
                                R: proof3R,
                                F: proof3F,
                                K: proof3K
                            }
                        ],
                        callDigests: [
                            {
                                callId: callDigest1callId,
                                manual: 0x01,
                                block: [0x41, 0x0],
                            },
                            {
                                callId: callDigest2callId,
                                manual: 0x01,
                                block: [0x51, 0x0],
                            }
                        ],
                        callPayments: [
                            {
                                executionPayment: [0x71, 0x00],
                                downloadPayment: [0x72, 0x00]
                            },
                            {
                                executionPayment: [0x73, 0x00],
                                downloadPayment: [0x74, 0x00]
                            },
                            {
                                executionPayment: [0x75, 0x00],
                                downloadPayment: [0x76, 0x00]
                            },
                            {
                                executionPayment: [0x77, 0x00],
                                downloadPayment: [0x78, 0x00]
                            },
                            {
                                executionPayment: [0x79, 0x00],
                                downloadPayment: [0x7A, 0x00]
                            }, {
                                executionPayment: [0x7B, 0x00],
                                downloadPayment: [0x7C, 0x00]
                            }
                        ]
                    }
                }));
        });

        describe('supports end batch execution single transaction', () => {
            const codec = getCodecs()[EntityType.endBatchExecutionSingle];
            const contractKey = createByteArray(0x01);
            const batchId = Buffer.of(0x0B, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0);

            const poExStartBatchId = Buffer.of(0x0A, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0);
            const poExT = createByteArray(0x02);
            const poExR = createByteArray(0x03);
            const poExF = createByteArray(0x04);
            const poExK = createByteArray(0x05);

            test.binary.test.addAll(codec, 32 + 8 + 8 + 4 * 32, () => ({
                buffer: Buffer.concat([
                    contractKey,
                    batchId,
                    poExStartBatchId,
                    poExT,
                    poExR,
                    poExF,
                    poExK
                ]),
                object: {
                    contractKey,
                    batchId: [0x0B, 0x00],
                    poEx: {
                        startBatchId: [0x0A, 0x00],
                        T: poExT,
                        R: poExR,
                        F: poExF,
                        K: poExK
                    }
                }
            }));
        });

        describe('supports synchronization single transaction', () => {
            const codec = getCodecs()[EntityType.synchronizationSingle];
            const contractKey = createByteArray(0x01);
            const batchId = Buffer.of(0x02, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0);

            test.binary.test.addAll(codec, 32 + 8, () => ({
                buffer: Buffer.concat([
                    contractKey,
                    batchId,
                ]),
                object: {
                    contractKey,
                    batchId: [0x02, 0x00]
                }
            }));
        });
    });
});