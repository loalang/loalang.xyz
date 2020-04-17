FROM node:13-alpine AS builder

RUN mkdir /web
WORKDIR /web

COPY package.json yarn.lock ./

RUN yarn --pure-lockfile

COPY . .

RUN yarn webpack -p

FROM nginx:1.17-alpine

COPY --from=builder /web/dist /usr/share/nginx/html
