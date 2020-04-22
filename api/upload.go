package api

import (
	"github.com/graphql-go/graphql"
)

var UploadScalar = graphql.NewScalar(graphql.ScalarConfig{
	Name: "Upload",
})