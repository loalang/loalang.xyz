module Page.Storefront exposing (Model, Msg, init, title, update, view)

import Html.Styled exposing (..)


type alias Model =
    {}


type Msg
    = Noop


init : ( Model, Cmd Msg )
init =
    ( {}, Cmd.none )


title : Model -> Maybe String
title _ =
    Nothing


view : Model -> Html Msg
view _ =
    div [] [ text "Storefront" ]


update : Msg -> Model -> ( Model, Cmd Msg )
update msg model =
    case msg of
        Noop ->
            ( model, Cmd.none )
