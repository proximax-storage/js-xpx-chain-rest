/**
 * Catapult model mosaic restriction.
 * @enum {numeric}
 * @exports model/mosaicRestriction
 */
const mosaicRestriction = {
	restrictionType: {
		/** Address restriction. */
		address: 0,

		/** Global restriction. */
		global: 1
	}
};

module.exports = mosaicRestriction;