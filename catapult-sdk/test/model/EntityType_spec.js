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
			accountAddressRestriction: 0x4163,
			accountMosaicRestriction: 0x4263,
			accountOperationRestriction: 0x4363,
			accountV2Upgrade: 0x4258,
			aggregateBondedV1: 0x4241,
			aggregateBondedV2: 0x4441,
			aggregateCompleteV1: 0x4141,
			aggregateCompleteV2: 0x4341,
			mosaicAddressRestriction: 0x4264,
			mosaicGlobalRestriction: 0x4164,
			networkConfigAbsoluteHeight: 0x4259,
			nodeKeyLink: 0x424C,
			vrfKeyLink: 0x434C,
			accountLink: 0x414C,
			accountPropertiesAddress: 0x4150,
			accountPropertiesEntityType: 0x4350,
			accountPropertiesMosaic: 0x4250,
			addHarvester: 0x4170,
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
			removeHarvester: 0x4270,
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
			lockFundTransfer: 0x4162,
			lockFundCancelUnlock: 0x4262,
			prepareBcDrive: 0x4165,
			dataModification: 0x4265,
			download: 0x4365,
			dataModificationApproval: 0x4465,
			dataModificationCancel: 0x4565,
			replicatorOnboarding: 0x4665,
			replicatorOffboarding: 0x4765,
			finishDownload: 0x4865,
			downloadPayment: 0x4965,
			storagePayment: 0x4A65,
			dataModificationSingleApproval: 0x4B65,
			verificationPayment: 0x4C65,
			downloadApproval: 0x4D65,
			driveClosure: 0x4E65,
			endDriveVerificationV2: 0x4F65,
			streamStart: 0x4167,
			streamFinish: 0x4267,
			streamPayment: 0x4367,
			createLiquidityProvider: 0x4169,
			manualRateChange: 0x4269,
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
