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
            folder:                 { type: ModelType.binary, schemaName: 'streamStart.folder' },
            feedbackFeeAmount:		{ type: ModelType.uint64, schemaName: 'streamStart.feedbackFeeAmount' },
        });
    },
    registerCodecs: codecBuilder => {
        codecBuilder.addTransactionSupport(EntityType.streamStart, {
            deserialize: parser => {
                const transaction = {};
                transaction.driveKey = parser.buffer(constants.sizes.signer);
                transaction.expectedUploadSize = parser.uint64();
                const folderSize = parser.uint16();
                transaction.feedbackFeeAmount = parser.uint64();
                if (0 < folderSize) {
                    transaction.folder = parser.buffer(folderSize);
                }

                return transaction;
            },

            serialize: (transaction, serializer) => {
                serializer.writeBuffer(transaction.driveKey);
                serializer.writeUint64(transaction.expectedUploadSize);

                if (transaction.folder) {
                    const payloadSize = transaction.folder.length;
                    serializer.writeUint16(payloadSize);
                } else {
                    serializer.writeUint16(0);
                }

                serializer.writeUint64(transaction.feedbackFeeAmount);

                if (transaction.folder) {
                    serializer.writeBuffer(transaction.folder);
                }
            }
        });
    }
}

module.exports = streamingPlugin;