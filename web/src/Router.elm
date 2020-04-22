module Router exposing (Route(..), parse, url)

import Url exposing (Url)
import Url.Parser exposing (..)


type Route
    = StorefrontRoute
    | UserRoute String
    | NotFoundRoute


url : Route -> String
url route =
    case route of
        StorefrontRoute ->
            "/"

        UserRoute username ->
            "/users/" ++ username

        NotFoundRoute ->
            "/"


router : Parser (Route -> a) a
router =
    oneOf
        [ map StorefrontRoute top
        , map UserRoute (s "users" </> string)
        ]


parse : Url -> Route
parse u =
    Maybe.withDefault NotFoundRoute (Url.Parser.parse router u)
