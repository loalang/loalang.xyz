module Api exposing (request)

import Array
import Graphql.Http
import Graphql.Operation exposing (RootQuery)
import Graphql.SelectionSet exposing (SelectionSet)
import Url exposing (Url)


request : Url -> SelectionSet decodesTo RootQuery -> (Result (Graphql.Http.Error decodesTo) decodesTo -> msg) -> Cmd msg
request url query mapper =
    query
        |> Graphql.Http.queryRequest (deriveApiUrl url.host)
        |> Graphql.Http.withCredentials
        |> Graphql.Http.send mapper


deriveApiUrl : String -> String
deriveApiUrl host =
    case host of
        "localhost" ->
            "http://localhost:9091"

        h ->
            let
                segments =
                    h
                        |> String.split "."
                        |> Array.fromList
            in
            segments
                |> Array.slice 0 -2
                |> Array.push "api"
                |> (\a -> Array.append a (Array.slice -2 (Array.length segments) segments))
                |> Array.toList
                |> String.join "."
                |> String.append "https://"
