#!/usr/bin/env sh

build() {
    set -e

    SERVICE=$1
    shift

    VERSION="$(sh ./infra/id-of.sh services/$SERVICE)"

    # Pull latest builder version
    docker pull "registry.gitlab.com/loalang/loalang.xyz/$SERVICE-builder:latest" || true

    # Build new builder
    docker build \
        --cache-from "registry.gitlab.com/loalang/loalang.xyz/$SERVICE-builder:latest" \
        -t "registry.gitlab.com/loalang/loalang.xyz/$SERVICE-builder:latest" \
        -f infra/docker/services/$SERVICE/builder.dockerfile .

    # Push new builder
    docker push "registry.gitlab.com/loalang/loalang.xyz/$SERVICE-builder:latest"

    # Make local tag of builder for use in app image
    docker tag "registry.gitlab.com/loalang/loalang.xyz/$SERVICE-builder:latest" $SERVICE-builder


    # Pull latest app version
    docker pull "registry.gitlab.com/loalang/loalang.xyz/$SERVICE:latest" || true

    # Build new app
    docker build \
        --cache-from "registry.gitlab.com/loalang/loalang.xyz/$SERVICE:latest" \
        -t "registry.gitlab.com/loalang/loalang.xyz/$SERVICE:latest" \
        -t "registry.gitlab.com/loalang/loalang.xyz/$SERVICE:$VERSION" \
        -f infra/docker/services/$SERVICE/app.dockerfile .

    # Push new version
    docker push "registry.gitlab.com/loalang/loalang.xyz/$SERVICE:latest"
    docker push "registry.gitlab.com/loalang/loalang.xyz/$SERVICE:$VERSION"
}

build pkg
build search
build api
build www

# Pull latest ingress version
docker pull "registry.gitlab.com/loalang/loalang.xyz/ingress:latest" || true

INGRESS_VERSION="$(sh ./infra/id-of.sh infra/docker/ingress)"
docker build \
    --cache-from "registry.gitlab.com/loalang/loalang.xyz/ingress:latest" \
    -t "registry.gitlab.com/loalang/loalang.xyz/ingress:latest" \
    -t "registry.gitlab.com/loalang/loalang.xyz/ingress:$VERSION" \
    -f infra/docker/ingress/Dockerfile .

# Push new ingress version
docker push "registry.gitlab.com/loalang/loalang.xyz/ingress:latest"
docker push "registry.gitlab.com/loalang/loalang.xyz/ingress:$INGRESS_VERSION"
