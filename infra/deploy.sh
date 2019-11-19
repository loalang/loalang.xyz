#!/usr/bin/env sh

SLUG=$1
NAMESPACE=loalang

if [ -z "$SLUG" ]; then
  RELEASE_NAME="loalang"
else
  RELEASE_NAME="loalang-$SLUG"
  NAMESPACE=loalang-staging
fi

helm upgrade \
  --set=global.slug="$SLUG" \
  --set=www.image.tag=$(sh ./infra/id-of.sh www) \
  --set=api.image.tag=$(sh ./infra/id-of.sh api) \
  --namespace=$NAMESPACE \
  --install \
  "$RELEASE_NAME" \
  ./infra/k8s
