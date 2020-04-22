package api

import "github.com/graphql-go/graphql"

type Release interface {
	GetTarballUrl() string
}

var ReleaseObject = graphql.NewObject(graphql.ObjectConfig{
	Name:   "Release",
	Fields: graphql.Fields{
		"tarballUrl": &graphql.Field{
			Type:    graphql.NewNonNull(graphql.String),
			Resolve: func(p graphql.ResolveParams) (interface{}, error) {
				return p.Source.(Release).GetTarballUrl(), nil
			},
		},
	},
})
