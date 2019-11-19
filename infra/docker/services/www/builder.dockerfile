FROM node:12-alpine

RUN mkdir /project
WORKDIR /project

COPY services/www/package.json services/www/yarn.lock ./
RUN yarn --pure-lockfile

ARG API_HOST=https://api.loalang.xyz
ENV REACT_APP_API_HOST ${API_HOST}

COPY services/www .
RUN yarn build
