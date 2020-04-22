module Main exposing (main)

import Browser exposing (Document, UrlRequest)
import Browser.Navigation as Navigation
import Css exposing (..)
import Css.Global
import DesignSystem.Color
import DesignSystem.Text
import Header
import Html
import Html.Styled
import Html.Styled.Attributes
import Page.NotFound
import Page.Storefront
import Router
import Url exposing (Url)


main =
    Browser.application
        { init = init
        , onUrlChange = UrlChanged
        , onUrlRequest = LinkClicked
        , subscriptions = subscriptions
        , update = update
        , view = view
        }


type alias Model =
    { key : Navigation.Key
    , url : Url
    , header : Header.Model
    , page : Page
    }


type Page
    = StorefrontPage Page.Storefront.Model
    | NotFoundPage


type Msg
    = LinkClicked Browser.UrlRequest
    | UrlChanged Url.Url
    | HeaderMsg Header.Msg
    | StorefrontMsg Page.Storefront.Msg


init : () -> Url -> Navigation.Key -> ( Model, Cmd Msg )
init _ url key =
    let
        ( page, pageMsg ) =
            initRoute (Router.parse url)

        ( header, headerMsg ) =
            Header.init url
    in
    ( { key = key
      , header = header
      , page = page
      , url = url
      }
    , Cmd.batch [ pageMsg, Cmd.map HeaderMsg headerMsg ]
    )


initRoute : Router.Route -> ( Page, Cmd Msg )
initRoute route =
    case route of
        Router.StorefrontRoute ->
            Tuple.mapBoth StorefrontPage (Cmd.map StorefrontMsg) Page.Storefront.init

        Router.NotFoundRoute ->
            ( NotFoundPage, Cmd.none )


view : Model -> Document Msg
view model =
    case model.page of
        StorefrontPage page ->
            { title = buildTitle (Page.Storefront.title page)
            , body = viewContainer model ((Page.Storefront.view >> Html.Styled.map StorefrontMsg) page)
            }

        NotFoundPage ->
            { title = buildTitle Page.NotFound.title
            , body = viewContainer model Page.NotFound.view
            }


viewContainer : Model -> Html.Styled.Html Msg -> List (Html.Html Msg)
viewContainer model content =
    [ Html.Styled.toUnstyled
        (Html.Styled.div [ Html.Styled.Attributes.id "root" ]
            [ (Header.view >> Html.Styled.map HeaderMsg) model.header
            , content
            , Css.Global.global
                [ Css.Global.html
                    [ margin zero
                    , backgroundColor DesignSystem.Color.background
                    , color DesignSystem.Color.standardText
                    , DesignSystem.Text.bodyM
                    ]
                ]
            ]
        )
    ]


buildTitle : Maybe String -> String
buildTitle title =
    title
        |> Maybe.map List.singleton
        |> Maybe.withDefault []
        |> (\l -> l ++ [ "Loa Programming Language" ])
        |> String.join " | "


update : Msg -> Model -> ( Model, Cmd Msg )
update msg model =
    case ( model.page, msg ) of
        ( _, LinkClicked urlRequest ) ->
            case urlRequest of
                Browser.Internal url ->
                    ( model, Navigation.pushUrl model.key (Url.toString url) )

                Browser.External href ->
                    ( model, Navigation.load href )

        ( _, UrlChanged url ) ->
            url
                |> Router.parse
                |> initRoute
                |> Tuple.mapFirst (\page -> { model | page = page })

        ( _, HeaderMsg hMsg ) ->
            Tuple.mapBoth (updateHeader model) (Cmd.map HeaderMsg) (Header.update model.url hMsg model.header)

        ( StorefrontPage sModel, StorefrontMsg sMsg ) ->
            Tuple.mapBoth (updatePage StorefrontPage model) (Cmd.map StorefrontMsg) (Page.Storefront.update sMsg sModel)

        _ ->
            ( model, Cmd.none )


updatePage : (a -> Page) -> Model -> a -> Model
updatePage map model a =
    { model | page = map a }


updateHeader : Model -> Header.Model -> Model
updateHeader model header =
    { model | header = header }


subscriptions : Model -> Sub Msg
subscriptions _ =
    Sub.none
