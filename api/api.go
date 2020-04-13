package api

import (
	"context"
	"github.com/graphql-go/graphql"
	"github.com/loalang/loalang.xyz/api/pkg"
	"github.com/loalang/loalang.xyz/api/search"
	"google.golang.org/grpc"
	"os"
)

const pkgToken = "pkg"
const searchToken = "search"

func Context() (func(context.Context) context.Context, error) {
	pkgConn, err := grpc.Dial(os.Getenv("PKG_HOST"), grpc.WithInsecure())
	if err != nil {
		return nil, err
	}
	searchConn, err := grpc.Dial(os.Getenv("SEARCH_HOST"), grpc.WithInsecure())
	if err != nil {
		return nil, err
	}

	pkgClient := pkg.NewPackageManagerClient(pkgConn)
	searchClient := search.NewSearchClient(searchConn)

	return func(ctx context.Context) context.Context {
		ctx = context.WithValue(ctx, pkgToken, pkgClient)
		ctx = context.WithValue(ctx, searchToken, searchClient)
		return ctx
	}, nil
}

func PkgClient(ctx context.Context) pkg.PackageManagerClient {
	return ctx.Value(pkgToken).(pkg.PackageManagerClient)
}

func SearchClient(ctx context.Context) search.SearchClient {
	return ctx.Value(searchToken).(search.SearchClient)
}

func Schema() (*graphql.Schema, error) {
	schema, err := graphql.NewSchema(graphql.SchemaConfig{
		Query: QueryType,
		Mutation: MutationType,
	})

	if err != nil {
		return nil, err
	}

	return &schema, nil
}
