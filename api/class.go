package api

import "github.com/graphql-go/graphql"

type Class interface {
	GetQualifiedName() string
}

var ClassType = graphql.NewObject(graphql.ObjectConfig{
	Name: "Class",
	Fields: graphql.Fields{
		"qualifiedName": &graphql.Field{
			Type: graphql.NewNonNull(graphql.String),
			Resolve: func(p graphql.ResolveParams) (interface{}, error) {
				return p.Source.(Class).GetQualifiedName(), nil
			},
		},
	},
})
