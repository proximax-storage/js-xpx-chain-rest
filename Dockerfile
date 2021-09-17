FROM node:14-alpine

# Install alpine-sdk (gcc)
RUN apk add --update alpine-sdk

# copy required libs from ./rest
COPY ./rest/node_modules /node_modules

# catapult-api-rest
COPY ./rest /node_modules/catapult-api-rest

# catapult-sdk
COPY ./catapult-sdk /node_modules/catapult-sdk

WORKDIR /node_modules/catapult-api-rest
