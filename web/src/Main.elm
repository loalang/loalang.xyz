module Main exposing (main)

import Api.Object
import Api.Object.User
import Api.Query
import Browser exposing (Document, UrlRequest)
import Browser.Navigation
import Graphql.Http
import Graphql.Operation exposing (RootQuery)
import Graphql.SelectionSet exposing (SelectionSet, with)
import Html.Styled exposing (..)
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
    = Model
        { key : Browser.Navigation.Key
        , meQuery : MeQueryState
        }


type MeQueryState
    = Loading
    | Yay TestQueryResponse


type Msg
    = Noop
    | GotResponse (Result (Graphql.Http.Error TestQueryResponse) TestQueryResponse)


buildApiUrl : Url.Url -> Url.Url
buildApiUrl url =
    case url.host of
        "localhost" ->
            { url | port_ = Just 9091 }

        host ->
            { url | host = apiHost host }


apiHost : String -> String
apiHost webHost =
    let
        segments =
            webHost
                |> String.split "."
                |> List.reverse
    in
    segments
        |> List.drop 2
        |> List.append (List.take 2 segments ++ [ "api" ])
        |> List.reverse
        |> String.join "."


init : () -> Url.Url -> Browser.Navigation.Key -> ( Model, Cmd Msg )
init () url key =
    ( Model { key = key, meQuery = Loading }
    , testQuery
        |> Graphql.Http.queryRequest (Url.toString (buildApiUrl url))
        |> Graphql.Http.withCredentials
        |> Graphql.Http.send GotResponse
    )


view : Model -> Document Msg
view model =
    { title = "Loa"
    , body = [ toUnstyled (body model) ]
    }


type alias TestQueryResponse =
    { me : Maybe TestQueryUserResponse }


type alias TestQueryUserResponse =
    { username : String
    }


testQuery : SelectionSet TestQueryResponse RootQuery
testQuery =
    Graphql.SelectionSet.succeed TestQueryResponse
        |> with (Api.Query.me testQueryMe)


testQueryMe : SelectionSet TestQueryUserResponse Api.Object.User
testQueryMe =
    Graphql.SelectionSet.succeed TestQueryUserResponse
        |> with Api.Object.User.username


body : Model -> Html Msg
body (Model m) =
    div []
        [ case m.meQuery of
            Loading ->
                text "Loading..."

            Yay { me } ->
                case me of
                    Nothing ->
                        text "Not logged in"

                    Just { username } ->
                        text username
        ]


update : Msg -> Model -> ( Model, Cmd Msg )
update msg ((Model ({ meQuery } as record)) as model) =
    case msg of
        Noop ->
            ( model, Cmd.none )

        GotResponse result ->
            case result of
                Ok value ->
                    ( Model { record | meQuery = Yay value }, Cmd.none )

                Err error ->
                    ( model, Cmd.none )


subscriptions : Model -> Sub Msg
subscriptions model =
    Sub.none


onUrlRequest : UrlRequest -> Msg
onUrlRequest req =
    Noop


onUrlChange : Url.Url -> Msg
onUrlChange url =
    Noop
