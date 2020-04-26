module Page exposing (..)

import Browser.Navigation as Navigation
import Html.Styled as Html exposing (Html, text)
import Page.UserPage
import Router
import Url exposing (Url)


type Page
    = StorefrontPage
    | UserPage Page.UserPage.Model
    | NotFoundPage


type Msg
    = UserPageMsg Page.UserPage.Msg


init : Url -> Navigation.Key -> ( Page, Cmd Msg )
init url navKey =
    case Router.parse url of
        Router.StorefrontRoute ->
            ( StorefrontPage, Cmd.none )

        Router.UserRoute username ->
            Page.UserPage.init url navKey username
                |> Tuple.mapBoth UserPage (Cmd.map UserPageMsg)

        Router.NotFoundRoute ->
            ( NotFoundPage, Cmd.none )


update : Page -> Msg -> ( Page, Cmd Msg, Maybe Page.UserPage.Me )
update page msg =
    case ( page, msg ) of
        ( UserPage model, UserPageMsg m ) ->
            let
                ( p, cmd, me ) =
                    Page.UserPage.update model m
            in
            ( UserPage p, Cmd.map UserPageMsg cmd, me )

        _ ->
            ( page, Cmd.none, Nothing )


view : Page -> Html Msg
view page =
    case page of
        StorefrontPage ->
            text "Storefront"

        UserPage model ->
            Page.UserPage.view model |> Html.map UserPageMsg

        NotFoundPage ->
            text "Not Found"
