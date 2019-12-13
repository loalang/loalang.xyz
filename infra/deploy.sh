#!/usr/bin/env sh

if [ "$1" = "--dev" ]; then
  LATEST_TAG="latest"
  shift
fi

SLUG=$1

if [ -z "$SLUG" ]; then
  RELEASE_NAME="loalang"
else
  RELEASE_NAME="loalang-$SLUG"
fi

export DOCS_TAG=${LATEST_TAG:-$(sh ./infra/id-of.sh services/docs)} \
export PKG_TAG=${LATEST_TAG:-$(sh ./infra/id-of.sh services/pkg)} \
export SEARCH_TAG=${LATEST_TAG:-$(sh ./infra/id-of.sh services/search)} \
export AUTH_TAG=${LATEST_TAG:-$(sh ./infra/id-of.sh services/auth)} \
export API_TAG=${LATEST_TAG:-$(sh ./infra/id-of.sh services/api)} \
export WWW_TAG=${LATEST_TAG:-$(sh ./infra/id-of.sh services/www)} \
export INGRESS_TAG=${LATEST_TAG:-$(sh ./infra/id-of.sh infra/docker/ingress)} \

docker-compose \
  -f infra/docker-compose.yml \
  -f infra/docker-compose.${SLUG:-production}.yml \
  config \
| ssh \
  -o StrictHostKeyChecking=no \
  -i "${SSH_PRIVATE_KEY:-~/.ssh/id_rsa}" \
  core@$DOCKER_SWARM_MANAGER_IP \
  docker stack deploy --with-registry-auth -c - $RELEASE_NAME
