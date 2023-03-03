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

const test = require('./utils/mosaicDbTestUtils');
const { expect } = require('chai');

describe('mosaic db', () => {
	const createMosaic = (id, mosaicId, parentId, supply, properties) => {
		const owner = test.random.publicKey();
		return test.db.createMosaic(id, mosaicId, owner, parentId, supply, properties);
	};

	const createMosaics = (numNamespaces, numMosaicsPerNamespace) => {
		const owner = test.random.publicKey();
		return test.db.createMosaics(owner, numNamespaces, numMosaicsPerNamespace);
	};

	const createAccountWithMosaics = (ownerPublicKey, mosaicIds)=>{
		return test.db.createAccountWithMosaics(ownerPublicKey, mosaicIds);
	}

	describe('mosaics by ids', () => {

		// Arrange: mosaic ids: 10000, 10001, ... 10011
		const mosaics = createMosaics(3, 4);

		it('returns empty array for unknown mosaic ids', () => {

			// Assert:
			return test.db.runDbTest(
				mosaics,
				db => db.mosaicsByIds([[123, 0]]),
				entities => { expect(entities.length).to.equal(0); }
			);
		});

		it('returns single matching mosaic', () => {

			// Assert:
			return test.db.runDbTest(
				mosaics,
				db => db.mosaicsByIds([[10010, 0]]),
				entities => { expect(entities).to.deep.equal([mosaics[10]]); }
			);
		});

		it('returns multiple matching mosaics', () => {

			// Assert:
			return test.db.runDbTest(
				mosaics,
				db => db.mosaicsByIds([[10010, 0], [10007, 0], [10003, 0]]),
				entities => { expect(entities).to.deep.equal([mosaics[10], mosaics[7], mosaics[3]]); }
			);
		});

		it('returns only known mosaics', () => {

			// Assert:
			return test.db.runDbTest(
				mosaics,
				db => db.mosaicsByIds([[10010, 0], [10021, 0], [10003, 0]]),
				entities => expect(entities).to.deep.equal([mosaics[10], mosaics[3]])
			);
		});
	});

	describe('mosaics', () => {
		it('returns all mosaics', () => {
			// Arrange: mosaic ids: 10000, 10001, ... 10011
			const mosaics = createMosaics(3, 4);
			const options = {
				pageSize: 20,
				pageNumber: 1,
				sortField: 'id',
				sortDirection: 1
			};

			// Assert:
			return test.db.runDbTest(
				mosaics,
				db => db.mosaics({}, options),
				mosaicsPage => expect(mosaicsPage.data.length).to.equal(mosaics.length)
			);
		});

		it('returns single mosaic', () => {
			const mosaics = createMosaics(1, 1);
			const options = {
				pageSize: 20,
				pageNumber: 1,
				sortField: 'id',
				sortDirection: 1
			};

			// Assert:
			return test.db.runDbTest(
				mosaics,
				db => db.mosaics({}, options),
				mosaicsPage => expect(mosaicsPage.data.length).to.equal(1)
			);
		});

		describe('filter by owner', () => {
			// Arrange: mosaic ids: 10000, 10001, ... 10011
			const mosaics = createMosaics(3, 4);
			const otherMosaics = createMosaics(3, 3);
			const options = {
				pageSize: 20,
				pageNumber: 1,
				sortField: 'id',
				sortDirection: 1
			};

			it('first owner', () => {
				const filters = { ownerPubKey : mosaics[mosaics.length-1].owner }

				// Assert:
				return test.db.runDbTest(
					mosaics,
					db => db.mosaics(filters, options),
					mosaicsPage => expect(mosaicsPage.data.length).to.equal(mosaics.length)
				);
			});

			it('second owner', () => {
				const filters = { ownerPubKey : otherMosaics[otherMosaics.length-1].owner }

				// Assert:
				return test.db.runDbTest(
					otherMosaics,
					db => db.mosaics(filters, options),
					mosaicsPage => {
						expect(mosaicsPage.data.length).to.equal(otherMosaics.length)
					}
				);
			});

			it('non-existing owner', () => {
				const filters = { ownerPubKey : test.random.publicKey() }

				// Assert:
				return test.db.runDbTest(
					mosaics,
					db => db.mosaics(filters, options),
					mosaicsPage => expect(mosaicsPage.data.length).to.equal(0)
				);
			});

			// get mosaic ids: 10001, 10002, ... 10005
			const mosaicIdsChunk = mosaics.slice(1, 6).map(x => x.mosaic.mosaicId);
			const ownerBuffer = Buffer.from(mosaics[0].mosaic.owner.read(0, -1));
			const newAccount = createAccountWithMosaics(ownerBuffer, mosaicIdsChunk);

			it('returns mosaics owner holding', () => {
	
				return test.db.runDbTest(
					[newAccount],
					db => db.catapultDb.accountsByIds([{ "publicKey": ownerBuffer }]),
					entities => { 
						const filters = { ownerPubKey: ownerBuffer, holding: true };
						
						return test.db.runDbTest(
							mosaics,
							db => db.mosaics(filters, options),
							mosaicsPage => expect(mosaicsPage.data.length).to.equal(mosaicIdsChunk.length)
						);
					},
					"accounts"
				);
			});

			it('returns mosaics owner not holding', () => {

				return test.db.runDbTest(
					[newAccount],
					db => db.catapultDb.accountsByIds([{ "publicKey": ownerBuffer }]),
					entities => { 
						const filters = { ownerPubKey: ownerBuffer, holding: false };
						
						return test.db.runDbTest(
							mosaics,
							db => db.mosaics(filters, options),
							mosaicsPage => expect(mosaicsPage.data.length).to.equal(mosaics.length - mosaicIdsChunk.length)
						);
					},
					"accounts"
				);
			});
		});

		it('filter by supply', () => {
			const mosaics = createMosaics(1, 1);
			const mosaic = createMosaic(
				mosaics.length,
				mosaics[mosaics.length-1].mosaicId++,
				mosaics[mosaics.length-1].namespaceId++,
				3333
			);
			mosaics.push(mosaic);

			const options = {
				pageSize: 20,
				pageNumber: 1,
				sortField: 'id',
				sortDirection: 1
			};

			const filters = { supply : mosaic.mosaic.supply }

			// Assert:
			return test.db.runDbTest(
				mosaics,
				db => db.mosaics(filters, options),
				mosaicsPage => expect(mosaicsPage.data.length).to.equal(1)
			);
		});

		describe('filter by mutable', () => {
			const mosaics = createMosaics(1, 1);
			const options = {
				pageSize: 20,
				pageNumber: 1,
				sortField: 'id',
				sortDirection: 1
			};

			const filters = { mutable : true }

			it("no mutable mosaics", () => {
				// Assert:
				return test.db.runDbTest(
					mosaics,
					db => db.mosaics(filters, options),
					mosaicsPage => expect(mosaicsPage.data.length).to.equal(0)
				);
			})

			it("only mutable", () => {
				const mosaicsCopy = [...mosaics];
				const mosaic = createMosaic(
					mosaics.length,
					mosaics[mosaics.length-1].mosaicId++,
					mosaics[mosaics.length-1].namespaceId++,
					3333,
					[{
						"id": test.consts.FlagsIndex,
						"value": test.consts.Flags.Supply_Mutable
					}]
				);
				mosaicsCopy.push(mosaic);

				// Assert:
				return test.db.runDbTest(
					mosaicsCopy,
					db => db.mosaics(filters, options),
					mosaicsPage => expect(mosaicsPage.data.length).to.equal(1)
				);
			})

			it("all flags", () => {
				const mosaicsCopy = [...mosaics];
				const mosaic = createMosaic(
					mosaics.length,
					mosaics[mosaics.length-1].mosaicId++,
					mosaics[mosaics.length-1].namespaceId++,
					3333,
					[{
						id: test.consts.FlagsIndex,
						value: test.consts.Flags.All
					}]
				);
				mosaicsCopy.push(mosaic);

				// Assert:
				return test.db.runDbTest(
					mosaicsCopy,
					db => db.mosaics(filters, options),
					mosaicsPage => expect(mosaicsPage.data.length).to.equal(1)
				);
			})
		});

		describe('filter by transferable', () => {
			const mosaics = createMosaics(1, 1);
			const options = {
				pageSize: 20,
				pageNumber: 1,
				sortField: 'id',
				sortDirection: 1
			};

			const filters = { transferable : true }

			it("no transferable mosaics", () => {
				// Assert:
				return test.db.runDbTest(
					mosaics,
					db => db.mosaics(filters, options),
					mosaicsPage => expect(mosaicsPage.data.length).to.equal(0)
				);
			})

			it("only transferable", () => {
				const mosaicsCopy = [...mosaics];
				const mosaic = createMosaic(
					mosaics.length,
					mosaics[mosaics.length-1].mosaicId++,
					mosaics[mosaics.length-1].namespaceId++,
					3333,
					[{
						"id": test.consts.FlagsIndex,
						"value": test.consts.Flags.Transferable
					}]
				);
				mosaicsCopy.push(mosaic);

				// Assert:
				return test.db.runDbTest(
					mosaicsCopy,
					db => db.mosaics(filters, options),
					mosaicsPage => expect(mosaicsPage.data.length).to.equal(1)
				);
			})

			it("all flags", () => {
				const mosaicsCopy = [...mosaics];
				const mosaic = createMosaic(
					mosaics.length,
					mosaics[mosaics.length-1].mosaicId++,
					mosaics[mosaics.length-1].namespaceId++,
					3333,
					[{
						id: test.consts.FlagsIndex,
						value: test.consts.Flags.All
					}]
				);
				mosaicsCopy.push(mosaic);

				// Assert:
				return test.db.runDbTest(
					mosaicsCopy,
					db => db.mosaics(filters, options),
					mosaicsPage => expect(mosaicsPage.data.length).to.equal(1)
				);
			})
		});

		describe('filter by mutable and transferable', () => {
			const mosaics = createMosaics(1, 3);
			let mosaicId = 2222
			const noFlagsMosaic = createMosaic(
				4,
				mosaicId++,
				mosaics[mosaics.length-1].mosaic.namespaceId++,
				3333,
				[{
					"id": test.consts.FlagsIndex,
					"value": test.consts.Flags.None
				}]
			);
			mosaics.push(noFlagsMosaic);

			const allFlagsMosaic = createMosaic(
				5,
				mosaicId++,
				mosaics[mosaics.length-1].mosaic.namespaceId++,
				3333,
				[{
					"id": test.consts.FlagsIndex,
					"value": test.consts.Flags.All
				}]
			);
			mosaics.push(allFlagsMosaic);

			const mutableMosaic = createMosaic(
				6,
				mosaicId++,
				mosaics[mosaics.length-1].mosaic.namespaceId++,
				3333,
				[{
					"id": test.consts.FlagsIndex,
					"value": test.consts.Flags.Supply_Mutable
				}]
			);
			mosaics.push(mutableMosaic);

			const transferableMosaic = createMosaic(
				7,
				mosaicId++,
				mosaics[mosaics.length-1].mosaic.namespaceId++,
				3333,
				[{
					"id": test.consts.FlagsIndex,
					"value": test.consts.Flags.Transferable
				}]
			);
			mosaics.push(transferableMosaic);

			const options = {
				pageSize: 20,
				pageNumber: 1,
				sortField: 'id',
				sortDirection: 1
			};

			it("mutable and transferable", () => {
				const filters = {
					mutable : true,
					transferable : true
				}

				// Assert:
				return test.db.runDbTest(
					mosaics,
					db => db.mosaics(filters, options),
					mosaicsPage => {
						expect(mosaicsPage.data.length).to.equal(1)
						expect(mosaicsPage.data[0].mosaic.mosaicId).to.deep.equal(allFlagsMosaic.mosaic.mosaicId)
					}
				);
			})

			it("not mutable and not transferable", () => {
				const filters = {
					mutable : false,
					transferable : false
				}

				// Assert:
				return test.db.runDbTest(
					mosaics,
					db => db.mosaics(filters, options),
					mosaicsPage => {
						expect(mosaicsPage.data.length).to.equal(1)
						expect(mosaicsPage.data[0].mosaic.mosaicId).to.deep.equal(noFlagsMosaic.mosaic.mosaicId)
					}
				);
			})

			it("not mutable and transferable", () => {
				const filters = {
					mutable : false,
					transferable : true
				}

				// Assert:
				return test.db.runDbTest(
					mosaics,
					db => db.mosaics(filters, options),
					mosaicsPage => {
						expect(mosaicsPage.data.length).to.equal(1)
						expect(mosaicsPage.data[0].mosaic.mosaicId).to.deep.equal(transferableMosaic.mosaic.mosaicId)
					}
				);
			})

			it("mutable and not transferable", () => {
				const filters = {
					mutable : true,
					transferable : false
				}

				// Assert:
				return test.db.runDbTest(
					mosaics,
					db => db.mosaics(filters, options),
					mosaicsPage => {
						expect(mosaicsPage.data.length).to.equal(1)
						expect(mosaicsPage.data[0].mosaic.mosaicId).to.deep.equal(mutableMosaic.mosaic.mosaicId)
					}
				);
			})

			it("just mutable", () => {
				const filters = { mutable : true }

				// Assert:
				return test.db.runDbTest(
					mosaics,
					db => db.mosaics(filters, options),
					mosaicsPage => {
						expect(mosaicsPage.data.length).to.equal(2)
						expect(mosaicsPage.data[0].mosaic.mosaicId).to.deep.equal(allFlagsMosaic.mosaic.mosaicId)
						expect(mosaicsPage.data[1].mosaic.mosaicId).to.deep.equal(mutableMosaic.mosaic.mosaicId)
					}
				);
			})

			it("just not mutable", () => {
				const filters = { mutable : false }

				// Assert:
				return test.db.runDbTest(
					mosaics,
					db => db.mosaics(filters, options),
					mosaicsPage => {
						expect(mosaicsPage.data.length).to.equal(2)
						expect(mosaicsPage.data[0].mosaic.mosaicId).to.deep.equal(noFlagsMosaic.mosaic.mosaicId)
						expect(mosaicsPage.data[1].mosaic.mosaicId).to.deep.equal(transferableMosaic.mosaic.mosaicId)
					}
				);
			})

			it("just transferable", () => {
				const filters = { transferable : true }

				// Assert:
				return test.db.runDbTest(
					mosaics,
					db => db.mosaics(filters, options),
					mosaicsPage => {
						expect(mosaicsPage.data.length).to.equal(2)
						expect(mosaicsPage.data[0].mosaic.mosaicId).to.deep.equal(allFlagsMosaic.mosaic.mosaicId)
						expect(mosaicsPage.data[1].mosaic.mosaicId).to.deep.equal(transferableMosaic.mosaic.mosaicId)
					}
				);
			})

			it("just not transferable", () => {
				const filters = { transferable : false }

				// Assert:
				return test.db.runDbTest(
					mosaics,
					db => db.mosaics(filters, options),
					mosaicsPage => {
						expect(mosaicsPage.data.length).to.equal(2)
						expect(mosaicsPage.data[0].mosaic.mosaicId).to.deep.equal(noFlagsMosaic.mosaic.mosaicId)
						expect(mosaicsPage.data[1].mosaic.mosaicId).to.deep.equal(mutableMosaic.mosaic.mosaicId)
					}
				);
			})
		});
	});
});
