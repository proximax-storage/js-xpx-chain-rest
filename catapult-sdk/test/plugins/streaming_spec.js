/**
 *** Copyright 2021 ProximaX Limited. All rights reserved.
 *** Use of this source code is governed by the Apache 2.0
 *** license that can be found in the LICENSE file.
 * */

const EntityType = require('../../src/model/EntityType');
const ModelSchemaBuilder = require('../../src/model/ModelSchemaBuilder');
const test = require('../binaryTestUtils');
const { expect } = require('chai');

const streamingPlugin = require('../../src/plugins/streaming');
const ModelType = require("../../src/model/ModelType");

describe('streaming plugin', () => {
    describe('register schema', () => {
        it('adds streaming system schema', () => {
            // Arrange:
            const builder = new ModelSchemaBuilder();
            const numDefaultKeys = Object.keys(builder.build()).length;

            // Act:
            streamingPlugin.registerSchema(builder);
            const modelSchema = builder.build();

            // Assert:
            expect(Object.keys(modelSchema).length).to.equal(numDefaultKeys + 1);
            expect(modelSchema).to.contain.all.keys([
                'streamStart',
            ]);

            expect(Object.keys(modelSchema.streamStart).length).to.equal(Object.keys(modelSchema.transaction).length + 4);
            expect(modelSchema.streamStart).to.contain.all.keys([
                'driveKey',
                'expectedUploadSize',
                'folder',
                'feedbackFeeAmount',
            ]);
        });
    });

    describe('register codecs', () => {
        const getCodecs = () => {
            const codecs = {};
            streamingPlugin.registerCodecs({
                addTransactionSupport: (type, codec) => { codecs[type] = codec; }
            });

            return codecs;
        };

        it('adds streaming codecs', () => {
            // Act:
            const codecs = getCodecs();

            // Assert: codec was registered
            expect(Object.keys(codecs).length).to.equal(1);
            expect(codecs).to.contain.all.keys([
                EntityType.streamStart.toString(),
            ]);
        });

        const createByteArray = (number, size = 32) => {
            const hash = new Uint8Array(size);
            hash[0] = number;

            return hash;
        };

        describe('supports stream start transaction', () => {
            const codec = getCodecs()[EntityType.streamStart];
            const driveKey = createByteArray(0x01);
            const expectedUploadSize = Buffer.of(0x03, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00);
            const feedbackFeeAmount = Buffer.of(0x04, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00);
            const folder = Buffer.of(0x41, 0x42, 0x43, 0x44, 0x44);
            const folderSize = Buffer.of(0x05, 0x00)


            test.binary.test.addAll(codec, 32 + 8 + 2 + 8 + 5, () => ({
                buffer: Buffer.concat([
                    driveKey,
                    expectedUploadSize,
                    folderSize,
                    feedbackFeeAmount,
                    folder
                ]),
                object: {
                    driveKey,
                    expectedUploadSize: [0x03, 0x0],
                    folder: folder,
                    feedbackFeeAmount: [0x04, 0x0],
                }
            }));
        });
    });
});
