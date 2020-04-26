module DesignSystem.View exposing (avatar, button, dropdown, linkButton, loading, reset, submitButton)

import Css exposing (..)
import Css.Animations
import Css.Global as Global
import DesignSystem.Color as Color
import DesignSystem.Text as Text
import Html.Styled exposing (Html, div, img, text)
import Html.Styled.Attributes exposing (css, src, type_)
import Html.Styled.Events exposing (onClick)


reset : List (Html msg) -> Html msg
reset children =
    div
        []
        ([ Global.global
            [ Global.html
                [ margin zero
                , Text.bodyMStyle
                , backgroundColor Color.background
                , color Color.standardText
                ]
            ]
         ]
            ++ children
        )


loading : Html msg
loading =
    div
        [ css
            [ position relative
            , display inlineBlock
            , height (em 1)
            , width (em 1)
            , animationName
                (Css.Animations.keyframes
                    [ ( 0, [ Css.Animations.opacity zero ] )
                    , ( 100, [ Css.Animations.opacity (num 1) ] )
                    ]
                )
            , animationDuration (ms 400)
            ]
        ]
        loadingBars


loadingBars : List (Html msg)
loadingBars =
    List.range 0 11
        |> List.map loadingBar


loadingBar : Int -> Html msg
loadingBar index =
    div
        [ css
            [ height (px 2)
            , width (em 0.3)
            , backgroundColor Color.supportiveText
            , borderRadius (px 1)
            , position absolute
            , left (calc (pct 50) minus (px 1))
            , top (calc (pct 50) minus (px 1))
            , transforms
                [ rotate (deg (360 * (toFloat index / 12)))
                , translate (em 0.2)
                ]
            , property "transform-origin" "1px 1px"
            , animationName
                (Css.Animations.keyframes
                    [ ( 0, [ Css.Animations.backgroundColor Color.supportiveText ] )
                    , ( 100, [ Css.Animations.backgroundColor transparent ] )
                    ]
                )
            , animationDuration (ms 600)
            , property "animation-iteration-count" "infinite"
            , animationDelay (ms ((600 / 12 * toFloat index) - 750))
            ]
        ]
        []


dropShadow : Style
dropShadow =
    property "box-shadow" "0px 1px 5px rgba(0, 0, 0, 0.11), 0px 12px 24px rgba(0, 0, 0, 0.07)"


dropdown : Bool -> msg -> List (Html msg) -> Html msg
dropdown isDropped onClose children =
    div
        [ css
            [ position relative
            ]
        ]
        (if isDropped then
            [ div
                []
                [ div
                    [ css
                        [ position fixed
                        , left zero
                        , top zero
                        , width (pct 100)
                        , height (pct 100)
                        ]
                    , onClick onClose
                    ]
                    []
                , div
                    [ css
                        [ position absolute
                        , color Color.standardText
                        , backgroundColor Color.background
                        , dropShadow
                        , right zero
                        , borderRadius (px 10)
                        , property "width" "max-content"
                        ]
                    ]
                    children
                ]
            ]

         else
            []
        )


avatar : Int -> { compatible | avatarUrl : Maybe String, name : Maybe String, username : String } -> Html msg
avatar size { avatarUrl, name, username } =
    div
        [ css
            [ height (size |> toFloat |> px)
            , width (size |> toFloat |> px)
            , borderRadius (size |> toFloat |> px)
            , overflow hidden
            ]
        ]
        [ case avatarUrl of
            Just url ->
                img
                    [ src url
                    , css
                        [ height (pct 100)
                        , width (pct 100)
                        , property "object-fit" "cover"
                        ]
                    ]
                    []

            Nothing ->
                div
                    [ css
                        [ height (pct 100)
                        , width (pct 100)
                        , backgroundColor Color.secondary
                        , color Color.standardText
                        , displayFlex
                        , alignItems center
                        , justifyContent center
                        , Text.headerSStyle
                        ]
                    ]
                    [ name |> Maybe.withDefault username |> initials |> text ]
        ]


initials : String -> String
initials =
    String.words
        >> List.map (String.slice 0 1)
        >> String.join ""
        >> String.toUpper


submitButton : msg -> Html msg -> Html msg
submitButton =
    buttonOfType "submit"


button : msg -> Html msg -> Html msg
button =
    buttonOfType "button"


buttonOfType : String -> msg -> Html msg -> Html msg
buttonOfType type__ msg child =
    Html.Styled.button
        [ css
            [ backgroundColor Color.surface
            , display inlineFlex
            , maxWidth maxContent
            , borderRadius (px 10)
            , padding3 (px 3) (px 10) (px 2)
            , focus
                [ backgroundColor Color.surfaceHighlighted
                ]
            ]
        , onClick msg
        , type_ type__
        ]
        [ Text.bodyS child ]


linkButton : msg -> Html msg -> Html msg
linkButton msg child =
    Html.Styled.button
        [ css
            [ display inline
            , width auto
            , color Color.supportiveText
            , focus
                [ textDecoration underline
                ]
            ]
        , onClick msg
        , type_ "button"
        ]
        [ Text.bodyS child ]
