/**
 *** Copyright 2019 ProximaX Limited. All rights reserved.
 *** Use of this source code is governed by the Apache 2.0
 *** license that can be found in the LICENSE file.
 * */

const ModelSchemaBuilder = require('../../src/model/ModelSchemaBuilder');
const { expect } = require('chai');

const richlistPlugin = require('../../src/plugins/richlist');

describe('richlist plugin', () => {
	describe('register schema', () => {
		it('adds richlist system schema', () => {
			// Arrange:
			const builder = new ModelSchemaBuilder();
			const numDefaultKeys = Object.keys(builder.build()).length;

			// Act:
			richlistPlugin.registerSchema(builder);
			const modelSchema = builder.build();

			// Assert:
			expect(Object.keys(modelSchema).length).to.equal(numDefaultKeys + 1);
			expect(modelSchema).to.contain.all.keys(['richlistEntry']);

			// - richlistEntry
			expect(Object.keys(modelSchema['richlistEntry']).length).to.equal(2);
			expect(modelSchema['richlistEntry'])
				.to.contain.all.keys(['address', 'amount']);
		});
	});

});
