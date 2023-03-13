FROM node:fermium-bullseye

# Install dependencies
# RUN apk add --update alpine-sdk python3 python3-dev py3-pip
RUN apt update && apt install -y cmake

# copy required libs from ./rest
COPY ./rest/node_modules /node_modules

# catapult-api-rest
COPY ./rest /node_modules/catapult-api-rest

# catapult-sdk
COPY ./catapult-sdk /node_modules/catapult-sdk

WORKDIR /node_modules/catapult-api-rest
