# ProximaX Sirius-Chain REST Code #

Official ProximaX Sirius-Chain REST Code.

The ProximaX Sirius-Chain REST code is the REST code implementation of ProximaX blockchain layer. It directly interfaces the cpp-xpx-chain, the blockchain server code implementation of ProximaX Sirius-Chain.

## Requirements

- NodeJS version 8 or 9
- [yarn][yarn] dependency manager

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

To enable HTTPS setup the following environment variables or fill the same options in rest.json file:
```

HTTPS_CA=absolute path to CA certificate (optional)
HTTPS_CERTIFICATE=absolute path to server certificate (required)
HTTPS_KEY=absolute path to server private key (required)
HTTPS_PASSPHRASE=password (optional)
```

To run a rest server, you need to install mongodb first, or change mongodb address in rest.json:
```
cd ./scripts/mongo/
sudo ./installMongoDb.sh
service mongod restart
cd mongoPrepare/
./mongors.sh
```
Then you can run rest server:
```
cd rest
yarn run build && yarn run start
```

You can change information about mongodb connection and cpp-xpx-chain server connection in **rest/resources/rest.json**.

## Build docker image

If docker, yarn, nodejs and npm are installed, you can easy create an image:

```
sudo ./scripts/RestDockerImage/buildRestImage.sh
```

## Spammer

Also you can find a transaction sender in **spammer** folder. How to work with it you can read in Readme file in **spammer** folder.
