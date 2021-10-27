/**
 *** Copyright 2021 ProximaX Limited. All rights reserved.
 *** Use of this source code is governed by the Apache 2.0
 *** license that can be found in the LICENSE file.
 **/

/** @module plugins/storage */
const EntityType = require('../model/EntityType');
const ModelType = require('../model/ModelType');
const sizes = require('../modelBinary/sizes');

const constants = { sizes };

/**
 * Creates a storage plugin.
 * @type {module:plugins/CatapultPlugin}
 */
const streamingPlugin = {
    registerSchema: builder => {
        builder.addTransactionSupport(EntityType.streamStart, {
            driveKey:				{ type: ModelType.binary, schemaName: 'streamStart.driveKey' },
            expectedUploadSize:		{ type: ModelType.uint64, schemaName: 'streamStart.expectedUploadSize' },
            folderName:             { type: ModelType.string, schemaName: 'streamStart.folderName' },
            feedbackFeeAmount:		{ type: ModelType.uint64, schemaName: 'streamStart.feedbackFeeAmount' },
        });

        builder.addTransactionSupport(EntityType.streamFinish, {
            driveKey:				{ type: ModelType.binary, schemaName: 'streamFinish.driveKey' },
            streamId:               { type: ModelType.binary, schemaName: 'streamFinish.streamId' },
            actualUploadSize:		{ type: ModelType.uint64, schemaName: 'streamFinish.actualUploadSize' },
            streamStructureCdi:	    { type: ModelType.binary, schemaName: 'streamFinish.streamStructureCdi' },
        });
    },
    registerCodecs: codecBuilder => {
        codecBuilder.addTransactionSupport(EntityType.streamStart, {
            deserialize: parser => {
                const transaction = {};
                transaction.driveKey = parser.buffer(constants.sizes.signer);
                transaction.expectedUploadSize = parser.uint64();
                const folderNameSize = parser.uint16();
                transaction.feedbackFeeAmount = parser.uint64();
                transaction.folderName = parser.buffer(folderNameSize);

                return transaction;
            },

            serialize: (transaction, serializer) => {
                serializer.writeBuffer(transaction.driveKey);
                serializer.writeUint64(transaction.expectedUploadSize);
                const payloadSize = transaction.folderName.length;
                serializer.writeUint16(payloadSize);
                serializer.writeUint64(transaction.feedbackFeeAmount);
                serializer.writeBuffer(transaction.folderName);
            }
        });

        codecBuilder.addTransactionSupport(EntityType.streamFinish, {
            deserialize: parser => {
                const transaction = {};
                transaction.driveKey = parser.buffer(constants.sizes.signer);
                transaction.streamId = parser.buffer(constants.sizes.hash256)
                transaction.actualUploadSize = parser.uint64();
                transaction.streamStructureCdi = parser.buffer(constants.sizes.hash256)

                return transaction;
            },

            serialize: (transaction, serializer) => {
                serializer.writeBuffer(transaction.driveKey);
                serializer.writeBuffer(transaction.streamId);
                serializer.writeUint64(transaction.actualUploadSize);
                serializer.writeBuffer(transaction.streamStructureCdi)
            }
        });
    }
}

module.exports = streamingPlugin;