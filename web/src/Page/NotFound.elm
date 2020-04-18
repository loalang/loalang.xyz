module Page.NotFound exposing (title, view)

import Html.Styled exposing (..)
import Html.Styled.Attributes exposing (..)


title : Maybe String
title =
    Just "404"


view : Html msg
view =
    div []
        [ text "Not Found"
        , a [ href "/" ] [ text "Go home" ]
        ]
