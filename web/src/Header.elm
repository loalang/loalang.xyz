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


type Model
    = Loading
    | SignedIn User
    | Expanded Form (Maybe (Graphql.Http.Error (Maybe User)))
    | Collapsed Form (Maybe (Graphql.Http.Error (Maybe User)))
    | SignOutError (Graphql.Http.Error (Maybe Scalar.Ok))
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
    | SignedOut (Result (Graphql.Http.Error (Maybe Scalar.Ok)) (Maybe Scalar.Ok))
    | Expand Form (Maybe (Graphql.Http.Error (Maybe User)))


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
    ( Loading, Api.makeQuery url meQuery (GotResponse (SignIn { usernameOrEmail = "", password = "" })) )


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
                (case model of
                    Loading ->
                        [ text "Loading..." ]

                    Submitting _ ->
                        [ text "Submitting..." ]

                    Collapsed f e ->
                        [ button [ onClick (Expand f e) ] [ text "Sign in" ] ]

                    SignedIn u ->
                        [ text u.username, button [ onClick SignOut ] [ text "Sign Out" ] ]

                    Expanded form error ->
                        [ case form of
                            SignIn ({ usernameOrEmail, password } as f) ->
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
                                    , button [ onClick (SubmitForm form) ] [ text "Sign In" ]
                                    ]

                            SignUp ({ username, email, password, confirmPassword } as f) ->
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
                                    , button [ onClick (SubmitForm form) ] [ text "Sign Up" ]
                                    ]
                        , viewError error
                        ]

                    SignOutError error ->
                        [ Just error |> viewError ]
                )
            ]
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
            ( SignedIn u, Cmd.none )

        GotResponse form (Ok Nothing) ->
            ( Collapsed form Nothing, Cmd.none )

        GotResponse form (Err error) ->
            ( Expanded form (Just error), Cmd.none )

        UpdateForm form ->
            ( Expanded form Nothing, Cmd.none )

        SubmitForm (SignUp form) ->
            ( Submitting (SignUp form), Api.performMutation url (signUpMutation form) (GotResponse (SignUp form)) )

        SubmitForm (SignIn form) ->
            ( Submitting (SignIn form), Api.performMutation url (signInMutation form) (GotResponse (SignIn form)) )

        SignOut ->
            ( Collapsed (SignIn { usernameOrEmail = "", password = "" }) Nothing, Api.performMutation url Mutation.signOut SignedOut )

        SignedOut (Ok _) ->
            ( model, Cmd.none )

        SignedOut (Err error) ->
            ( SignOutError error, Cmd.none )

        Expand f e ->
            ( Expanded f e, Cmd.none )
