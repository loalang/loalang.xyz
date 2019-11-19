#!/usr/bin/env sh

SLUG=$1

if [ -z "$SLUG" ]; then
  RELEASE_NAME="loalang"
else
  RELEASE_NAME="loalang-$SLUG"
fi

helm delete --purge "$RELEASE_NAME"
