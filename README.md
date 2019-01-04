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
You can do it by the next command:
```
sudo ./scripts/installDependencies.sh
```

If you already have it, you need to build each module:
```
sudo ./yarn_setup.sh
```

To run a rest server, you need to install mongodb first, or change mongodb address in rest.json:
```
cd ./scripts/mongo/
sudo ./installMongoDb.sh
cd mongoPrepare/
./mongors.sh
```
Then you can run rest server:
```
cd rest
npm run build && npm run start ./resources/rest.json ./resources/rest.json
```

You can change information about mongodb connection and catapult server connection in **rest/resources/rest.json**.

## Build docker image

If docker, yarn, nodejs and npm are installed, you can easy create an image:

```
sudo ./scripts/RestDockerImage/buildRestImage.sh
```

## Spammer

Also you can find a transaction sender in **spammer** folder. How to work with it you can read in Readme file in **spammer** folder.
