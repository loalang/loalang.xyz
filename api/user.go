package api

import (
	"bytes"
	"context"
	"github.com/graphql-go/graphql"
)

type User interface {
	GetUsername() string
	GetName() string
}

var UserInterface = graphql.NewInterface(graphql.InterfaceConfig{
	Name: "User",
	Fields: graphql.Fields{
		"username": &graphql.Field{
			Type: graphql.NewNonNull(graphql.String),
		},
		"name": &graphql.Field{
			Type: graphql.String,
		},
	},
})

type WithId interface {
	GetId() []byte
}

func isSignedIn(ctx context.Context, value interface{}) bool {
	if withId, ok := value.(WithId); ok {
		signedInUser := CurrentUser(ctx)

		if signedInUser != nil && bytes.Equal(signedInUser.Id, withId.GetId()) {
			return true
		}
	}

	return false
}

var NotMeObject = graphql.NewObject(graphql.ObjectConfig{
	Name:       "NotMe",
	Interfaces: []*graphql.Interface{UserInterface},
	Fields: graphql.Fields{
		"username": &graphql.Field{
			Type: graphql.NewNonNull(graphql.String),
			Resolve: func(p graphql.ResolveParams) (interface{}, error) {
				return p.Source.(User).GetUsername(), nil
			},
		},
		"name": &graphql.Field{
			Type: graphql.String,
			Resolve: func(p graphql.ResolveParams) (interface{}, error) {
				name := p.Source.(User).GetName()
				if name == "" {
					return nil, nil
				}
				return name, nil
			},
		},
	},
	IsTypeOf: func(p graphql.IsTypeOfParams) bool {
		return !isSignedIn(p.Context, p.Value)
	},
})

type Me interface {
	User
	GetEmail() string
}

var MeObject = graphql.NewObject(graphql.ObjectConfig{
	Name:       "Me",
	Interfaces: []*graphql.Interface{UserInterface},
	Fields: graphql.Fields{
		"username": &graphql.Field{
			Type: graphql.NewNonNull(graphql.String),
			Resolve: func(p graphql.ResolveParams) (interface{}, error) {
				return p.Source.(Me).GetUsername(), nil
			},
		},
		"email": &graphql.Field{
			Type: graphql.NewNonNull(graphql.String),
			Resolve: func(p graphql.ResolveParams) (interface{}, error) {
				return p.Source.(Me).GetEmail(), nil
			},
		},
		"name": &graphql.Field{
			Type: graphql.String,
			Resolve: func(p graphql.ResolveParams) (interface{}, error) {
				name := p.Source.(Me).GetName()
				if name == "" {
					return nil, nil
				}
				return name, nil
			},
		},
	},
	IsTypeOf: func(p graphql.IsTypeOfParams) bool {
		return isSignedIn(p.Context, p.Value)
	},
})
