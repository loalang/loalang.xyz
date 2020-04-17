module Main exposing (main)

import Browser exposing (Document, UrlRequest)
import Browser.Navigation
import Html exposing (Html)
import Url


main =
    Browser.application
        { init = init
        , onUrlChange = onUrlChange
        , onUrlRequest = onUrlRequest
        , subscriptions = subscriptions
        , update = update
        , view = view
        }


type Model
    = Hello


type Msg
    = Hey


init : () -> Url.Url -> Browser.Navigation.Key -> ( Model, Cmd Msg )
init flags url key =
    ( Hello, Cmd.none )


view : Model -> Document Msg
view model =
    { title = "Loa"
    , body = [ body ]
    }


body : Html Msg
body =
    Html.text "Wow!"


update : Msg -> Model -> ( Model, Cmd Msg )
update msg model =
    ( model, Cmd.none )


subscriptions : Model -> Sub Msg
subscriptions model =
    Sub.none


onUrlRequest : UrlRequest -> Msg
onUrlRequest req =
    Hey


onUrlChange : Url.Url -> Msg
onUrlChange url =
    Hey
