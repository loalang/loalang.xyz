#!/usr/bin/env sh

export DOCKER_BUILDKIT=1

build() {
    set -e

    SERVICE=$1
    VERSION="$(find services/$SERVICE -type f -exec md5sum {} \; | md5sum | awk '{print $1}')"

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

build api
build www
