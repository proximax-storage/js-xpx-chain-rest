/* eslint-disable indent */

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

class PerformanceLogger {

    constructor(winston) {
        this.winston = winston;
        this.interval = 5000;

        this.statistic = {
			transactionsIn: 0,
			transactionsOut: 0,
            time: new Date().getTime()
        };

        this.snapStatistic();
    }

    snapData() {
        this.statistic.time = new Date().getTime();
        const diffTime = (this.statistic.time - this.previous.time) / 1000;
        let diffTransaction = (this.statistic.transactionsIn - this.previous.transactionsIn);
		this.winston.info(`Processed in transaction ${diffTransaction} for ${diffTime} it is ${diffTransaction / diffTime} per second`);
		diffTransaction = (this.statistic.transactionsOut - this.previous.transactionsOut);
		this.winston.info(`Processed out transaction ${diffTransaction} for ${diffTime} it is ${diffTransaction / diffTime} per second`);
        this.snapStatistic();
    }

    snapStatistic() {
        this.previous = JSON.parse(JSON.stringify(this.statistic));
    }

    incrTransactions() {
        ++this.statistic.transactions;
    }
}

module.exports = PerformanceLogger;
