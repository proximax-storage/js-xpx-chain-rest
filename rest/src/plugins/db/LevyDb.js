/*
 * Copyright (c) 2016-2019, Jaguar0625, gimre, BloodyRookie, Tech Bureau, Corp.
 * Copyright (c) 2020-present, Jaguar0625, gimre, BloodyRookie.
 * All rights reserved.
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

const MongoDb = require('mongodb');

const {Long} = MongoDb;

class LevyDb {
    /**
     * Creates LevyDb around CatapultDb.
     * @param {module:db/CatapultDb} db Catapult db instance.
     */
    constructor(db) {
        this.catapultDb = db;
    }

    // region levy retrieval

    /**
     * Retrieves levy.
     * @param {module:catapult.utils/uint64~uint64} id Levy ids.
     * @returns {Promise.<array>} Levys.
     */
    levyByMosaicId(id) {
        const mosaicId = new Long(id[0], id[1]);
        return this.catapultDb.queryDocument('levy', {'levy.mosaicId': {$eq: mosaicId}})
            .then(this.catapultDb.sanitizer.deleteId)
            .then(entry => entry ? entry.levy.levy : undefined);
    }

    // endregion
}

module.exports = LevyDb;
