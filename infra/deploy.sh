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
  --set=www.image.tag=$(find services/www -type f -exec md5sum {} \; | md5sum | awk '{print $1}') \
  --set=api.image.tag=$(find services/api -type f -exec md5sum {} \; | md5sum | awk '{print $1}') \
  --namespace=$NAMESPACE \
  --install \
  "$RELEASE_NAME" \
  ./infra/k8s
