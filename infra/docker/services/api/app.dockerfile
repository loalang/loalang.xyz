FROM api-builder AS builder

FROM node:12-alpine

RUN mkdir /api
WORKDIR /api

COPY --from=builder /project/package.json /project/yarn.lock ./
RUN yarn --production --pure-lockfile

COPY --from=builder /project/build /api/build

ENV PORT 80
CMD ["node", "/api/build"]
