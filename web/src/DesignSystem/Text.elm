module DesignSystem.Text exposing (..)

import Css exposing (..)
import DesignSystem.Breakpoint exposing (whenWide)


headerL =
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


headerM =
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


headerS =
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


bodyM =
    batch
        [ fontStyle normal
        , fontWeight normal
        , fontSize (px 16)
        , lineHeight (px 20)
        , whenWide
            [ fontSize (px 15)
            ]
        ]


bodyS =
    batch
        [ fontStyle normal
        , fontWeight normal
        , fontSize (px 11)
        , lineHeight (px 15)
        , letterSpacing (em 0.02)
        ]


label =
    batch
        [ fontStyle normal
        , fontWeight (int 500)
        , fontSize (px 10)
        , lineHeight (px 15)
        , letterSpacing (em 0.09)
        , textTransform uppercase
        ]


codeM =
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


codeS =
    batch
        [ fontFamilies [ "SF Mono", "monospace" ]
        , fontStyle normal
        , fontWeight normal
        , fontSize (px 11)
        , lineHeight (px 15)
        ]


input =
    batch
        [ bodyM, whenWide [ bodyS ] ]


codeInput =
    batch
        [ codeM, whenWide [ codeS ] ]
