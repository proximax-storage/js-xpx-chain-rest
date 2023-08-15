/**
 *** Copyright 2022 ProximaX Limited. All rights reserved.
 *** Use of this source code is governed by the Apache 2.0
 *** license that can be found in the LICENSE file.
 **/

/** @module plugins/config */
const ExchangeSdaDb = require('./db/ExchangeSdaDb');
const exchangeSdaRoutes = require('./routes/exchangeSdaRoutes');

/**
 * Creates a SDA-SDA exchange plugin.
 * @type {module:plugins/CatapultRestPlugin}
 */

module.exports = {
    createDb: db => new ExchangeSdaDb(db),

    registerTransactionStates: () => {},

    registerMessageChannels: () => {},

    registerRoutes: (...args) => {
        exchangeSdaRoutes.register(...args);
    }
};
