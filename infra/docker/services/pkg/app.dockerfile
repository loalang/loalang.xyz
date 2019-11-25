FROM pkg-builder AS builder

FROM node:12-alpine

RUN mkdir /pkg
WORKDIR /pkg

COPY --from=builder /project/package.json /project/yarn.lock ./
RUN yarn --production --pure-lockfile

COPY --from=builder /project/build /pkg/build

ENV PORT 80
CMD ["node", "/pkg/build"]
