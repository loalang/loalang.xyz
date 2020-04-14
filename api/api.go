package api

import (
	"context"
	"github.com/graphql-go/graphql"
	"github.com/loalang/loalang.xyz/api/auth"
	"github.com/loalang/loalang.xyz/api/pkg"
	"github.com/loalang/loalang.xyz/api/search"
	"google.golang.org/grpc"
	"net/http"
	"os"
)

const requestToken = "request"
const headerToken = "header"
const userToken = "user"
const pkgToken = "pkg"
const searchToken = "search"
const authToken = "auth"

func Context() (func(context.Context, *http.Request, http.ResponseWriter) context.Context, error) {
	pkgConn, err := grpc.Dial(os.Getenv("PKG_HOST"), grpc.WithInsecure())
	if err != nil {
		return nil, err
	}
	searchConn, err := grpc.Dial(os.Getenv("SEARCH_HOST"), grpc.WithInsecure())
	if err != nil {
		return nil, err
	}
	authConn, err := grpc.Dial(os.Getenv("AUTH_HOST"), grpc.WithInsecure())
	if err != nil {
		return nil, err
	}

	pkgClient := pkg.NewPackageManagerClient(pkgConn)
	searchClient := search.NewSearchClient(searchConn)
	authClient := auth.NewAuthenticationClient(authConn)

	return func(ctx context.Context, request *http.Request, writer http.ResponseWriter) context.Context {
		var currentUser *auth.User

		cookie, err := request.Cookie(AuthCookie)
		if err == nil {
			tokenBytes := DecodeToken(cookie.Value)
			u, err := authClient.Lookup(ctx, &auth.LookupRequest{
				Token: tokenBytes,
			})
			if err == nil {
				currentUser = u
			}
		}

		ctx = context.WithValue(ctx, requestToken, request)
		ctx = context.WithValue(ctx, headerToken, writer.Header())
		ctx = context.WithValue(ctx, userToken, currentUser)
		ctx = context.WithValue(ctx, pkgToken, pkgClient)
		ctx = context.WithValue(ctx, searchToken, searchClient)
		ctx = context.WithValue(ctx, authToken, authClient)
		return ctx
	}, nil
}

func Request(ctx context.Context) *http.Request {
	return ctx.Value(requestToken).(*http.Request)
}

func Header(ctx context.Context) http.Header {
	return ctx.Value(headerToken).(http.Header)
}

func CurrentUser(ctx context.Context) *auth.User {
	u, ok := ctx.Value(userToken).(*auth.User)
	if !ok {
		return nil
	}
	return u
}

func PkgClient(ctx context.Context) pkg.PackageManagerClient {
	return ctx.Value(pkgToken).(pkg.PackageManagerClient)
}

func SearchClient(ctx context.Context) search.SearchClient {
	return ctx.Value(searchToken).(search.SearchClient)
}

func AuthClient(ctx context.Context) auth.AuthenticationClient {
	return ctx.Value(authToken).(auth.AuthenticationClient)
}

func Schema() (*graphql.Schema, error) {
	schema, err := graphql.NewSchema(graphql.SchemaConfig{
		Query:    QueryType,
		Mutation: MutationType,
	})

	if err != nil {
		return nil, err
	}

	return &schema, nil
}
