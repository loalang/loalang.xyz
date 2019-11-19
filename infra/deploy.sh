#!/usr/bin/env sh

SLUG=$1

if [ -z "$SLUG" ]; then
  RELEASE_NAME="loalang"
else
  RELEASE_NAME="loalang-$SLUG"
fi

helm upgrade \
  --set=global.slug="$SLUG" \
  --set=www.image.tag=$(find services/www -type f -exec md5sum {} \; | md5sum | awk '{print $1}') \
  --set=api.image.tag=$(find services/api -type f -exec md5sum {} \; | md5sum | awk '{print $1}') \
  --install \
  "$RELEASE_NAME" \
  ./infra/k8s
