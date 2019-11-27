FROM auth-builder AS builder

FROM node:12-alpine

RUN mkdir /auth
WORKDIR /auth

COPY --from=builder /project/package.json /project/yarn.lock ./
RUN yarn --production --pure-lockfile

COPY --from=builder /project/build /auth/build

CMD ["node", "/auth/build"]
