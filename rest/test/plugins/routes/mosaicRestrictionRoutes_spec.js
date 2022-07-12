/**
 *** Copyright 2019 ProximaX Limited. All rights reserved.
 *** Use of this source code is governed by the Apache 2.0
 *** license that can be found in the LICENSE file.
 * */

const mosaicRestrictionRoutes = require('../../../src/plugins/routes/mosaicRestrictionRoutes');
const catapult = require('catapult-sdk');
const routeResultTypes = require('../../../src/routes/routeResultTypes');
const routeUtils = require('../../../src/routes/routeUtils');
const { test, MockServer} = require('../../routes/utils/routeTestUtils');
const sinon = require("sinon");
const { address } = catapult.model;
const { expect } = require('chai');
const { addresses } = test.sets;

describe('account restriction routes', () => {
	const testMosaicId = '0DC67FBE1CAD29E3';
	const testMosaicIdParsed = [0x1CAD29E3, 0x0DC67FBE];
	const testAddress = 'SSBZ22LWA7GDZLPLQF7PXTMNLWSEZ7ZRVGRMWLXQ';

	const emptyPageSample = {
		data: [],
		pagination: {
			pageNumber: 1,
			pageSize: 10
		}
	};

	const pageSample = {
		data: [
			{
				id: '',
				mosaicRestrictionEntry: {
					compositeHash: '',
					entryType: 0,
					mosaicId: '',
					targetAddress: '',
					restrictions: []
				}
			},
			{
				id: '',
				mosaicRestrictionEntry: {
					compositeHash: '',
					entryType: 1,
					mosaicId: '',
					restrictions: []
				}
			}
		],
		pagination: {
			pageNumber: 1,
			pageSize: 10
		}
	};

	const dbMosaicRestrictionsFake = sinon.fake(mosaicId =>
		(mosaicId ? Promise.resolve(emptyPageSample) : Promise.resolve(pageSample)));

	const services = {
		config: {
			pageSize: {
				min: 10,
				max: 100,
				default: 20
			}
		}
	};

	const mockServer = new MockServer();
	const db = { mosaicRestrictions: dbMosaicRestrictionsFake };
	mosaicRestrictionRoutes.register(mockServer.server, db, services);

	beforeEach(() => {
		mockServer.resetStats();
		dbMosaicRestrictionsFake.resetHistory();
	});

	describe('GET', () => {
		const route = mockServer.getRoute('/restrictions/mosaic').get();

		it('parses and forwards paging options', () => {
			// Arrange:
			const pagingBag = 'fakePagingBagObject';
			const paginationParser = sinon.stub(routeUtils, 'parsePaginationArguments').returns(pagingBag);
			const req = { params: {} };

			// Act:
			return mockServer.callRoute(route, req).then(() => {
				// Assert:
				expect(paginationParser.firstCall.args[0]).to.deep.equal(req.params);
				expect(paginationParser.firstCall.args[2]).to.deep.equal({ id: 'objectId' });

				expect(dbMosaicRestrictionsFake.calledOnce).to.equal(true);
				expect(dbMosaicRestrictionsFake.firstCall.args[3]).to.deep.equal(pagingBag);
				paginationParser.restore();
			});
		});

		it('allowed sort fields are taken into account', () => {
			// Arrange:
			const paginationParserSpy = sinon.spy(routeUtils, 'parsePaginationArguments');
			const expectedAllowedSortFields = { id: 'objectId' };

			// Act:
			return mockServer.callRoute(route, { params: {} }).then(() => {
				// Assert:
				expect(paginationParserSpy.calledOnce).to.equal(true);
				expect(paginationParserSpy.firstCall.args[2]).to.deep.equal(expectedAllowedSortFields);
				paginationParserSpy.restore();
			});
		});

		it('returns empty page if no restrictions found', () => {
			// Arrange:
			const req = { params: { mosaicId: testMosaicId } };

			// Act:
			return mockServer.callRoute(route, req).then(() => {
				// Assert:
				expect(dbMosaicRestrictionsFake.calledOnce).to.equal(true);

				expect(mockServer.send.firstCall.args[0]).to.deep.equal({
					payload: emptyPageSample,
					type: routeResultTypes.mosaicRestrictions,
					structure: 'page'
				});
				expect(mockServer.next.calledOnce).to.equal(true);
			});
		});

		it('forwards mosaicId', () => {
			// Arrange:
			const req = { params: { mosaicId: testMosaicId } };

			// Act:
			return mockServer.callRoute(route, req).then(() => {
				// Assert:
				expect(dbMosaicRestrictionsFake.calledOnce).to.equal(true);
				expect(dbMosaicRestrictionsFake.firstCall.args[0]).to.deep.equal(testMosaicIdParsed);

				expect(mockServer.next.calledOnce).to.equal(true);
			});
		});

		it('forwards entryType', () => {
			// Arrange:
			const req = { params: { entryType: '0' } };

			// Act:
			return mockServer.callRoute(route, req).then(() => {
				// Assert:
				expect(dbMosaicRestrictionsFake.calledOnce).to.equal(true);
				expect(dbMosaicRestrictionsFake.firstCall.args[1]).to.equal(0);

				expect(mockServer.next.calledOnce).to.equal(true);
			});
		});

		it('forwards targetAddress', () => {
			// Arrange:
			const req = { params: { targetAddress: testAddress } };

			// Act:
			return mockServer.callRoute(route, req).then(() => {
				// Assert:
				expect(dbMosaicRestrictionsFake.calledOnce).to.equal(true);
				expect(dbMosaicRestrictionsFake.firstCall.args[2]).to.deep.equal(address.stringToAddress(testAddress));

				expect(mockServer.next.calledOnce).to.equal(true);
			});
		});

		it('returns page with results', () => {
			// Arrange:
			const req = { params: {} };

			// Act:
			return mockServer.callRoute(route, req).then(() => {
				// Assert:
				expect(dbMosaicRestrictionsFake.calledOnce).to.equal(true);
				expect(dbMosaicRestrictionsFake.firstCall.args[0]).to.deep.equal(undefined);

				expect(mockServer.send.firstCall.args[0]).to.deep.equal({
					payload: pageSample,
					type: routeResultTypes.mosaicRestrictions,
					structure: 'page'
				});
				expect(mockServer.next.calledOnce).to.equal(true);
			});
		});

		it('throws error if mosaicId is invalid', () => {
			// Arrange:
			const req = { params: { mosaicId: '12345' } };

			// Act + Assert:
			expect(() => mockServer.callRoute(route, req)).to.throw('mosaicId has an invalid format');
		});

		it('throws error if entryType is invalid', () => {
			// Arrange:
			const req = { params: { entryType: '-1' } };

			// Act + Assert:
			expect(() => mockServer.callRoute(route, req)).to.throw('entryType has an invalid format');
		});

		it('throws error if targetAddress is invalid', () => {
			// Arrange:
			const req = { params: { targetAddress: 'AB12345' } };

			// Act + Assert:
			expect(() => mockServer.callRoute(route, req)).to.throw('targetAddress has an invalid format');
		});

		describe('by compositeHash', () => {
			const compositeHashes = ['C54AFD996DF1F52748EBC5B40F8D0DC242A6A661299149F5F96A0C21ECCB653F'];
			const parsedCompositeHashes = compositeHashes.map(routeUtils.namedParserMap.hash256);
			test.route.document.addGetPostDocumentRouteTests(mosaicRestrictionRoutes.register, {
				routes: { singular: '/restrictions/mosaic/:compositeHash', plural: '/restrictions/mosaic' },
				inputs: {
					valid: {
						object: { compositeHash: compositeHashes[0] },
						parsed: [parsedCompositeHashes[0]],
						printable: compositeHashes[0]
					},
					validMultiple: { object: { compositeHashes }, parsed: parsedCompositeHashes },
					invalid: { object: { compositeHash: '12345' }, error: 'compositeHash has an invalid format' },
					invalidMultiple: {
						object: { compositeHashes: [compositeHashes[0], '12345'] },
						error: 'element in array compositeHashes has an invalid format'
					}
				},

				dbApiName: 'mosaicRestrictionByCompositeHash',
				type: 'mosaicRestrictions'
			});
		});
	});
});
