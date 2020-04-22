package api

import "github.com/graphql-go/graphql"

const OK = "OK"

var OKScalar = graphql.NewScalar(graphql.ScalarConfig{
	Name: "OK",
	Serialize: func(value interface{}) interface{} {
		return OK
	},
})