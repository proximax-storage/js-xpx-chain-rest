#FROM alpine:3.6
FROM node:8.12.0-alpine

# Install alpine-sdk (gcc)
RUN apk add --update alpine-sdk

# Install python
RUN apk add --update \
    python \
    python-dev \
    py-pip

COPY . /catapult-rest

RUN cd /catapult-rest/catapult-sdk && \
    yarn install && \
    yarn rebuild && \
    cd /catapult-rest/rest && \
    yarn install --production  --modules-folder /catapult-rest/node_modules && \
    npm run build

#------------------------
# Actual target image which only contains the required binaries
#------------------------
FROM node:8.12.0-alpine

# Install alpine-sdk (gcc)
RUN apk add --update alpine-sdk

# Install python
RUN apk add --update \
    python \
    python-dev \
    py-pip

# copy required libs
COPY --from=0 /catapult-rest/node_modules /node_modules

# catapult-sdk
COPY --from=0 /catapult-rest/catapult-sdk /node_modules/catapult-sdk

# catapult-api-rest
COPY --from=0 /catapult-rest/rest /node_modules/catapult-api-rest

WORKDIR /node_modules/catapult-api-rest
