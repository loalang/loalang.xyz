module Api exposing (request)

import Graphql.Http
import Graphql.Operation exposing (RootQuery)
import Graphql.SelectionSet exposing (SelectionSet)


request : SelectionSet decodesTo RootQuery -> (Result (Graphql.Http.Error decodesTo) decodesTo -> msg) -> Cmd msg
request query mapper =
    query
        |> Graphql.Http.queryRequest "http://localhost:9091"
        |> Graphql.Http.withCredentials
        |> Graphql.Http.send mapper
