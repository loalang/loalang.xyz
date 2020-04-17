FROM golang:1.14-alpine AS builder

RUN wget https://github.com/watchexec/watchexec/releases/download/1.12.0/watchexec-1.12.0-x86_64-unknown-linux-musl.tar.xz
RUN tar -xf watchexec-1.12.0-x86_64-unknown-linux-musl.tar.xz
RUN mv watchexec-1.12.0-x86_64-unknown-linux-musl/watchexec /usr/local/bin

WORKDIR /go/src/app
COPY go.mod go.sum ./

RUN go mod download

COPY . .

RUN GOOS=linux GOARCH=amd64 CGO_ENABLED=0 go build -ldflags='-w -s -extldflags "-static"' -o /main ./main/main.go
RUN chmod +x /main

FROM alpine

COPY --from=builder /main /main

ENTRYPOINT ["/main"]
