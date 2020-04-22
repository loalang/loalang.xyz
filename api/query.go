package api

import (
	"github.com/golang/protobuf/ptypes/empty"
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

		"health": &graphql.Field{
			Type: graphql.NewNonNull(graphql.NewEnum(graphql.EnumConfig{
				Name:   "Health",
				Values: graphql.EnumValueConfigMap{
					"RED": &graphql.EnumValueConfig{
						Value: "RED",
					},
					"YELLOW": &graphql.EnumValueConfig{
						Value: "YELLOW",
					},
					"GREEN": &graphql.EnumValueConfig{
						Value: "GREEN",
					},
				},
			})),
			Resolve: func(p graphql.ResolveParams) (interface{}, error) {
				healthyServices := 0
				if svc, _ := PkgClient(p.Context).Health(p.Context, &empty.Empty{}); svc != nil && svc.Healthy {
					healthyServices++
				}
				if svc, _ := AuthClient(p.Context).Health(p.Context, &empty.Empty{}); svc != nil && svc.Healthy {
					healthyServices++
				}
				if svc, _ := SearchClient(p.Context).Health(p.Context, &empty.Empty{}); svc != nil && svc.Healthy {
					healthyServices++
				}
				switch healthyServices {
				case 0:
					return "RED", nil
				case 3:
					return "GREEN", nil
				default:
					return "YELLOW", nil
				}
			},
		},
	},
})
