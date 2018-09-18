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

const commandLineArgs = require('command-line-args');
const commandLineUsage = require('command-line-usage');

const optionDefinitions = [
	{
		name: 'help', alias: 'h', type: Boolean, defaultValue: false
	},
	{
		name: 'sameTransaction', alias: 's', type: Boolean, defaultValue: false
	},
	{
		name: 'predefinedRecipients', alias: 'd', type: Number, defaultValue: 0
	},
	{
		name: 'address', alias: 'a', type: String, defaultValue: '127.0.0.1'
	},
	{
		name: 'configFile', alias: 'c', type: String, defaultValue: '../resources/rest.json'
	},
	{
		name: 'type', type: String, defaultValue: 'rest'
	},
	{
		name: 'port', alias: 'p', type: Number, defaultValue: 3000
	},
	{
		name: 'rate', alias: 'r', type: Number, defaultValue: 1
	},
	{
		name: 'total', alias: 't', type: Number, defaultValue: 10
	},
	{
		name: 'mode', alias: 'm', type: String, defaultValue: 'transfer'
	},
	{
		// If you use bootstrap, you can find private keys here:
		// catapult-service-bootstrap/build/generated-addresses/addresses.yaml
		// You need to find section "nemesis_addresses"(It is pre-created accounts with tokens)
		// and you can pick up private keys for testing
		// Example:
		// nemesis_addresses:
		// - private: E683A987DC5B588916F5667D717B59D01D6662DE588F8EEC2285289FCB1508AB
		//   public: 031B78DACDEB6427D69A4C0FDC2C4571ABBFFF7EA6B83532CF854BCDB465277E
		//   address: SCTBPQ6O7DYHWTCMU6VHPTS4B736EIQ6AU5N7BJY
		// ....
		name: 'privateKeys', alias: 'k', type: String, multiple: true, defaultValue: [
			'CDF107C89782952AF6FBA50386B33DBBC8331DF666E3835BC23A61211AA0F9DD',
			'7806576341D110934A5E05AFA062A91C42B6E3FE5EA176AAACE1693775A28BC4',
			'D9E07D2411280D3CEB0D6F122165281999B3893DD71CA8CFCFF9EF7197221703',
			'D95CC77DC4B99A03DEA111803EBC925A9B29B86C5CD5CC0B26288CCA803914F2'
		]
	}
];

const sections = [
	{
		header: 'Catapult spammer',
		content: 'Tool to spam a rest server with random transactions.'
	},
	{
		header: 'Options',
		optionList: [
			{
				name: 'sameTransaction',
				alias: 's',
				description: 'Spammer will use the same transaction each time'
			},
			{
				name: 'mode',
				alias: 'm',
				description: 'Available spamming modes: transfer (default), aggregate'
			},
			{
				name: 'predefinedRecipients',
				alias: 'd',
				description: 'The number of predefined recipients or 0 for random recipients.'
			},
			{
				name: 'address',
				alias: 'a',
				description: 'The host ip address.'
			},
			{
				name: 'type',
				description: 'Type of connection(rest or node).'
			},
			{
				name: 'configFile',
				alias: 'c',
				description: 'If you use apiNode type, you can pass config file with information about connection.'
			},
			{
				name: 'port',
				alias: 'p',
				description: 'The port on which to connect.'
			},
			{
				name: 'rate',
				alias: 'r',
				description: 'The desired transaction rate (tx / s).'
			},
			{
				name: 'total',
				alias: 't',
				description: 'The total number of transactions.'
			},
			{
				name: 'privateKeys',
				alias: 'k',
				description: 'The private keys of accounts with tokens to generate transactions.'
			}
		]
	}
];

module.exports = {
	options: () => commandLineArgs(optionDefinitions),
	usage: () => commandLineUsage(sections)
};
