package main

import (
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
		Schema: schema,
		Pretty: true,
		Playground:true,
	})

	ctxDecorator, err := api.Context()
	if err != nil {
		panic(err)
	}

	http.HandleFunc("/", func(writer http.ResponseWriter, request *http.Request) {
		h.ContextHandler(ctxDecorator(request.Context()), writer, request)
	})

	err = http.ListenAndServe(":9091", nil)
	if err != nil {
		panic(err)
	}
}
