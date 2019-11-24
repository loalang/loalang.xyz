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

helm upgrade \
  --set=global.slug="$SLUG" \
  --set=search.image.tag=${LATEST_TAG:-$(sh ./infra/id-of.sh search)} \
  --set=api.image.tag=${LATEST_TAG:-$(sh ./infra/id-of.sh api)} \
  --set=www.image.tag=${LATEST_TAG:-$(sh ./infra/id-of.sh www)} \
  --install \
  "$RELEASE_NAME" \
  ./infra/k8s
