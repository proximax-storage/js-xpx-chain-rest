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

/** @module model/status */

/* istanbul ignore next */
const toStringInternal = code => {
	switch (code) {
	case 0x00000000: return 'Success';
	case 0x40000000: return 'Neutral';
	case 0x80000000: return 'Failure';
	case 0x80430003: return 'Failure_Core_Past_Deadline';
	case 0x80430004: return 'Failure_Core_Future_Deadline';
	case 0x80430005: return 'Failure_Core_Insufficient_Balance';
	case 0x8043000F: return 'Failure_Core_Too_Many_Transactions';
	case 0x80430012: return 'Failure_Core_Nemesis_Account_Signed_After_Nemesis_Block';
	case 0x80430014: return 'Failure_Core_Wrong_Network';
	case 0x80430015: return 'Failure_Core_Invalid_Address';
	case 0x80430016: return 'Failure_Core_Invalid_Version';
	case 0x80430017: return 'Failure_Core_Invalid_Transaction_Fee';
	case 0x80430069: return 'Failure_Core_Block_Harvester_Ineligible';
	case 0x80430018: return 'Failure_Core_Invalid_FeeInterest';
	case 0x80430019: return 'Failure_Core_Invalid_FeeInterestDenominator';
	case 0x81480007: return 'Failure_Hash_Exists';
	case 0x80530008: return 'Failure_Signature_Not_Verifiable';
	case 0x804C00AA: return 'Failure_AccountLink_Invalid_Action';
	case 0x804C00AC: return 'Failure_AccountLink_Link_Already_Exists';
	case 0x804C00AD: return 'Failure_AccountLink_Link_Does_Not_Exist';
	case 0x804C00B0: return 'Failure_AccountLink_Unlink_Data_Inconsistency';
	case 0x804C00B1: return 'Failure_AccountLink_Remote_Account_Ineligible';
	case 0x804C00B2: return 'Failure_AccountLink_Remote_Account_Signer_Not_Allowed';
	case 0x804C00B3: return 'Failure_AccountLink_Remote_Account_Participant_Not_Allowed';
	case 0x80410001: return 'Failure_Aggregate_Too_Many_Transactions';
	case 0x80410002: return 'Failure_Aggregate_No_Transactions';
	case 0x80410003: return 'Failure_Aggregate_Too_Many_Cosignatures';
	case 0x80410004: return 'Failure_Aggregate_Redundant_Cosignatures';
	case 0x80410005: return 'Failure_Aggregate_Plugin_Config_Malformed';
	case 0x80410006: return 'Failure_Aggregate_Bonded_Not_Enabled';
	case 0x80411001: return 'Failure_Aggregate_Ineligible_Cosigners';
	case 0x80411002: return 'Failure_Aggregate_Missing_Cosigners';
	case 0x80411005: return 'Failure_Aggregate_Plugin_Config_Malformed';
	case 0x80411006: return 'Failure_Aggregate_Bonded_Not_Enabled';
	case 0x80570001: return 'Failure_Contract_Modify_Customer_Unsupported_Modification_Type';
	case 0x80570002: return 'Failure_Contract_Modify_Customer_In_Both_Sets';
	case 0x80570003: return 'Failure_Contract_Modify_Customer_Redundant_Modifications';
	case 0x80570004: return 'Failure_Contract_Modify_Executor_Unsupported_Modification_Type';
	case 0x80570005: return 'Failure_Contract_Modify_Executor_In_Both_Sets';
	case 0x80570006: return 'Failure_Contract_Modify_Executor_Redundant_Modifications';
	case 0x80570007: return 'Failure_Contract_Modify_Verifier_Unsupported_Modification_Type';
	case 0x80570008: return 'Failure_Contract_Modify_Verifier_In_Both_Sets';
	case 0x80570009: return 'Failure_Contract_Modify_Verifier_Redundant_Modifications';
	case 0x8057000A: return 'Failure_Contract_Modify_Not_A_Customer';
	case 0x8057000B: return 'Failure_Contract_Modify_Already_A_Customer';
	case 0x8057000C: return 'Failure_Contract_Modify_Not_A_Executor';
	case 0x8057000D: return 'Failure_Contract_Modify_Already_A_Executor';
	case 0x8057000E: return 'Failure_Contract_Modify_Not_A_Verifier';
	case 0x8057000F: return 'Failure_Contract_Modify_Already_A_Verifier';
	case 0x80570010: return 'Failure_Contract_Modify_Invalid_Duration';
	case 0x80570011: return 'Failure_Contract_Plugin_Config_Malformed';
	case 0x80590001: return 'Failure_NetworkConfig_Invalid_Signer';
	case 0x80590002: return 'Failure_NetworkConfig_BlockChain_Config_Too_Large';
	case 0x80590003: return 'Failure_NetworkConfig_Config_Redundant';
	case 0x80590004: return 'Failure_NetworkConfig_BlockChain_Config_Malformed';
	case 0x80590005: return 'Failure_NetworkConfig_Plugin_Config_Malformed';
	case 0x80590006: return 'Failure_NetworkConfig_SupportedEntityVersions_Config_Too_Large';
	case 0x80590007: return 'Failure_NetworkConfig_SupportedEntityVersions_Config_Malformed';
	case 0x80590008: return 'Failure_NetworkConfig_Catapult_Config_Trx_Cannot_Be_Unsupported';
	case 0x80590009: return 'Failure_NetworkConfig_Plugin_Config_Missing';
	case 0x8059000A: return 'Failure_NetworkConfig_ImportanceGrouping_Less_Or_Equal_Half_MaxRollbackBlocks';
	case 0x8059000B: return 'Failure_NetworkConfig_HarvestBeneficiaryPercentage_Exceeds_One_Hundred';
	case 0x8059000C: return 'Failure_NetworkConfig_MaxMosaicAtomicUnits_Invalid';
	case 0x8059000D: return 'Failure_NetworkConfig_ApplyHeightDelta_Zero';
	case 0x80480001: return 'Failure_LockHash_Invalid_Mosaic_Id';
	case 0x80480002: return 'Failure_LockHash_Invalid_Mosaic_Amount';
	case 0x80480003: return 'Failure_LockHash_Hash_Exists';
	case 0x80480004: return 'Failure_LockHash_Hash_Does_Not_Exist';
	case 0x80480005: return 'Failure_LockHash_Inactive_Hash';
	case 0x80480006: return 'Failure_LockHash_Invalid_Duration';
	case 0x80480007: return 'Failure_LockHash_Plugin_Config_Malformed';
	case 0x80520001: return 'Failure_LockSecret_Invalid_Hash_Algorithm';
	case 0x80520002: return 'Failure_LockSecret_Hash_Exists';
	case 0x80520003: return 'Failure_LockSecret_Hash_Not_Implemented';
	case 0x80520004: return 'Failure_LockSecret_Proof_Size_Out_Of_Bounds';
	case 0x80520005: return 'Failure_LockSecret_Secret_Mismatch';
	case 0x80520006: return 'Failure_LockSecret_Unknown_Composite_Key';
	case 0x80520007: return 'Failure_LockSecret_Inactive_Secret';
	case 0x80520008: return 'Failure_LockSecret_Hash_Algorithm_Mismatch';
	case 0x80520009: return 'Failure_LockSecret_Invalid_Duration';
	case 0x8052000A: return 'Failure_LockSecret_Plugin_Config_Malformed';
	case 0x803D0001: return 'Failure_Metadata_Invalid_Metadata_Type';
	case 0x803D0002: return 'Failure_Metadata_Modification_Type_Invalid';
	case 0x803D0003: return 'Failure_Metadata_Modification_Key_Invalid';
	case 0x803D0004: return 'Failure_Metadata_Modification_Value_Invalid';
	case 0x803D000A: return 'Failure_Metadata_Modification_Key_Redundant';
	case 0x803D000B: return 'Failure_Metadata_Modification_Value_Redundant';
	case 0x803D000C: return 'Failure_Metadata_Remove_Not_Existing_Key';
	case 0x803D0010: return 'Failure_Metadata_Address_Modification_Not_Permitted';
	case 0x803D0011: return 'Failure_Metadata_Mosaic_Modification_Not_Permitted';
	case 0x803D0012: return 'Failure_Metadata_Namespace_Modification_Not_Permitted';
	case 0x803D0015: return 'Failure_Metadata_Address_Not_Found';
	case 0x803D0016: return 'Failure_Metadata_Mosaic_Not_Found';
	case 0x803D0017: return 'Failure_Metadata_Namespace_Not_Found';
	case 0x803D001E: return 'Failure_Metadata_Too_Much_Keys';
	case 0x803D001F: return 'Failure_Metadata_Plugin_Config_Malformed';
	case 0x803D0020: return 'Failure_Metadata_MosaicId_Malformed';
	case 0x803D0021: return 'Failure_Metadata_NamespaceId_Malformed';
	case 0x804D0001: return 'Failure_Mosaic_Invalid_Duration';
	case 0x804D0002: return 'Failure_Mosaic_Invalid_Name';
	case 0x804D0003: return 'Failure_Mosaic_Name_Id_Mismatch';
	case 0x804D0004: return 'Failure_Mosaic_Expired';
	case 0x804D0005: return 'Failure_Mosaic_Owner_Conflict';
	case 0x804D0006: return 'Failure_Mosaic_Id_Mismatch';
	case 0x804D0064: return 'Failure_Mosaic_Parent_Id_Conflict';
	case 0x804D0065: return 'Failure_Mosaic_Invalid_Property';
	case 0x804D0066: return 'Failure_Mosaic_Invalid_Flags';
	case 0x804D0067: return 'Failure_Mosaic_Invalid_Divisibility';
	case 0x804D0068: return 'Failure_Mosaic_Invalid_Supply_Change_Direction';
	case 0x804D0069: return 'Failure_Mosaic_Invalid_Supply_Change_Amount';
	case 0x804D006B: return 'Failure_Mosaic_Invalid_Id';
	case 0x804D0096: return 'Failure_Mosaic_Modification_Disallowed';
	case 0x804D0097: return 'Failure_Mosaic_Modification_No_Changes';
	case 0x804D00A1: return 'Failure_Mosaic_Supply_Immutable';
	case 0x804D00A2: return 'Failure_Mosaic_Supply_Negative';
	case 0x804D00A3: return 'Failure_Mosaic_Supply_Exceeded';
	case 0x804D00A4: return 'Failure_Mosaic_Non_Transferable';
	case 0x804D00AA: return 'Failure_Mosaic_Max_Mosaics_Exceeded';
	case 0x804D00AB: return 'Failure_Mosaic_Plugin_Config_Malformed';
	case 0x80550001: return 'Failure_Multisig_Modify_Account_In_Both_Sets';
	case 0x80550002: return 'Failure_Multisig_Modify_Multiple_Deletes';
	case 0x80550003: return 'Failure_Multisig_Modify_Redundant_Modifications';
	case 0x80550004: return 'Failure_Multisig_Modify_Unknown_Multisig_Account';
	case 0x80550005: return 'Failure_Multisig_Modify_Not_A_Cosigner';
	case 0x80550006: return 'Failure_Multisig_Modify_Already_A_Cosigner';
	case 0x80550007: return 'Failure_Multisig_Modify_Min_Setting_Out_Of_Range';
	case 0x80550008: return 'Failure_Multisig_Modify_Min_Setting_Larger_Than_Num_Cosignatories';
	case 0x80550009: return 'Failure_Multisig_Modify_Unsupported_Modification_Type';
	case 0x8055000A: return 'Failure_Multisig_Modify_Max_Cosigned_Accounts';
	case 0x8055000B: return 'Failure_Multisig_Modify_Max_Cosigners';
	case 0x8055000C: return 'Failure_Multisig_Modify_Loop';
	case 0x8055000D: return 'Failure_Multisig_Modify_Max_Multisig_Depth';
	case 0x80550800: return 'Failure_Multisig_Operation_Not_Permitted_By_Account';
	case 0x8055000E: return 'Failure_Multisig_Plugin_Config_Malformed';
	case 0x804E0001: return 'Failure_Namespace_Invalid_Duration';
	case 0x804E0002: return 'Failure_Namespace_Invalid_Name';
	case 0x804E0003: return 'Failure_Namespace_Name_Id_Mismatch';
	case 0x804E0004: return 'Failure_Namespace_Expired';
	case 0x804E0005: return 'Failure_Namespace_Owner_Conflict';
	case 0x804E0006: return 'Failure_Namespace_Id_Mismatch';
	case 0x804E0007: return 'Failure_Namespace_Plugin_Config_Malformed';
	case 0x804E0064: return 'Failure_Namespace_Invalid_Namespace_Type';
	case 0x804E0065: return 'Failure_Namespace_Root_Name_Reserved';
	case 0x804E0066: return 'Failure_Namespace_Too_Deep';
	case 0x804E0067: return 'Failure_Namespace_Parent_Unknown';
	case 0x804E0096: return 'Failure_Namespace_Already_Exists';
	case 0x804E0097: return 'Failure_Namespace_Already_Active';
	case 0x804E0098: return 'Failure_Namespace_Eternal_After_Nemesis_Block';
	case 0x804E0099: return 'Failure_Namespace_Max_Children_Exceeded';
	case 0x804E00AA: return 'Failure_Namespace_Alias_Invalid_Action';
	case 0x804E00AB: return 'Failure_Namespace_Alias_Namespace_Unknown';
	case 0x804E00AC: return 'Failure_Namespace_Alias_Already_Exists';
	case 0x804E00AD: return 'Failure_Namespace_Alias_Does_Not_Exist';
	case 0x804E00AE: return 'Failure_Namespace_Alias_Owner_Conflict';
	case 0x804E00AF: return 'Failure_Namespace_Alias_Unlink_Type_Inconsistency';
	case 0x804E00B0: return 'Failure_Namespace_Alias_Unlink_Data_Inconsistency';
	case 0x804E00B1: return 'Failure_Namespace_Alias_Invalid_Address';
	case 0x80500001: return 'Failure_Property_Invalid_Property_Type';
	case 0x80500002: return 'Failure_Property_Modification_Type_Invalid';
	case 0x80500003: return 'Failure_Property_Modification_Address_Invalid';
	case 0x80500004: return 'Failure_Property_Modification_Operation_Type_Incompatible';
	case 0x80500005: return 'Failure_Property_Modify_Unsupported_Modification_Type';
	case 0x80500006: return 'Failure_Property_Modification_Redundant';
	case 0x80500007: return 'Failure_Property_Modification_Not_Allowed';
	case 0x80500008: return 'Failure_Property_Modification_Count_Exceeded';
	case 0x80500009: return 'Failure_Property_Values_Count_Exceeded';
	case 0x8050000A: return 'Failure_Property_Value_Invalid';
	case 0x8050000B: return 'Failure_Property_Signer_Address_Interaction_Not_Allowed';
	case 0x8050000C: return 'Failure_Property_Mosaic_Transfer_Not_Allowed';
	case 0x8050000D: return 'Failure_Property_Transaction_Type_Not_Allowed';
	case 0x8050000E: return 'Failure_Property_Plugin_Config_Malformed';
	case 0x805A0001: return 'Failure_Service_Drive_Duration_Is_Not_Multiple_Of_BillingPeriod';
	case 0x805A0002: return 'Failure_Service_Wrong_Percent_Approvers';
	case 0x805A0003: return 'Failure_Service_Min_Replicators_More_Than_Replicas';
	case 0x805A0004: return 'Failure_Service_Drive_Invalid_Duration';
	case 0x805A0005: return 'Failure_Service_Drive_Invalid_Billing_Period';
	case 0x805A0006: return 'Failure_Service_Drive_Invalid_Billing_Price';
	case 0x805A0007: return 'Failure_Service_Drive_Invalid_Size';
	case 0x805A0008: return 'Failure_Service_Drive_Invalid_Replicas';
	case 0x805A0009: return 'Failure_Service_Drive_Invalid_Min_Replicators';
	case 0x805A000A: return 'Failure_Service_Drive_Already_Exists';
	case 0x805A000B: return 'Failure_Service_Plugin_Config_Malformed';
	case 0x805A000C: return 'Failure_Service_Operation_Is_Not_Permitted';
	case 0x805A000D: return 'Failure_Service_Drive_Does_Not_Exist';
	case 0x805A000E: return 'Failure_Service_Replicator_Already_Connected_To_Drive';
	case 0x805A000F: return 'Failure_Service_Root_Hash_Is_Not_Equal';
	case 0x805A0010: return 'Failure_Service_File_Hash_Redundant';
	case 0x805A0011: return 'Failure_Service_File_Doesnt_Exist';
	case 0x805A0012: return 'Failure_Service_Too_Many_Files_On_Drive';
	case 0x805A0013: return 'Failure_Service_Drive_Replicator_Not_Registered';
	case 0x805A0014: return 'Failure_Service_Drive_Root_No_Changes';
	case 0x805A0015: return 'Failure_Service_Drive_Has_Ended';
	case 0x805A0016: return 'Failure_Service_Drive_Cant_Find_Default_Exchange_Offer';
	case 0x805A0017: return 'Failure_Service_Exchange_Of_This_Mosaic_Is_Not_Allowed';
	case 0x805A0018: return 'Failure_Service_Drive_Not_In_Pending_State';
	case 0x805A0019: return 'Failure_Service_Exchange_More_Than_Required';
	case 0x805A001A: return 'Failure_Service_Exchange_Cost_Is_Worse_Than_Default';
	case 0x805A001B: return 'Failure_Service_Drive_Processed_Full_Duration';
	case 0x805A001C: return 'Failure_Service_Zero_Upload_Info';
	case 0x805A001D: return 'Failure_Service_Participant_Redundant';
	case 0x805A001E: return 'Failure_Service_Participant_Is_Not_Registered_To_Drive';
	case 0x805A0020: return 'Failure_Service_No_Files_To_Download';
	case 0x805A0021: return 'Failure_Service_Zero_Infos';
	case 0x805A0022: return 'Failure_Service_File_Deposit_Is_Zero';
	case 0x805A0023: return 'Failure_Service_Verification_Already_In_Progress';
	case 0x805A0024: return 'Failure_Service_Verification_Has_Not_Started';
	case 0x805A0025: return 'Failure_Service_Verification_Is_Not_Active';
	case 0x805A0026: return 'Failure_Service_Verification_Has_Not_Timed_Out';
	case 0x805A0027: return 'Failure_Service_Drive_Is_Not_In_Progress';
	case 0x805A0028: return 'Failure_Service_Replicator_Has_Active_File_Without_Deposit';
	case 0x805A0029: return 'Failure_Service_File_Size_Invalid';
	case 0x805A002A: return 'Failure_Service_Doesnt_Contain_Streaming_Tokens';
	case 0x805A002B: return 'Failure_Service_Drive_Size_Exceeded';
	case 0x805A002C: return 'Failure_Service_Failed_Block_Hashes_Missing';
	case 0x805A002D: return 'Failure_Service_Duplicate_Failed_Block_Hashes';
	case 0x805A002E: return 'Failure_Service_Max_Replicators_Reached';
	case 0x805A002F: return 'Failure_Service_File_Download_Already_In_Progress';
	case 0x805A0030: return 'Failure_Service_File_Download_Not_In_Progress';
	case 0x80540006: return 'Failure_Transfer_Message_Too_Large';
	case 0x805400C8: return 'Failure_Transfer_Out_Of_Order_Mosaics';
	case 0x80540007: return 'Failure_Transfer_Plugin_Config_Malformed';
	case 0x80540008: return 'Failure_Transfer_Too_Many_Mosaics';
	case 0x80540009: return 'Failure_Transfer_Zero_Amount';
	case 0x80580001: return 'Failure_BlockChainUpgrade_Invalid_Signer';
	case 0x80580002: return 'Failure_BlockChainUpgrade_Upgrade_Period_Too_Low';
	case 0x80580003: return 'Failure_BlockChainUpgrade_Redundant';
	case 0x80580004: return 'Failure_BlockChainUpgrade_Invalid_Version';
	case 0x80580005: return 'Failure_BlockChainUpgrade_Plugin_Config_Malformed';
	case 0x80580006: return 'Failure_BlockChainUpgrade_Version_Lower_Than_Current';
	case 0x80FF0066: return 'Failure_Chain_Unlinked';
	case 0x80FF0068: return 'Failure_Chain_Block_Not_Hit';
	case 0x80FF0069: return 'Failure_Chain_Block_Inconsistent_State_Hash';
	case 0x80FF006A: return 'Failure_Chain_Block_Inconsistent_Receipts_Hash';
	case 0x80FF00C9: return 'Failure_Chain_Unconfirmed_Cache_Too_Full';
	case 0x80FE0001: return 'Failure_Consumer_Empty_Input';
	case 0x80FE1001: return 'Failure_Consumer_Block_Transactions_Hash_Mismatch';
	case 0x41FE1002: return 'Neutral_Consumer_Hash_In_Recency_Cache';
	case 0x80FE2001: return 'Failure_Consumer_Remote_Chain_Too_Many_Blocks';
	case 0x80FE2002: return 'Failure_Consumer_Remote_Chain_Improper_Link';
	case 0x80FE2003: return 'Failure_Consumer_Remote_Chain_Duplicate_Transactions';
	case 0x80FE3001: return 'Failure_Consumer_Remote_Chain_Unlinked';
	case 0x80FE3002: return 'Failure_Consumer_Remote_Chain_Mismatched_Difficulties';
	case 0x80FE3003: return 'Failure_Consumer_Remote_Chain_Score_Not_Better';
	case 0x80FE3004: return 'Failure_Consumer_Remote_Chain_Too_Far_Behind';
	case 0x80FE3005: return 'Failure_Consumer_Remote_Chain_Too_Far_In_Future';
	case 0x80450101: return 'Failure_Extension_Partial_Transaction_Cache_Prune';
	case 0x80450102: return 'Failure_Extension_Partial_Transaction_Dependency_Removed';
	case 0x805D0001: return 'Failure_Exchange_Offer_Doesnt_Exist';
	case 0x805D0002: return 'Failure_Exchange_Zero_Amount';
	case 0x805D0003: return 'Failure_Exchange_Zero_Price';
	case 0x805D0004: return 'Failure_Exchange_No_Offers';
	case 0x805D0005: return 'Failure_Exchange_Mosaic_Not_Allowed';
	case 0x805D0006: return 'Failure_Exchange_Buying_Own_Units_Is_Not_Allowed';
	case 0x805D0007: return 'Failure_Exchange_Not_Enough_Units_In_Offer';
	case 0x805D0008: return 'Failure_Exchange_Invalid_Price';
	case 0x805D0009: return 'Failure_Exchange_Account_Doesnt_Have_Any_Offer';
	case 0x805D000A: return 'Failure_Exchange_Offer_Duration_Too_Large';
	case 0x805D000B: return 'Failure_Exchange_Plugin_Config_Malformed';
	case 0x805D000C: return 'Failure_Exchange_No_Offered_Mosaics_To_Remove';
	case 0x805D000D: return 'Failure_Exchange_Duplicated_Offer_In_Request';
	case 0x805D000E: return 'Failure_Exchange_Offer_Exists';
	case 0x805D000F: return 'Failure_Exchange_Zero_Offer_Duration';
	default: return undefined;
	}
};

const status = {
	/**
	 * Converts a status code to a string.
	 * @param {numeric} code Status code.
	 * @returns {string} String representation of the status code.
	 */
	toString: code => {
		const str = toStringInternal(code);
		if (undefined !== str)
			return str;

		let hexString = code.toString(16).toUpperCase();
		if (8 > hexString.length)
			hexString = '0'.repeat(8 - hexString.length) + hexString;

		return `unknown status 0x${hexString}`;
	}
};

module.exports = status;
