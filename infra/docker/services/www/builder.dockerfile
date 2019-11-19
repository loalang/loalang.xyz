FROM node:12-alpine

RUN mkdir /project
WORKDIR /project

COPY services/www/package.json services/www/yarn.lock ./
RUN yarn --pure-lockfile

ARG API_URL=https://api.loalang.xyz
ENV REACT_APP_API_URL ${API_URL}

COPY services/www .
RUN yarn build
