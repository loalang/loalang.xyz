FROM search-builder AS builder

FROM node:12-alpine

RUN mkdir /search
WORKDIR /search

COPY --from=builder /project/package.json /project/yarn.lock ./
RUN yarn --production --pure-lockfile

COPY --from=builder /project/build /search/build

ENV PORT 80
CMD ["node", "/search/build"]
