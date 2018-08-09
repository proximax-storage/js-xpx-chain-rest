# catapult-rest

[![Build Status](https://api.travis-ci.org/nemtech/catapult-rest.svg?branch=master)](https://travis-ci.org/nemtech/catapult-rest)
[![Coverage Status](https://coveralls.io/repos/github/nemtech/catapult-rest/badge.svg?branch=master)](https://coveralls.io/github/nemtech/catapult-rest?branch=master)

## Requirements

- NodeJS version 8 or 9
- [yarn][yarn] dependency manager

## License

Copyright (c) 2018 Jaguar0625, gimre, BloodyRookie, Tech Bureau, Corp Licensed under the [GNU Lesser General Public License v3](LICENSE)


[yarn]: https://yarnpkg.com/lang/en/

## Help

To start work with it you need to install npm, nodejs, yarn first.
You can do it by the next command(It is not completed now, it will install only yarn):
```
sudo ./installDependencies.sh
```

If you already have it, you need to build rest server:
```
sudo ./yarn_setup.sh
```


Then if you want to run spammer:
```
cd spammer
npm run build && npm run start
```
You can configure it:
spammer/src/utils/spammerOptions.js - here you can change parameters of connection and spam.
spammer/src/model/transactionFactory.js - here you can change token, which you need to use in transactions.
spammer/src/index.js - here you can change private keys of account which already have tokens.

Todo: add description how to run rest
