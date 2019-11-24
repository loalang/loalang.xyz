FROM node:12-alpine

RUN mkdir /project
WORKDIR /project

COPY services/search/package.json services/search/yarn.lock ./
RUN yarn --pure-lockfile

COPY services/search .
RUN yarn build
