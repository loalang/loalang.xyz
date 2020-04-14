package api

import "github.com/graphql-go/graphql"

type Package interface {
	GetQualifiedName() string
	GetLatestVersion() string
}

var PackageType = graphql.NewObject(graphql.ObjectConfig{
	Name: "Package",
	Fields: graphql.Fields{
		"qualifiedName": &graphql.Field{
			Type: graphql.NewNonNull(graphql.String),
			Resolve: func(p graphql.ResolveParams) (interface{}, error) {
				return p.Source.(Package).GetQualifiedName(), nil
			},
		},
		"latestVersion": &graphql.Field{
			Type: graphql.NewNonNull(graphql.String),
			Resolve: func(p graphql.ResolveParams) (interface{}, error) {
				return p.Source.(Package).GetLatestVersion(), nil
			},
		},
	},
})
