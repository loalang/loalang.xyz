package main

import (
	upload "github.com/eko/graphql-go-upload"
	"github.com/graphql-go/handler"
	"github.com/loalang/loalang.xyz/api"
	"net/http"
)

func main() {
	schema, err := api.Schema()

	if err != nil {
		panic(err)
	}

	h := handler.New(&handler.Config{
		Schema:     schema,
		Pretty:     true,
		Playground: true,
	})

	ctxDecorator, err := api.Context()
	if err != nil {
		panic(err)
	}

	http.Handle("/", upload.Handler(http.HandlerFunc(func(writer http.ResponseWriter, request *http.Request) {
		h.ContextHandler(ctxDecorator(request.Context(), request, writer), writer, request)
	})))

	err = http.ListenAndServe(":9091", nil)
	if err != nil {
		panic(err)
	}
}
