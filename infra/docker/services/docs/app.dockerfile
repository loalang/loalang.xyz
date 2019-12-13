FROM docs-builder AS builder

FROM node:12-alpine

RUN mkdir /docs
WORKDIR /docs

COPY --from=builder /project/package.json /project/yarn.lock ./
RUN yarn --production --pure-lockfile

COPY --from=builder /project/build /docs/build

CMD ["node", "/docs/build"]
