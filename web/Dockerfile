FROM node:13 AS builder

RUN mkdir /web
WORKDIR /web

COPY package.json yarn.lock ./
RUN yarn --pure-lockfile

COPY elm.json ./
RUN mkdir src
RUN elm make 2>/dev/null || true

COPY introspection-file.json ./
RUN yarn elm-graphql --introspection-file introspection-file.json

COPY . .

RUN yarn webpack -p

FROM nginx:1.17-alpine

COPY --from=builder /web/dist /usr/share/nginx/html
