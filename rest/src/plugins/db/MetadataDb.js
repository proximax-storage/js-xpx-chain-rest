/**
 *** Copyright 2019 ProximaX Limited. All rights reserved.
 *** Use of this source code is governed by the Apache 2.0
 *** license that can be found in the LICENSE file.
 **/

class MetadataDb {
	/**
	 * Creates MetadataDb around CatapultDb.
	 * @param {module:db/CatapultDb} db Catapult db instance.
	 */
	constructor(db) {
		this.catapultDb = db;
	}

	// region metadata retrieval

	/**
	 * Retrieves the metadata entries by given ids.
	 * @param {array<object>} ids The ids of NameSpaceId, MosaicId, Address and etc.
	 * @returns {Promise.<array>} The metadata entries for all accounts.
	 */
	metadatasByIds(ids) {
		const buffers = ids.map(metadataId => Buffer.from(metadataId));
		const fieldName = 'metadata.metadataId';
		return this.catapultDb.queryDocuments('metadatas', { [fieldName]: { $in: buffers } });
	}

	// endregion
}

module.exports = MetadataDb;
