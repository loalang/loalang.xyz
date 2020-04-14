package api

import (
	"github.com/graphql-go/graphql"
)

var SearchResultType = graphql.NewUnion(graphql.UnionConfig{
	Name: "SearchResult",
	Types: []*graphql.Object{
		PackageType,
		ClassType,
		UserType,
	},
	ResolveType: func(p graphql.ResolveTypeParams) *graphql.Object {
		switch p.Value.(type) {
		case Package:
			return PackageType
		case Class:
			return ClassType
		case User:
			return UserType
		default:
			return nil
		}
	},
})
