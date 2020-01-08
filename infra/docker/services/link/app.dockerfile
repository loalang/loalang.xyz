FROM link-builder AS builder

FROM node:12-alpine

RUN mkdir /link
WORKDIR /link

COPY --from=builder /project/package.json /project/yarn.lock ./
RUN yarn --production --pure-lockfile

COPY --from=builder /project/build /link/build

CMD ["node", "/link/build"]
