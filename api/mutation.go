package api

import (
	"errors"
	"github.com/graphql-go/graphql"
	"github.com/loalang/loalang.xyz/api/auth"
	"github.com/loalang/loalang.xyz/api/pkg"
)

var MutationType = graphql.NewObject(graphql.ObjectConfig{
	Name: "Mutation",
	Fields: graphql.Fields{
		"publishPackage": &graphql.Field{
			Type: OKType,
			Args: graphql.FieldConfigArgument{
				"name": &graphql.ArgumentConfig{
					Type: graphql.NewNonNull(graphql.String),
				},
			},
			Resolve: func(p graphql.ResolveParams) (interface{}, error) {
				client := PkgClient(p.Context)
				_, err := client.Test(p.Context, &pkg.TestRequest{
					Value: p.Args["name"].(string),
				})
				if err != nil {
					return nil, err
				}
				return OK, nil
			},
		},

		// Auth
		"signup": &graphql.Field{
			Type: UserType,
			Args: graphql.FieldConfigArgument{
				"username": &graphql.ArgumentConfig{
					Type: graphql.NewNonNull(graphql.String),
				},
				"email": &graphql.ArgumentConfig{
					Type: graphql.NewNonNull(graphql.String),
				},
				"password": &graphql.ArgumentConfig{
					Type: graphql.NewNonNull(graphql.String),
				},
			},
			Resolve: func(p graphql.ResolveParams) (interface{}, error) {
				authClient := AuthClient(p.Context)
				res, err := authClient.SignUp(p.Context, &auth.SignUpRequest{
					Username: p.Args["username"].(string),
					Email:    p.Args["email"].(string),
					Password: p.Args["password"].(string),
				})
				if err != nil {
					return nil, err
				}

				SetCookie(p.Context, res.Token)

				return User(res.User), nil
			},
		},
		"login": &graphql.Field{
			Type: UserType,
			Args: graphql.FieldConfigArgument{
				"usernameOrEmail": &graphql.ArgumentConfig{
					Type: graphql.NewNonNull(graphql.String),
				},
				"password": &graphql.ArgumentConfig{
					Type: graphql.NewNonNull(graphql.String),
				},
			},
			Resolve: func(p graphql.ResolveParams) (interface{}, error) {
				authClient := AuthClient(p.Context)
				res, err := authClient.LogIn(p.Context, &auth.LogInRequest{
					UsernameOrEmail: p.Args["usernameOrEmail"].(string),
					Password:        p.Args["password"].(string),
				})
				if err != nil {
					return nil, err
				}

				SetCookie(p.Context, res.Token)

				return User(res.User), nil
			},
		},
		"deleteAccount": &graphql.Field{
			Type:    OKType,
			Resolve: func(p graphql.ResolveParams) (interface{}, error) {
				cookie, err := Request(p.Context).Cookie(AuthCookie)
				if err != nil {
					return nil, err
				}
				token := DecodeToken(cookie.Value)
				confirmation, err := AuthClient(p.Context).DeleteAccount(p.Context, &auth.DeleteAccountRequest{
					Token: token,
				})
				if err != nil {
					return nil, err
				}
				if confirmation.Success {
					return OK, nil
				} else {
					return nil, errors.New("not logged in")
				}
			},
		},
	},
})
