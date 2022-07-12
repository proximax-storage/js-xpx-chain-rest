/**
 *** Copyright 2019 ProximaX Limited. All rights reserved.
 *** Use of this source code is governed by the Apache 2.0
 *** license that can be found in the LICENSE file.
 * */

const accountRestrictionRoutes = require('../../../src/plugins/routes/accountRestrictionRoutes');
const catapult = require('catapult-sdk');
const { test } = require('../../routes/utils/routeTestUtils');
const { address } = catapult.model;
const { addresses } = test.sets;

describe('account restriction routes', () => {
	describe('by address', () => {
		const parsedAddresses = addresses.valid.map(address.stringToAddress);
		test.route.document.addGetPostDocumentRouteTests(accountRestrictionRoutes.register, {
			routes: { singular: '/restrictions/account/:address', plural: '/restrictions/account' },
			inputs: {
				valid: { object: { address: addresses.valid[0] }, parsed: [parsedAddresses[0]], printable: addresses.valid[0] },
				validMultiple: { object: { addresses: addresses.valid }, parsed: parsedAddresses },
				invalid: { object: { address: '12345' }, error: 'address has an invalid format' },
				invalidMultiple: {
					object: { addresses: [addresses.valid[0], '12345'] },
					error: 'element in array addresses has an invalid format'
				}
			},

			dbApiName: 'accountRestrictionsByAddresses',
			type: 'accountRestrictions'
		});
	});
});
