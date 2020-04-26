package api

import "github.com/graphql-go/graphql"

type Image interface {
	GetLarge() string
	GetMedium() string
	GetSmall() string
}

var ImageObject = graphql.NewObject(graphql.ObjectConfig{
	Name:   "Image",
	Fields: graphql.Fields{
		"large": &graphql.Field{
			Name:    "large",
			Type:    graphql.NewNonNull(graphql.String),
			Resolve: func(p graphql.ResolveParams) (interface{}, error) {
				return p.Source.(Image).GetLarge(), nil
			},
		},
		"medium": &graphql.Field{
			Name:    "medium",
			Type:    graphql.NewNonNull(graphql.String),
			Resolve: func(p graphql.ResolveParams) (interface{}, error) {
				return p.Source.(Image).GetMedium(), nil
			},
		},
		"small": &graphql.Field{
			Name:    "small",
			Type:    graphql.NewNonNull(graphql.String),
			Resolve: func(p graphql.ResolveParams) (interface{}, error) {
				return p.Source.(Image).GetSmall(), nil
			},
		},
	},
})