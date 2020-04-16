package api

import (
	"github.com/graphql-go/graphql"
)

var UploadType = graphql.NewScalar(graphql.ScalarConfig{
	Name: "Upload",
})