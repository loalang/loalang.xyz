module Page.User exposing (Model, Msg(..), UserData(..), init, title, update, view)

import Api
import Api.Interface.User
import Api.Mutation
import Api.Object
import Api.Object.Me
import Api.Object.NotMe
import Api.Query
import Browser.Navigation as Navigation
import Graphql.Http
import Graphql.Operation exposing (RootQuery)
import Graphql.OptionalArgument as OptionalArgument
import Graphql.SelectionSet as SelectionSet exposing (SelectionSet)
import Html.Styled exposing (..)
import Html.Styled.Attributes exposing (..)
import Html.Styled.Events exposing (..)
import Router
import Url exposing (Url)


type alias Model =
    { username : String
    , data : UserData
    , updateForm : UpdateForm
    , error : Maybe (Graphql.Http.Error (Maybe UserData))
    }


type UserData
    = Loading
    | FoundMe Me
    | Found NotMe
    | NotFound


userData : String -> SelectionSet UserData RootQuery
userData username =
    SelectionSet.map (Maybe.withDefault NotFound)
        (Api.Query.user { username = username }
            (Api.Interface.User.fragments
                { onMe = SelectionSet.map FoundMe selectMe
                , onNotMe = SelectionSet.map Found selectUser
                }
            )
        )


type alias UpdateForm =
    { username : Maybe String
    , name : Maybe String
    , email : Maybe String
    , password : Maybe { new : String, current : String }
    }


initUpdateForm : UpdateForm
initUpdateForm =
    { username = Nothing
    , name = Nothing
    , email = Nothing
    , password = Nothing
    }


type alias NotMe =
    { username : String
    , name : Maybe String
    }


selectUser : SelectionSet NotMe Api.Object.NotMe
selectUser =
    SelectionSet.map2 NotMe
        Api.Object.NotMe.username
        Api.Object.NotMe.name


type alias Me =
    { username : String
    , name : Maybe String
    , email : String
    }


selectMe : SelectionSet Me Api.Object.Me
selectMe =
    SelectionSet.map3 Me
        Api.Object.Me.username
        Api.Object.Me.name
        Api.Object.Me.email


type Msg
    = GotResponse (Result (Graphql.Http.Error UserData) UserData)
    | SubmittedUpdate (Result (Graphql.Http.Error (Maybe UserData)) (Maybe UserData))
    | SetUpdateForm UpdateForm
    | SubmitUpdateForm


init : Url -> String -> ( Model, Cmd Msg )
init url username =
    ( { username = username
      , data = Loading
      , updateForm = initUpdateForm
      , error = Nothing
      }
    , Api.makeQuery url (userData username) GotResponse
    )


title : Model -> Maybe String
title { username } =
    Just username


view : Model -> Html Msg
view { data, updateForm } =
    case data of
        Loading ->
            text "Loading..."

        NotFound ->
            text "User Not Found"

        Found u ->
            div []
                [ h1 [] [ text (Maybe.withDefault u.username u.name) ] ]

        FoundMe u ->
            div []
                [ h1 [] [ text (Maybe.withDefault u.username u.name) ]
                , viewUserForm u updateForm
                ]


viewUserForm : Me -> UpdateForm -> Html Msg
viewUserForm me form =
    div []
        [ input
            [ type_ "text"
            , value (form.username |> Maybe.withDefault me.username)
            , placeholder "Username"
            , onInput (\value -> SetUpdateForm { form | username = Just value })
            ]
            []
        , input
            [ type_ "text"
            , value (form.name |> Maybe.withDefault (me.name |> Maybe.withDefault ""))
            , placeholder "Name"
            , onInput (\value -> SetUpdateForm { form | name = Just value })
            ]
            []
        , button [ type_ "submit", onClick SubmitUpdateForm ] [ text "Save" ]
        ]


update : Navigation.Key -> Url -> Msg -> Model -> ( Model, Cmd Msg, Maybe Me )
update navKey url msg model =
    case msg of
        GotResponse (Err _) ->
            ( { model | data = NotFound }, Cmd.none, Nothing )

        GotResponse (Ok data) ->
            ( { model | data = data }, Cmd.none, Nothing )

        SetUpdateForm f ->
            ( { model | updateForm = f }, Cmd.none, Nothing )

        SubmitUpdateForm ->
            ( model
            , Api.performMutation
                url
                (Api.Mutation.me
                    (\args ->
                        { args
                            | password = OptionalArgument.fromMaybe model.updateForm.password
                            , username = OptionalArgument.fromMaybe model.updateForm.username
                            , email = OptionalArgument.fromMaybe model.updateForm.email
                            , name = OptionalArgument.fromMaybe model.updateForm.name
                        }
                    )
                    (SelectionSet.map FoundMe selectMe)
                )
                SubmittedUpdate
            , Nothing
            )

        SubmittedUpdate (Err error) ->
            ( { model | error = Just error }, Cmd.none, Nothing )

        SubmittedUpdate (Ok (Just data)) ->
            case data of
                FoundMe me ->
                    if me.username /= model.username then
                        ( { model | data = data }, Navigation.pushUrl navKey (Router.url (Router.UserRoute me.username)), Just me )

                    else
                        ( { model | data = data }, Cmd.none, Just me )

                _ ->
                    ( { model | data = data }, Cmd.none, Nothing )

        SubmittedUpdate (Ok Nothing) ->
            ( model, Cmd.none, Nothing )
