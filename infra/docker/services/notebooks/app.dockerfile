FROM notebooks-builder AS builder

FROM node:12-alpine

RUN mkdir /notebooks
WORKDIR /notebooks

COPY --from=builder /project/package.json /project/yarn.lock ./
RUN yarn --production --pure-lockfile

COPY --from=builder /project/build /notebooks/build

CMD ["node", "/notebooks/build"]
