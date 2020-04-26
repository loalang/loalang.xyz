module DesignSystem.Input exposing (email, password, string)

import Css exposing (..)
import DesignSystem.Color as Color
import DesignSystem.Text as Text
import Html.Styled exposing (Html, input)
import Html.Styled.Attributes exposing (css, pattern, placeholder, type_, value)
import Html.Styled.Events exposing (onInput)


inputStyle : Style
inputStyle =
    batch
        [ border3 (px 1) solid Color.surface
        , Text.inputStyle
        , padding3 (px 7) (px 10) (px 6)
        , borderRadius (px 5)
        , display inlineBlock
        , width (pct 100)
        , focus
            [ borderColor Color.surfaceHighlighted
            ]
        , placeholderSelectors
            |> List.map
                (\s ->
                    s
                        [ color Color.placeholderText ]
                )
            |> batch
        ]


placeholderSelectors =
    [ pseudoElement "-moz-focus-inner"
    , pseudoElement "-webkit-input-placeholder"
    , pseudoElement "-moz-placeholder"
    , pseudoElement "placeholder"
    , pseudoClass "-ms-input-placeholder"
    ]


string : String -> (String -> msg) -> String -> Html msg
string placeholder_ onValue value_ =
    input
        [ type_ "text"
        , css [ inputStyle ]
        , value value_
        , placeholder placeholder_
        , onInput onValue
        ]
        []


password : String -> (String -> msg) -> String -> Html msg
password placeholder_ onValue value_ =
    input
        [ type_ "password"
        , css [ inputStyle ]
        , value value_
        , placeholder placeholder_
        , onInput onValue
        ]
        []


email : String -> (String -> msg) -> String -> Html msg
email placeholder_ onValue value_ =
    input
        [ type_ "email"
        , css [ inputStyle ]
        , value value_
        , placeholder placeholder_
        , onInput onValue
        ]
        []
