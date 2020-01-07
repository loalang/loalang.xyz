FROM node:12-alpine

RUN mkdir /project
WORKDIR /project

COPY services/notebooks/package.json services/notebooks/yarn.lock ./
RUN yarn --pure-lockfile

COPY services/notebooks .
RUN yarn build
