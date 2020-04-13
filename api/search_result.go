package api

import (
	"github.com/graphql-go/graphql"
)

var SearchResultType = graphql.NewUnion(graphql.UnionConfig{
	Name: "SearchResult",
	Types: []*graphql.Object{
		ClassType,
		UserType,
	},
	ResolveType: func(p graphql.ResolveTypeParams) *graphql.Object {
		switch p.Value.(type) {
		case Class:
			return ClassType
		case User:
			return UserType
		default:
			return nil
		}
	},
})
