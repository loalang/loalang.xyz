module Page.User exposing (Model, Msg, init, title, update, view)

import Api
import Api.Interface
import Api.Interface.User
import Api.Object
import Api.Object.Me
import Api.Object.NotMe
import Api.Query
import Graphql.Http
import Graphql.Operation exposing (RootQuery)
import Graphql.SelectionSet as SelectionSet exposing (SelectionSet)
import Html.Styled exposing (..)
import Url exposing (Url)


type alias Model =
    { username : String
    , data : UserData
    }


type UserData
    = Loading
    | Found User
    | NotFound


userData : String -> SelectionSet (Maybe User) RootQuery
userData username =
    Api.Query.user { username = username } user


type alias User =
    { me : Maybe Me
    , username : String
    , name : Maybe String
    }


user : SelectionSet User Api.Interface.User
user =
    Api.Interface.User.fragments
        { onMe = SelectionSet.map3 (Just >> User) me Api.Object.Me.username Api.Object.Me.name
        , onNotMe = SelectionSet.map2 (User Nothing) Api.Object.NotMe.username Api.Object.NotMe.name
        }


type alias Me =
    { email : String
    }


me : SelectionSet Me Api.Object.Me
me =
    SelectionSet.map Me Api.Object.Me.email


type Msg
    = GotResponse (Result (Graphql.Http.Error (Maybe User)) (Maybe User))


init : Url -> String -> ( Model, Cmd Msg )
init url username =
    ( { username = username, data = Loading }, Api.makeQuery url (userData username) GotResponse )


title : Model -> Maybe String
title { username } =
    Just username


view : Model -> Html Msg
view { data } =
    case data of
        Loading ->
            text "Loading..."

        NotFound ->
            text "User Not Found"

        Found u ->
            div [] [ text (Maybe.withDefault u.username u.name) ]


update : Url -> Msg -> Model -> ( Model, Cmd Msg )
update url msg model =
    case msg of
        GotResponse (Err _) ->
            ( { model | data = NotFound }, Cmd.none )

        GotResponse (Ok Nothing) ->
            ( { model | data = NotFound }, Cmd.none )

        GotResponse (Ok (Just u)) ->
            ( { model | data = Found u }, Cmd.none )
