package api

import (
	"github.com/graphql-go/graphql"
)

var SearchResultUnion = graphql.NewUnion(graphql.UnionConfig{
	Name: "SearchResult",
	Types: []*graphql.Object{
		PackageObject,
		ClassObject,
		MeObject,
	},
	ResolveType: func(p graphql.ResolveTypeParams) *graphql.Object {
		switch p.Value.(type) {
		case Package:
			return PackageObject
		case Class:
			return ClassObject
		case User:
			return MeObject
		default:
			return nil
		}
	},
})
