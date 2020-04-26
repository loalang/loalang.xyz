module DesignSystem.Text exposing (bodyM, bodyMStyle, bodyS, codeInput, codeM, codeS, headerL, headerM, headerS, headerSStyle, input, inputStyle, label)

import Css exposing (..)
import DesignSystem.Breakpoint exposing (whenWide)
import Html.Styled exposing (Html, span)
import Html.Styled.Attributes exposing (..)


styledBy : Style -> Html msg -> Html msg
styledBy style child =
    span
        [ css [ style, display inlineBlock ] ]
        [ child ]


headerLStyle : Style
headerLStyle =
    batch
        [ fontStyle normal
        , fontWeight normal
        , fontSize (px 37)
        , lineHeight (px 40)
        , whenWide
            [ fontSize (px 52)
            , lineHeight (px 56)
            , letterSpacing (em -0.02)
            ]
        ]


headerL =
    styledBy headerLStyle


headerMStyle =
    batch
        [ fontStyle normal
        , fontWeight (int 500)
        , fontSize (px 28)
        , lineHeight (px 33)
        , whenWide
            [ fontSize (px 35)
            , lineHeight (px 40)
            ]
        ]


headerM =
    styledBy headerMStyle


headerSStyle =
    batch
        [ fontStyle normal
        , fontWeight (int 500)
        , fontSize (px 16)
        , lineHeight (px 20)
        , letterSpacing (em 0.02)
        , whenWide
            [ fontSize (px 15)
            ]
        ]


headerS =
    styledBy headerSStyle


bodyMNStyle =
    batch
        [ fontStyle normal
        , fontWeight normal
        , fontSize (px 16)
        , lineHeight (px 20)
        ]


bodyMStyle =
    batch
        [ bodyMNStyle
        , whenWide
            [ fontSize (px 15)
            ]
        ]


bodyM =
    styledBy bodyMStyle


bodySStyle =
    batch
        [ fontStyle normal
        , fontWeight normal
        , fontSize (px 11)
        , lineHeight (px 15)
        , letterSpacing (em 0.02)
        ]


bodyS =
    styledBy bodySStyle


labelStyle =
    batch
        [ fontStyle normal
        , fontWeight (int 500)
        , fontSize (px 10)
        , lineHeight (px 15)
        , letterSpacing (em 0.09)
        , textTransform uppercase
        ]


label =
    styledBy labelStyle


codeMStyle =
    batch
        [ fontFamilies [ "SF Mono", "monospace" ]
        , fontStyle normal
        , fontWeight normal
        , fontSize (px 16)
        , lineHeight (px 20)
        , letterSpacing (em -0.03)
        , whenWide
            [ fontSize (px 15)
            ]
        ]


codeM =
    styledBy codeMStyle


codeSStyle =
    batch
        [ fontFamilies [ "SF Mono", "monospace" ]
        , fontStyle normal
        , fontWeight normal
        , fontSize (px 11)
        , lineHeight (px 15)
        ]


codeS =
    styledBy codeSStyle


inputStyle =
    batch
        [ bodyMNStyle, whenWide [ bodySStyle ] ]


input =
    styledBy inputStyle


codeInputStyle =
    batch
        [ codeMStyle, whenWide [ codeSStyle ] ]


codeInput =
    styledBy codeInputStyle
