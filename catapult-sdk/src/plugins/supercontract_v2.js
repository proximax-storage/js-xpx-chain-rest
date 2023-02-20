/**
 *** Copyright 2023 ProximaX Limited. All rights reserved.
 *** Use of this source code is governed by the Apache 2.0
 *** license that can be found in the LICENSE file.
 **/

/** @module plugins/mosaic */
const EntityType = require('../model/EntityType');
const ModelType = require('../model/ModelType');
const uint64 = require('../utils/uint64');
const sizes = require('../modelBinary/sizes');

const constants = { sizes };

/**
 * Creates a super contract plugin.
 * @type {module:plugins/CatapultPlugin}
 */
const superContractV2Plugin = {
    registerSchema: builder => {
        builder.addTransactionSupport(EntityType.deployContract, {
            signer:                             ModelType.binary,
            driveKey:                           ModelType.binary,
            assignee:                           ModelType.binary,
            automaticExecutionFileName:         ModelType.string,
            automaticExecutionsFunctionName:    ModelType.string,
            automaticExecutionCallPayment:      ModelType.uint64,
            automaticDownloadCallPayment:       ModelType.uint64,
            actualArguments:                    ModelType.string,
            servicePayments:                    { type: ModelType.array, schemaName: 'servicePayment' },
            automaticExecutionsNumber:          ModelType.uint32,
            executionCallPayment:               ModelType.uint64,
            downloadCallPayment:                ModelType.uint64,
        });

        builder.addTransactionSupport(EntityType.manualCall, {
            signer:                 ModelType.binary,
            contractKey:            ModelType.binary,
            fileName:               ModelType.string,
            functionName:           ModelType.string,
            actualArguments:        ModelType.string,
            servicePayments:        { type: ModelType.array, schemaName: 'servicePayment' },
            executionCallPayment:   ModelType.uint64,
            downloadCallPayment:    ModelType.uint64,
        });

        builder.addTransactionSupport(EntityType.automaticExecutionsPayment, {
            contractKey:                ModelType.binary,
            automaticExecutionsNumber:  ModelType.uint32,
            signer:                     ModelType.binary,
        });

        builder.addTransactionSupport(EntityType.successfulEndBatchExecution, {
            contractKey:                                ModelType.binary,
            batchId:                                    ModelType.uint64,
            automaticExecutionsNextBlockToCheck:        ModelType.uint64,
            storageHash:                                ModelType.binary,
            usedSizeBytes:                              ModelType.uint64,
            metaFilesSizeBytes:                         ModelType.uint64,
            proofOfExecutionVerificationInformation:    ModelType.binary,
            extendedCallDigests:                        { type: ModelType.array, schemaName: 'extendedCallDigest' },
            opinions:                                   { type: ModelType.array, schemaName: 'opinion' },
            cosignersList:                              { type: ModelType.array, schemaName: ModelType.binary },
        });

        builder.addTransactionSupport(EntityType.unsuccessfulEndBatchExecution, {
            contractKey:                            ModelType.binary,
            batchId:                                ModelType.uint64,
            automaticExecutionsNextBlockToCheck:    ModelType.uint64,
            shortCallDigests:                       { type: ModelType.array, schemaName: 'shortCallDigest' },
            opinions:                               { type: ModelType.array, schemaName: 'opinion' },
        });

        builder.addTransactionSupport(EntityType.endBatchExecutionSingle, {
            contractKey:    ModelType.binary,
            batchId:        ModelType.uint64,
            signer:         ModelType.binary,
            poEx:           { type: ModelType.array, schemaName: 'poEx' },
        });

        builder.addTransactionSupport(EntityType.synchronizationSingle, {
            contractKey:    ModelType.binary,
            batchId:        ModelType.uint64,
            signer:         ModelType.binary,
        });

        builder.addSchema('servicePayment', {
            id:     ModelType.uint64,
            amount: ModelType.uint64,
        });

        builder.addSchema('shortCallDigest', {
            callId:                     ModelType.binary,
            manual:                     ModelType.boolean,
            block:                      ModelType.uint64,
        });

        builder.addSchema('extendedCallDigest', {
            callId:                     ModelType.binary,
            manual:                     ModelType.boolean,
            block:                      ModelType.uint64,
            status:                     ModelType.uint16,
            releasedTransactionHash:    ModelType.binary,
        });

        builder.addSchema('opinion', {
            poEx:           { type: ModelType.array, schemaName: 'poEx' },
            callPayments:   { type: ModelType.array, schemaName: 'callPayments' },
        });

        builder.addSchema('poEx', {
            startBatchId:   ModelType.uint64,
            T:              ModelType.binary,
            R:              ModelType.binary,
            F:              ModelType.binary,
            K:              ModelType.binary,
        });

        builder.addSchema('callPayment', {
            executionPayment:   ModelType.uint64,
            downloadPayment:    ModelType.uint64,
        });
    },

    registerCodecs: codecBuilder => {
    }
};

module.exports = superContractV2Plugin;
