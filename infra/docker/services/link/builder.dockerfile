FROM node:12-alpine

RUN mkdir /project
WORKDIR /project

COPY services/link/package.json services/link/yarn.lock ./
RUN yarn --pure-lockfile

COPY services/link .
RUN yarn build
