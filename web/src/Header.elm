module Header exposing (Model, Msg, init, update, view)

import Api
import Api.Mutation as Mutation
import Api.Object.User as User
import Api.Query as Query
import Api.Scalar as Scalar
import Css exposing (..)
import DesignSystem.Color
import Graphql.Http
import Graphql.Operation exposing (RootMutation, RootQuery)
import Graphql.SelectionSet as SelectionSet exposing (SelectionSet)
import Html.Styled exposing (..)
import Html.Styled.Attributes exposing (..)
import Html.Styled.Events exposing (..)
import Url exposing (Url)


type alias Model =
    { auth : Auth
    , isExpanded : Bool
    , authError : Maybe (Graphql.Http.Error (Maybe User))
    , signOutError : Maybe (Graphql.Http.Error (Maybe Scalar.Ok))
    }


type Auth
    = Loading
    | SignedIn User
    | SignedOut Form
    | Submitting Form


type Form
    = SignIn SignInForm
    | SignUp SignUpForm


type alias SignInForm =
    { usernameOrEmail : String, password : String }


type alias SignUpForm =
    { username : String, email : String, password : String, confirmPassword : String }


type alias User =
    { username : String
    }


type Msg
    = GotResponse Form (Result (Graphql.Http.Error (Maybe User)) (Maybe User))
    | UpdateForm Form
    | SubmitForm Form
    | SignOut
    | DidSignOut (Result (Graphql.Http.Error (Maybe Scalar.Ok)) (Maybe Scalar.Ok))
    | Expand


meQuery : SelectionSet (Maybe User) RootQuery
meQuery =
    Query.me
        (SelectionSet.map User
            User.username
        )


signUpMutation : SignUpForm -> SelectionSet (Maybe User) RootMutation
signUpMutation form =
    Mutation.signUp
        { username = form.username
        , email = form.email
        , password = form.password
        }
        (SelectionSet.map User
            User.username
        )


signInMutation : SignInForm -> SelectionSet (Maybe User) RootMutation
signInMutation form =
    Mutation.signIn form
        (SelectionSet.map User
            User.username
        )


init : Url -> ( Model, Cmd Msg )
init url =
    ( { auth = Loading
      , isExpanded = False
      , authError = Nothing
      , signOutError = Nothing
      }
    , Api.makeQuery url meQuery (GotResponse (SignIn { usernameOrEmail = "", password = "" }))
    )


view : Model -> Html Msg
view model =
    div
        [ css
            [ backgroundColor DesignSystem.Color.primary
            , color DesignSystem.Color.background
            ]
        ]
        [ div [ css [ displayFlex, alignItems center, justifyContent spaceBetween ] ]
            [ div [ css [ displayFlex, alignItems center, flex (int 1) ] ]
                [ viewLink "/" [ text "Home" ]
                , viewLink "/pkg" [ text "Packages" ]
                ]
            , div [ css [ flexGrow (int 0), flexShrink (int 0), flexBasis auto ] ]
                [ case model.auth of
                    SignedIn u ->
                        div []
                            [ text u.username
                            , button [ onClick SignOut ] [ text "Sign Out" ]
                            ]

                    _ ->
                        if model.isExpanded then
                            viewAuth model

                        else
                            button [ onClick Expand ] [ text "Sign in" ]
                ]
            ]
        ]


viewAuth : Model -> Html Msg
viewAuth model =
    case model.auth of
        Loading ->
            text "Loading..."

        Submitting _ ->
            text "Submitting..."

        SignedIn _ ->
            div [] []

        SignedOut form ->
            div []
                [ case form of
                    SignIn f ->
                        viewSignInForm f

                    SignUp f ->
                        viewSignUpForm f
                , viewError model.authError
                ]


viewSignInForm : SignInForm -> Html Msg
viewSignInForm ({ usernameOrEmail, password } as f) =
    div []
        [ input
            [ type_ "email"
            , value usernameOrEmail
            , placeholder "Username"
            , onInput (\s -> { f | usernameOrEmail = s } |> SignIn |> UpdateForm)
            ]
            []
        , input
            [ type_ "password"
            , value password
            , placeholder "Password"
            , onInput (\s -> { f | password = s } |> SignIn |> UpdateForm)
            ]
            []
        , button
            [ onClick
                ({ username = usernameOrEmail
                 , email = ""
                 , password = password
                 , confirmPassword = ""
                 }
                    |> SignUp
                    |> UpdateForm
                )
            ]
            [ text "Sign Up" ]
        , button [ onClick (SubmitForm (SignIn f)) ] [ text "Sign In" ]
        ]


viewSignUpForm : SignUpForm -> Html Msg
viewSignUpForm ({ username, email, password, confirmPassword } as f) =
    div []
        [ input
            [ type_ "text"
            , value username
            , placeholder "Username"
            , onInput (\s -> { f | username = s } |> SignUp |> UpdateForm)
            ]
            []
        , input
            [ type_ "email"
            , value email
            , placeholder "Email"
            , onInput (\s -> { f | email = s } |> SignUp |> UpdateForm)
            ]
            []
        , input
            [ type_ "password"
            , value password
            , placeholder "Password"
            , onInput (\s -> { f | password = s } |> SignUp |> UpdateForm)
            ]
            []
        , input
            [ type_ "password"
            , value confirmPassword
            , placeholder "Confirm Password"
            , onInput (\s -> { f | confirmPassword = s } |> SignUp |> UpdateForm)
            ]
            []
        , button
            [ onClick
                ({ usernameOrEmail = username
                 , password = password
                 }
                    |> SignIn
                    |> UpdateForm
                )
            ]
            [ text "Sign In" ]
        , button [ onClick (SubmitForm (SignUp f)) ] [ text "Sign Up" ]
        ]


viewError : Maybe (Graphql.Http.Error decodesTo) -> Html Msg
viewError error =
    case error of
        Nothing ->
            text ""

        Just (Graphql.Http.GraphqlError _ errors) ->
            div [] (List.map (\e -> text e.message) errors)

        Just (Graphql.Http.HttpError _) ->
            text "We're having trouble communicating with the server right now. Please try again later."


viewLink : String -> List (Html Msg) -> Html Msg
viewLink path children =
    a [ href path ] children


update : Url -> Msg -> Model -> ( Model, Cmd Msg )
update url msg model =
    case msg of
        GotResponse _ (Ok (Just u)) ->
            ( { model | auth = SignedIn u, isExpanded = False }
            , Cmd.none
            )

        GotResponse form (Ok Nothing) ->
            ( { model | auth = SignedOut form }
            , Cmd.none
            )

        GotResponse form (Err error) ->
            ( { model | auth = SignedOut form, authError = Just error }
            , Cmd.none
            )

        UpdateForm form ->
            ( { model | auth = SignedOut form, authError = Nothing }
            , Cmd.none
            )

        SubmitForm (SignUp form) ->
            ( { model | auth = Submitting (SignUp form) }
            , Api.performMutation url (signUpMutation form) (GotResponse (SignUp form))
            )

        SubmitForm (SignIn form) ->
            ( { model | auth = Submitting (SignIn form) }
            , Api.performMutation url (signInMutation form) (GotResponse (SignIn form))
            )

        SignOut ->
            ( { model | auth = SignedOut (SignIn { usernameOrEmail = "", password = "" }) }
            , Api.performMutation url Mutation.signOut DidSignOut
            )

        DidSignOut (Ok _) ->
            ( model, Cmd.none )

        DidSignOut (Err error) ->
            ( { model | signOutError = Just error }, Cmd.none )

        Expand ->
            ( { model | isExpanded = True }, Cmd.none )