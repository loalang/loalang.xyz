module Page.UserPage exposing (..)

import Api
import Api.Interface
import Api.Interface.User
import Api.Mutation
import Api.Object
import Api.Object.Me
import Api.Object.NotMe
import Api.Query
import Browser.Navigation as Navigation
import DesignSystem.Input
import DesignSystem.Text
import DesignSystem.View
import Graphql.OptionalArgument exposing (OptionalArgument(..))
import Graphql.SelectionSet as SelectionSet exposing (SelectionSet)
import Html.Styled exposing (..)
import Html.Styled.Events exposing (onSubmit)
import Router
import Url exposing (Url)


type alias Model =
    { username : String
    , userData : UserData
    , url : Url
    , errors : List String
    , userEditForm : UserEditForm
    , navKey : Navigation.Key
    }


type alias UserEditForm =
    { username : String
    , name : String
    }


type Msg
    = UserDataUpdated UserData
    | UserEditRequested
    | UserEditPerformed (Result (List String) (Maybe Me))
    | UserEditFormUpdated UserEditForm


type UserData
    = Loading
    | NotFound
    | Found NotMe
    | FoundMe Me


type alias NotMe =
    { username : String }


type alias Me =
    { username : String
    , name : Maybe String
    }


init : Url -> Navigation.Key -> String -> ( Model, Cmd Msg )
init url navKey username =
    ( { url = url
      , username = username
      , userData = Loading
      , errors = []
      , navKey = navKey
      , userEditForm =
            { username = ""
            , name = ""
            }
      }
    , Api.makeQuery url
        (Api.Query.user { username = username } selectUserData)
        (Result.withDefault Nothing
            >> Maybe.withDefault NotFound
            >> UserDataUpdated
        )
    )


update : Model -> Msg -> ( Model, Cmd Msg, Maybe Me )
update model msg =
    case msg of
        UserDataUpdated userData ->
            case userData of
                FoundMe me ->
                    ( { model
                        | userData = userData
                        , userEditForm =
                            { username = me.username
                            , name = me.name |> Maybe.withDefault ""
                            }
                      }
                    , Cmd.none
                    , Nothing
                    )

                _ ->
                    ( { model | userData = userData }, Cmd.none, Nothing )

        UserEditRequested ->
            ( model
            , Api.performMutation model.url
                (Api.Mutation.me
                    (\args ->
                        { args
                            | username = Present model.userEditForm.username
                            , name = Present model.userEditForm.name
                        }
                    )
                    selectMe
                )
                UserEditPerformed
            , Nothing
            )

        UserEditPerformed (Err errors) ->
            ( { model | errors = errors }, Cmd.none, Nothing )

        UserEditPerformed (Ok Nothing) ->
            ( model, Navigation.reload, Nothing )

        UserEditPerformed (Ok (Just me)) ->
            ( { model | userData = FoundMe me }
            , if me.username /= model.username then
                Navigation.pushUrl model.navKey (Router.url (Router.UserRoute me.username))

              else
                Cmd.none
            , Just me
            )

        UserEditFormUpdated form ->
            ( { model | userEditForm = form }, Cmd.none, Nothing )


selectUserData : SelectionSet UserData Api.Interface.User
selectUserData =
    Api.Interface.User.fragments
        { onMe = SelectionSet.map FoundMe selectMe
        , onNotMe = SelectionSet.map Found selectNotMe
        }


selectNotMe : SelectionSet NotMe Api.Object.NotMe
selectNotMe =
    SelectionSet.map NotMe Api.Object.NotMe.username


selectMe : SelectionSet Me Api.Object.Me
selectMe =
    SelectionSet.map2 Me
        Api.Object.Me.username
        Api.Object.Me.name


view : Model -> Html Msg
view model =
    case model.userData of
        Loading ->
            DesignSystem.View.loading

        NotFound ->
            text (model.username ++ " is not signed up!")

        Found notMe ->
            text notMe.username

        FoundMe me ->
            form [ onSubmit UserEditRequested ]
                [ DesignSystem.Input.string "Username" (setUsername model.userEditForm) model.userEditForm.username
                , DesignSystem.Input.string "Name" (setName model.userEditForm) model.userEditForm.name
                , DesignSystem.View.submitButton UserEditRequested (text "Save")
                , div [] (model.errors |> List.map (DesignSystem.Text.bodyS << text))
                ]


setUsername : UserEditForm -> String -> Msg
setUsername form value =
    UserEditFormUpdated { form | username = value }


setName : UserEditForm -> String -> Msg
setName form value =
    UserEditFormUpdated { form | name = value }
