.PHONY: build
build: generate
	docker-compose -f docker-compose.yml -f docker-compose.dev.yml build --parallel
	docker-compose build --parallel

.PHONY: generate
generate: generate/web

.PHONY: generate/web
generate/web: generate/api web/introspection-file.json

web/introspection-file.json:
	docker run \
		-v$$(pwd)/api:/go/src/app \
		-w/go/src/app golang:1.14-alpine \
		go run main/main.go --print-introspection-file \
		> web/introspection-file.json

.PHONY: generate/api
generate/api: generate/pkg generate/search generate/auth
	protoc --go_out=plugins=grpc:api pkg/pkg.proto
	protoc --go_out=plugins=grpc:api search/search.proto
	protoc --go_out=plugins=grpc:api auth/auth.proto

.PHONY: generate/pkg
generate/pkg:
	protoc --go_out=plugins=grpc:. pkg/pkg.proto
	mkdir -p pkg/common
	cp -r common/events pkg/common

.PHONY: generate/search
generate/search:
	protoc --go_out=plugins=grpc:. search/search.proto
	protoc --go_out=plugins=grpc:search pkg/pkg.proto
	protoc --go_out=plugins=grpc:search auth/auth.proto
	mkdir -p search/common
	cp -r common/events search/common

.PHONY: generate/auth
generate/auth:
	protoc --go_out=plugins=grpc:. auth/auth.proto
	mkdir -p auth/common
	cp -r common/events auth/common

.PHONY: clean
clean:
	git clean -Xdff *
