module Router exposing (Route(..), parse)

import Url exposing (Url)
import Url.Parser exposing (Parser, map, oneOf, top)


type Route
    = StorefrontRoute
    | NotFoundRoute


router : Parser (Route -> a) a
router =
    oneOf
        [ map StorefrontRoute top ]


parse : Url -> Route
parse url =
    Maybe.withDefault NotFoundRoute (Url.Parser.parse router url)
