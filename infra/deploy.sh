#!/usr/bin/env sh

helm upgrade \
  --set=www.image.tag=$(find services/www -type f -exec md5sum {} \; | md5sum | awk '{print $1}') \
  --set=api.image.tag=$(find services/api -type f -exec md5sum {} \; | md5sum | awk '{print $1}') \
  --install \
  loalang \
  ./infra/k8s
