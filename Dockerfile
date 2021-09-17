FROM node:14-alpine3.14

# Install alpine-sdk (gcc)
RUN apk add --update alpine-sdk python3 python3-dev py3-pip

# copy required libs from ./rest
COPY ./rest/node_modules /node_modules

# catapult-api-rest
COPY ./rest /node_modules/catapult-api-rest

# catapult-sdk
COPY ./catapult-sdk /node_modules/catapult-sdk

WORKDIR /node_modules/catapult-api-rest
