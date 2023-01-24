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

/**
 * Catapult model entity types.
 * @enum {numeric}
 * @exports model/EntityType
 */
const EntityType = {
	/** Transfer transaction. */
	transfer: 0x4154,

	/** Register namespace transaction. */
	registerNamespace: 0x414E,

	/** Alias address transaction. */
	aliasAddress: 0x424E,

	/** Alias mosaic transaction. */
	aliasMosaic: 0x434E,

	/** Metadata address modification transaction. */
	metadataAddress: 0x413D,

	/** Metadata mosaic modification transaction. */
	metadataMosaic: 0x423D,

	/** Metadata namespace modification transaction. */
	metadataNamespace: 0x433D,

	/** Mosaic definition transaction. */
	mosaicDefinition: 0x414D,

	/** Mosaic supply change transaction. */
	mosaicSupplyChange: 0x424D,

	/** Mosaic modify levy transaction. */
	mosaicModifyLevy: 0x434D,

	/** Mosaic remove levy transaction. */
	mosaicRemoveLevy: 0x444D,

	/** Modify multisig account transaction. */
	modifyMultisigAccount: 0x4155,

	/** Modify contract transaction. */
	modifyContract: 0x4157,

	/** Aggregate complete transaction. */
	aggregateComplete: 0x4141,

	/** Aggregate bonded transaction. */
	aggregateBonded: 0x4241,

	/** Network Config transaction. */
	networkConfig: 0x4159,

	/** Blockchain Upgrade transaction. */
	blockchainUpgrade: 0x4158,

	/** Prepare Drive transaction. */
	prepareDrive: 0x415A,

	/** Join To Drive transaction. */
	joinToDrive: 0x425A,

	/** Drive File System transaction. */
	driveFileSystem: 0x435A,

	/** Files Deposit transaction. */
	filesDeposit: 0x445A,

	/** End Drive transaction. */
	endDrive: 0x455A,

	/** Drive Files Reward transaction. */
	driveFilesReward: 0x465A,

	/** Start Drive Verification transaction. */
	startDriveVerification: 0x475A,

	/** End Drive Verification transaction. */
	endDriveVerification: 0x485A,

	/** Hash lock transaction. */
	hashLock: 0x4148,

	/** Secret lock transaction. */
	secretLock: 0x4152,

	/** Secret proof transaction. */
	secretProof: 0x4252,

	/** Account properties address modification transaction. */
	accountPropertiesAddress: 0x4150,

	/** Account properties mosaic modification transaction. */
	accountPropertiesMosaic: 0x4250,

	/** Account properties entity type modification transaction. */
	accountPropertiesEntityType: 0x4350,

	/** Account link transaction. */
	accountLink: 0x414C,

	/** Exchange offer transaction. */
	exchangeOffer: 0x415D,

	/** Exchange transaction. */
	exchange: 0x425D,

	/** Remove exchange offer transaction. */
	removeExchangeOffer: 0x435D,

	/** Start file download. */
	startFileDownload: 0x495A,

	/** End file download. */
	endFileDownload: 0x4A5A,

	/** Operation identify. */
	operationIdentify: 0x415F,

	/** Start operation. */
	startOperation: 0x425F,

	/** End operation. */
	endOperation: 0x435F,

	/** Deploy. */
	deploy: 0x4160,

	/** Start execute. */
	startExecute: 0x4260,

	/** End execute. */
	endExecute: 0x4360,

	/** Upload file. */
	uploadFile: 0x4460,

	/** Deactivate super contract. */
	deactivate: 0x4560,

	/** Add harvester. */
	addHarvester: 0x4161,

	/** Remove harvester. */
	removeHarvester: 0x4261,

	/** Account metadata transaction */
	accountMetadata: 0x413F,

	/** Mosaic metadata transaction */
	mosaicMetadata: 0x423F,

	/** Namespace metadata transaction */
	namespaceMetadata: 0x433F,

	/** Prepare drive transaction */
	prepareBcDrive: 0x4162,

	/** Data modification transaction */
	dataModification: 0x4262,

	/** Download transaction */
	download: 0x4362,

	/** Data modification approval transaction */
	dataModificationApproval: 0x4462,

	/** Data modification cancel transaction */
	dataModificationCancel: 0x4562,

	/** Replicator onboarding transaction */
	replicatorOnboarding: 0x4662,

	/** Replicator offboarding transaction */
	replicatorOffboarding: 0x4762,

	/** Finish download transaction */
	finishDownload: 0x4862,

	/** Download payment transaction */
	downloadPayment: 0x4962,

	/** Storage payment transaction */
	storagePayment: 0x4A62,

	/** Data modification single approval transaction */
	dataModificationSingleApproval: 0x4B62,

	/** Verification payment transaction */
	verificationPayment: 0x4C62,

	/** Download approval transaction */
	downloadApproval: 0x4D62,

	/** Drive closure transaction */
	driveClosure: 0x4E62,

	/** End drive verification transaction */
	endDriveVerificationV2: 0x4F62,

	/** Stream start transaction. */
	streamStart: 0x4167,

	/** Stream finish transaction. */
	streamFinish: 0x4267,

	/** Stream payment transaction. */
	streamPayment: 0x4367,

	/** Create liquidity provider transaction. */
	createLiquidityProvider: 0x4169,

	/** Manual rate change transaction. (LP) */
	manualRateChange: 0x4269,

	/** Place SDA-SDA exchange offer transaction. */
	placeSdaExchangeOffer: 0x416A,

	/** Remove SDA-SDA exchange offer transaction. */
	removeSdaExchangeOffer: 0x426A,

	/** Install message transaction body. */
	installMessage: 0x416C

};

module.exports = EntityType;
