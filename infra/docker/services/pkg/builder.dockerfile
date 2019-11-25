FROM node:12-alpine

RUN mkdir /project
WORKDIR /project

COPY services/pkg/package.json services/pkg/yarn.lock ./
RUN yarn --pure-lockfile

COPY services/pkg .
RUN yarn build
