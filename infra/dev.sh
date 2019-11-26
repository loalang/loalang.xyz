#!/usr/bin/env sh

docker-compose \
  -f infra/docker-compose.yml \
  -f infra/docker-compose.development.yml \
  "$@"
