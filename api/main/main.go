package main

import (
	"encoding/json"
	"fmt"
	upload "github.com/eko/graphql-go-upload"
	"github.com/graphql-go/graphql"
	"github.com/graphql-go/graphql/testutil"
	"github.com/graphql-go/handler"
	"github.com/loalang/loalang.xyz/api"
	"net/http"
	"os"
)

func main() {
	schema, err := api.Schema()

	if len(os.Args) == 2 && os.Args[1] == "--print-introspection-file" {
		result := graphql.Do(graphql.Params{
			Schema:        *schema,
			RequestString: testutil.IntrospectionQuery,
		})
		if result.HasErrors() {
			panic(result.Errors)
		}
		b, err := json.Marshal(result)
		if err != nil {
			panic(err)
		}
		_, err = os.Stdout.Write(b)
		if err != nil {
			panic(err)
		}
		return
	}

	if err != nil {
		panic(err)
	}

	h := upload.Handler(handler.New(&handler.Config{
		Schema:     schema,
		Pretty:     true,
		Playground: true,
	}))

	http.Handle("/", http.HandlerFunc(func(writer http.ResponseWriter, request *http.Request) {
		header := writer.Header()
		header.Add("Access-Control-Allow-Origin", request.Header.Get("Origin"))
		header.Add("Access-Control-Allow-Headers", "Content-Type")
		header.Add("Access-Control-Allow-Credentials", "true")

		if request.Method == "OPTIONS" {
			return
		}

		ctx, err := api.Context(request, writer)
		if err != nil {
			panic(err)
		}
		h.ServeHTTP(writer, request.WithContext(ctx))
	}))

	fmt.Println("Started!")

	err = http.ListenAndServe(":9091", nil)
	if err != nil {
		panic(err)
	}
}
