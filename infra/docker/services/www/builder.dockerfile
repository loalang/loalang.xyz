FROM node:12-alpine

RUN mkdir /project
WORKDIR /project

COPY services/www/package.json services/www/yarn.lock ./
RUN yarn --pure-lockfile

COPY services/www .

ARG VERSION
ENV REACT_APP_VERSION $VERSION

RUN yarn build
