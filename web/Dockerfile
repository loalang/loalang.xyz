FROM node:13-alpine AS builder

RUN wget -O - https://github.com/elm/compiler/releases/download/0.19.1/binary-for-linux-64-bit.gz \
    | gunzip > /usr/local/bin/elm
RUN chmod +x /usr/local/bin/elm

RUN mkdir /web
WORKDIR /web

COPY package.json yarn.lock ./

RUN yarn --pure-lockfile

COPY . .

RUN yarn webpack -p

FROM nginx:1.17-alpine

COPY --from=builder /web/dist /usr/share/nginx/html
