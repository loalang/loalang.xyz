FROM node:12-alpine

RUN mkdir /project
WORKDIR /project

COPY services/api/package.json services/api/yarn.lock ./
RUN yarn --pure-lockfile

COPY services/api .
RUN yarn build
