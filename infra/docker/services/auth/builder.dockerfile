FROM node:12-alpine

RUN mkdir /project
WORKDIR /project

COPY services/auth/package.json services/auth/yarn.lock ./
RUN yarn --pure-lockfile

COPY services/auth .
RUN yarn build
