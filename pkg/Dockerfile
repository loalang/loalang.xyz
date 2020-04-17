FROM golang:1.13 AS builder

WORKDIR /go/src/app
COPY go.mod go.sum ./

RUN go mod download

COPY . .

RUN GOOS=linux GOARCH=amd64 CGO_ENABLED=0 go build -ldflags='-w -s -extldflags "-static"' -o /main ./main/main.go
RUN chmod +x /main

FROM scratch

COPY --from=builder /main /main

ENTRYPOINT ["/main"]
