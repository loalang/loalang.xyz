package api

import "github.com/graphql-go/graphql"

type User interface {
	GetUsername() string
}

var UserType = graphql.NewObject(graphql.ObjectConfig{
	Name: "User",
	Fields: graphql.Fields{
		"username": &graphql.Field{
			Type: graphql.NewNonNull(graphql.String),
			Resolve: func(p graphql.ResolveParams) (interface{}, error) {
				return p.Source.(User).GetUsername(), nil
			},
		},
	},
})
