.PHONY: build
build: generate
	docker-compose build

.PHONY: generate
generate: generate/api
	protoc --go_out=plugins=grpc:api pkg/pkg.proto
	protoc --go_out=plugins=grpc:api search/search.proto

.PHONY: generate/api
generate/api: generate/pkg generate/search

.PHONY: generate/pkg
generate/pkg:
	protoc --go_out=plugins=grpc:. pkg/pkg.proto
	mkdir -p pkg/common
	cp -r common/events pkg/common

.PHONY: generate/search
generate/search:
	protoc --go_out=plugins=grpc:. search/search.proto
	protoc --go_out=plugins=grpc:search pkg/pkg.proto
	mkdir -p search/common
	cp -r common/events search/common

.PHONY: clean
clean: clean
	git clean -Xdffi
