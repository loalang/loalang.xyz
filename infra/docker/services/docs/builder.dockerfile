FROM node:12-alpine

RUN mkdir /project
WORKDIR /project

COPY services/docs/package.json services/docs/yarn.lock ./
RUN yarn --pure-lockfile

COPY services/docs .
RUN yarn build
