package api

import (
	"github.com/graphql-go/graphql"
	"github.com/loalang/loalang.xyz/api/pkg"
)

var MutationType = graphql.NewObject(graphql.ObjectConfig{
	Name: "Mutation",
	Fields: graphql.Fields{
		"publishPackage": &graphql.Field{
			Type: OKType,
			Args: graphql.FieldConfigArgument{
				"name": &graphql.ArgumentConfig{
					Type: graphql.NewNonNull(graphql.String),
				},
			},
			Resolve: func(p graphql.ResolveParams) (interface{}, error) {
				client := PkgClient(p.Context)
				_, err := client.Test(p.Context, &pkg.TestRequest{
					Value: p.Args["name"].(string),
				})
				if err != nil {
					return nil, err
				}
				return OK, nil
			},
		},
	},
})
