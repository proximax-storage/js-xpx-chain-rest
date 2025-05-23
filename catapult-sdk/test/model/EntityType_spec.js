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

const EntityType = require('../../src/model/EntityType');
const { expect } = require('chai');

describe('entity type enumeration', () => {
	it('exposes expected types', () => {
		// Assert:
		expect(EntityType).to.deep.equal({
			accountLink: 0x414C,
			accountPropertiesAddress: 0x4150,
			accountPropertiesEntityType: 0x4350,
			accountPropertiesMosaic: 0x4250,
			addHarvester: 0x4161,
			aggregateBonded: 0x4241,
			aggregateComplete: 0x4141,
			aliasAddress: 0x424E,
			aliasMosaic: 0x434E,
			blockchainUpgrade: 0x4158,
			deactivate: 0x4560,
			deploy: 0x4160,
			driveFilesReward: 0x465A,
			driveFileSystem: 0x435A,
			endDrive: 0x455A,
			endDriveVerification: 0x485A,
			endExecute: 0x4360,
			endOperation: 0x435F,
			exchange: 0x425D,
			exchangeOffer: 0x415D,
			endFileDownload: 0x4A5A,
			filesDeposit: 0x445A,
			hashLock: 0x4148,
			joinToDrive: 0x425A,
			metadataAddress: 0x413D,
			metadataMosaic: 0x423D,
			metadataNamespace: 0x433D,
			modifyContract: 0x4157,
			modifyMultisigAccount: 0x4155,
			mosaicDefinition: 0x414D,
			mosaicSupplyChange: 0x424D,
			mosaicModifyLevy: 0x434D,
			mosaicRemoveLevy: 0x444D,
			networkConfig: 0x4159,
			operationIdentify: 0x415F,
			prepareDrive: 0x415A,
			registerNamespace: 0x414E,
			removeExchangeOffer: 0x435D,
			removeHarvester: 0x4261,
			secretLock: 0x4152,
			secretProof: 0x4252,
			startDriveVerification: 0x475A,
			startExecute: 0x4260,
			startFileDownload: 0x495A,
			startOperation: 0x425F,
			transfer: 0x4154,
			uploadFile: 0x4460,
			accountMetadata: 0x413F,
			mosaicMetadata: 0x423F,
			namespaceMetadata: 0x433F,
			prepareBcDrive: 0x4162,
			dataModification: 0x4262,
			download: 0x4362,
			dataModificationApproval: 0x4462,
			dataModificationCancel: 0x4562,
			replicatorOnboarding: 0x4662,
			replicatorOffboarding: 0x4762,
			finishDownload: 0x4862,
			downloadPayment: 0x4962,
			storagePayment: 0x4A62,
			dataModificationSingleApproval: 0x4B62,
			verificationPayment: 0x4C62,
			downloadApproval: 0x4D62,
			driveClosure: 0x4E62,
			endDriveVerificationV2: 0x4F62,
			streamStart: 0x4166,
			streamFinish: 0x4266,
			streamPayment: 0x4366,
			createLiquidityProvider: 0x4169,
			manualRateChange: 0x4269,
			placeSdaExchangeOffer: 0x416A,
			removeSdaExchangeOffer: 0x426A,
			installMessage: 0x416C,
			replicatorsCleanup: 0x4062,
			replicatorTreeRebuild: 0x4167,
		});
	});

	it('exposed values are unique', () => {
		// Act:
		const reverseMapping = Object.keys(EntityType).reduce((state, name) => {
			state[EntityType[name]] = name;
			return state;
		}, {});

		// Assert:
		expect(Object.keys(EntityType).length).to.equal(Object.keys(reverseMapping).length);
	});
});
