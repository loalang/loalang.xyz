package api

import (
	"context"
	"fmt"
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

func Context(request *http.Request, writer http.ResponseWriter) (context.Context, error) {
	ctx := request.Context()
	pkgConn, err := grpc.DialContext(ctx, os.Getenv("PKG_HOST"), grpc.WithInsecure())
	if err != nil {
		return nil, err
	}
	searchConn, err := grpc.DialContext(ctx, os.Getenv("SEARCH_HOST"), grpc.WithInsecure())
	if err != nil {
		return nil, err
	}
	authConn, err := grpc.DialContext(ctx, os.Getenv("AUTH_HOST"), grpc.WithInsecure())
	if err != nil {
		return nil, err
	}

	pkgClient := pkg.NewPackageManagerClient(pkgConn)
	searchClient := search.NewSearchClient(searchConn)
	authClient := auth.NewAuthenticationClient(authConn)

	ctx = context.WithValue(ctx, requestToken, request)
	ctx = context.WithValue(ctx, headerToken, writer.Header())
	ctx = context.WithValue(ctx, userToken, &currentUserCell{currentUser: nil})

	var currentUser *auth.User

	if cookie, _ := request.Cookie(AuthCookie); cookie != nil {
		tokenBytes := DecodeToken(cookie.Value)
		u, err := authClient.Lookup(ctx, &auth.LookupRequest{
			Token: tokenBytes,
		})
		if err == nil {
			currentUser = u
		} else {
			fmt.Println(err)
			DeleteCookie(ctx)
		}
	}
	ctx = context.WithValue(ctx, userToken, &currentUserCell{currentUser})
	ctx = context.WithValue(ctx, pkgToken, pkgClient)
	ctx = context.WithValue(ctx, searchToken, searchClient)
	ctx = context.WithValue(ctx, authToken, authClient)
	return ctx, nil
}

type currentUserCell struct {
	currentUser *auth.User
}

func Request(ctx context.Context) *http.Request {
	return ctx.Value(requestToken).(*http.Request)
}

func Header(ctx context.Context) http.Header {
	return ctx.Value(headerToken).(http.Header)
}

func CurrentUser(ctx context.Context) *auth.User {
	return ctx.Value(userToken).(*currentUserCell).currentUser
}

func SetCurrentUser(ctx context.Context, user *auth.User) {
	ctx.Value(userToken).(*currentUserCell).currentUser = user
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
		Query:    QueryObject,
		Mutation: MutationObject,
	})

	if err != nil {
		return nil, err
	}

	return &schema, nil
}
