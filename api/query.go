package api

import (
	"github.com/graphql-go/graphql"
	"github.com/loalang/loalang.xyz/api/search"
)

var QueryType = graphql.NewObject(graphql.ObjectConfig{
	Name: "Query",
	Fields: graphql.Fields{
		"search": &graphql.Field{
			Type: graphql.NewNonNull(graphql.NewList(
				graphql.NewNonNull(SearchResultType),
			)),
			Args: graphql.FieldConfigArgument{
				"term": &graphql.ArgumentConfig{
					Type: graphql.NewNonNull(graphql.String),
				},
			},
			Resolve: func(p graphql.ResolveParams) (interface{}, error) {
				client := SearchClient(p.Context)

				res, err := client.Search(p.Context, &search.SearchRequest{
					Term: p.Args["term"].(string),
				})

				if err != nil {
					return nil, err
				}

				result := []interface{}{}
				for {
					response, err := res.Recv()
					if response == nil {
						break
					}
					if err != nil {
						return nil, err
					}
					switch r := response.Result.(type) {
					case *search.SearchResponse_UserResult:
						result = append(result, User(r.UserResult))
					case *search.SearchResponse_ClassResult:
						result = append(result, Class(r.ClassResult))
					case *search.SearchResponse_PackageResult:
						result = append(result, Package(r.PackageResult))
					}
				}
				return result, nil
			},
		},

		"me": &graphql.Field{
			Type: UserType,
			Resolve: func(p graphql.ResolveParams) (interface{}, error) {
				return CurrentUser(p.Context), nil
			},
		},
	},
})
