FROM ubuntu:16.04

RUN apt-get update && apt-get install -y curl ash

RUN curl -sL https://deb.nodesource.com/setup_10.x | bash - && apt-get install -y nodejs

COPY ./rest /
