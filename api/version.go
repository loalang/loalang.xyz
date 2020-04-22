package api

import "github.com/graphql-go/graphql"

type Version interface {
	GetMajor() uint32
	GetMinor() uint32
	GetPatch() uint32
}

var VersionInputObject = graphql.NewInputObject(graphql.InputObjectConfig{
	Name: "VersionInput",
	Fields: graphql.InputObjectConfigFieldMap{
		"major": &graphql.InputObjectFieldConfig{
			Type: graphql.NewNonNull(graphql.Int),
		},
		"minor": &graphql.InputObjectFieldConfig{
			Type: graphql.NewNonNull(graphql.Int),
		},
		"patch": &graphql.InputObjectFieldConfig{
			Type: graphql.NewNonNull(graphql.Int),
		},
	},
})

var VersionObject = graphql.NewObject(graphql.ObjectConfig{
	Name: "Version",
	Fields: graphql.Fields{
		"major": &graphql.Field{
			Type: graphql.NewNonNull(graphql.Int),
			Resolve: func(p graphql.ResolveParams) (interface{}, error) {
				return p.Source.(Version).GetMajor(), nil
			},
		},
		"minor": &graphql.Field{
			Type: graphql.NewNonNull(graphql.Int),
			Resolve: func(p graphql.ResolveParams) (interface{}, error) {
				return p.Source.(Version).GetMinor(), nil
			},
		},
		"patch": &graphql.Field{
			Type: graphql.NewNonNull(graphql.Int),
			Resolve: func(p graphql.ResolveParams) (interface{}, error) {
				return p.Source.(Version).GetPatch(), nil
			},
		},
	},
})
