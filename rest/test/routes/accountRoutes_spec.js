/*
 * Copyright (c) 2016-present,
 * Jaguar0625, gimre, BloodyRookie, Tech Bureau, Corp. All rights reserved.
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

const accountRoutes = require('../../src/routes/accountRoutes');
const catapult = require('catapult-sdk');
const test = require('./utils/routeTestUtils');
const { expect } = require('chai');

const { address } = catapult.model;
const { convert } = catapult.utils;
const { addresses, publicKeys } = test.sets;

describe('account routes', () => {
	describe('get by account', () => {
		const addGetTests = (key, ids, parsedIds, validBody, invalidBody, errorMessage) => {
			test.route.document.addGetPostDocumentRouteTests(accountRoutes.register, {
				routes: { singular: '/account/:accountId', plural: '/account' },
				inputs: {
					valid: { object: { accountId: ids[0] }, parsed: [{ [key]: parsedIds[0] }], printable: ids[0] },
					validMultiple: { object: validBody, parsed: parsedIds.map(parsedId => ({ [key]: parsedId })) },
					invalid: { object: { accountId: '12345' }, error: 'accountId has an invalid format' },
					invalidMultiple: {
						object: invalidBody,
						error: errorMessage
					}
				},
				dbApiName: 'accountsByIds',
				type: 'accountWithMetadata',
				config: { transactionStates: [] }
			});
		};

		describe('by address', () =>
			addGetTests(
				'address',
				addresses.valid,
				addresses.valid.map(address.stringToAddress),
				{ addresses: addresses.valid },
				{ addresses: [addresses.valid[0], '12345', addresses.valid[1]] },
				'element in array addresses has an invalid format'
			));

		describe('by publicKey', () =>
			addGetTests(
				'publicKey',
				publicKeys.valid,
				publicKeys.valid.map(convert.hexToUint8),
				{ publicKeys: publicKeys.valid },
				{ publicKeys: [publicKeys.valid[0], '12345', publicKeys.valid[1]] },
				'element in array publicKeys has an invalid format'
			));

		it('does not support publicKeys and addresses provided at the same time', () => {
			// Arrange:
			const keyGroups = [];
			const db = test.setup.createCapturingDb('accountsByIds', keyGroups, [{ value: 'this is nonsense' }]);

			// Act:
			const registerRoutes = accountRoutes.register;
			const errorMessage = 'publicKeys and addresses cannot both be provided';
			return test.route.executeThrows(
				registerRoutes,
				'/account',
				'post',
				{ addresses: addresses.valid, publicKeys: publicKeys.valid },
				db,
				{ transactionStates: [] },
				errorMessage,
				409
			);
		});
	});

	describe('account transactions', () => {
		const addAccountTransactionsPublicKeyTests = (apiPath, dbApiPath) => {
			describe(dbApiPath, () => {
				const pagingTestsFactory = test.setup.createPagingTestsFactory(
					{
						routes: accountRoutes,
						routeName: `/account/:accountId/${apiPath}`,
						createDb: (queriedIdentifiers, transactions) => ({
							[dbApiPath]: (accountId, pageId, pageSize) => {
								queriedIdentifiers.push({ accountId, pageId, pageSize });
								return Promise.resolve(transactions);
							}
						}),
						config: { transactionStates: [{ dbPostfix: 'Partial', routePostfix: '/partial' }] }
					},
					{ accountId: publicKeys.valid[0] },
					{ accountId: { accountId: convert.hexToUint8(publicKeys.valid[0]), type: 'publicKey' } },
					'transactionWithMetadata'
				);

				pagingTestsFactory.addDefault();
				pagingTestsFactory.addNonPagingParamFailureTest('accountId', '12345');
			});
		};

		const addAccountTransactionsAddressTests = (apiPath, dbApiPath) => {
			describe(dbApiPath, () => {
				const pagingTestsFactory = test.setup.createPagingTestsFactory(
					{
						routes: accountRoutes,
						routeName: `/account/:accountId/${apiPath}`,
						createDb: (queriedIdentifiers, transactions) => ({
							[dbApiPath]: (accountId, pageId, pageSize) => {
								queriedIdentifiers.push({ accountId, pageId, pageSize });
								return Promise.resolve(transactions);
							}
						}),
						config: { transactionStates: [{ dbPostfix: 'Partial', routePostfix: '/partial' }] }
					},
					{ accountId: addresses.valid[0] },
					{ accountId: { accountId: address.stringToAddress(addresses.valid[0]), type: 'address' } },
					'transactionWithMetadata'
				);

				pagingTestsFactory.addDefault();
				pagingTestsFactory.addNonPagingParamFailureTest('accountId', '12345');
			});
		};

		// default transaction states
		addAccountTransactionsPublicKeyTests('transactions', 'accountTransactionsAll');
		addAccountTransactionsPublicKeyTests('transactions/incoming', 'accountTransactionsIncoming');
		addAccountTransactionsPublicKeyTests('transactions/outgoing', 'accountTransactionsOutgoing');
		addAccountTransactionsPublicKeyTests('transactions/unconfirmed', 'accountTransactionsUnconfirmed');

		// custom transaction states (enabled via custom configuration)
		addAccountTransactionsPublicKeyTests('transactions/partial', 'accountTransactionsPartial');

		addAccountTransactionsAddressTests('transactions/incoming', 'accountTransactionsIncoming');

		const addOrderingParamTests = (apiPath, dbApiPath) => {
			describe(dbApiPath, () => {
				// Arrange:
				const createDb = (queriedIdentifiers, transactions) => ({
					[dbApiPath]: (accountId, pageId, pageSize, ordering) => {
						queriedIdentifiers.push({
							accountId, pageId, pageSize, ordering
						});
						return Promise.resolve(transactions);
					}
				});
				const keyGroups = [];
				const db = createDb(keyGroups, []);

				// Act:
				it('queries the database with ordering param', () => test.route.executeSingle(
					accountRoutes.register,
					`/account/:accountId/${apiPath}`,
					'get',
					Object.assign({}, { accountId: publicKeys.valid[0] }, { ordering: 'id' }),
					db,
					{ transactionStates: [{ dbPostfix: 'Partial', routePostfix: '/partial' }] },
					() => {
						// Assert:
						expect(keyGroups).to.deep.equal([Object.assign(
							{},
							{ accountId: { accountId: convert.hexToUint8(publicKeys.valid[0]), type: 'publicKey' } },
							{ pageId: undefined, pageSize: 0, ordering: 1 }
						)]);
					}
				));
			});
		};

		// default transaction states
		addOrderingParamTests('transactions', 'accountTransactionsAll');
		addOrderingParamTests('transactions/incoming', 'accountTransactionsIncoming');
		addOrderingParamTests('transactions/outgoing', 'accountTransactionsOutgoing');
		addOrderingParamTests('transactions/unconfirmed', 'accountTransactionsUnconfirmed');

		// custom transaction states (enabled via custom configuration)
		addOrderingParamTests('transactions/partial', 'accountTransactionsPartial');
	});
});
