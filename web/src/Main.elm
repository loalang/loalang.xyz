module Main exposing (main)

import Api
import Api.Interface
import Api.Interface.User
import Api.Query
import Browser exposing (Document, UrlRequest)
import Browser.Navigation as Navigation
import Css exposing (..)
import DesignSystem.Color
import DesignSystem.Input
import DesignSystem.Text
import DesignSystem.View
import Focus
import Graphql.Operation exposing (RootQuery)
import Graphql.SelectionSet as SelectionSet exposing (SelectionSet)
import Html.Styled as Html exposing (..)
import Html.Styled.Attributes exposing (..)
import Html.Styled.Events exposing (..)
import Page
import Page.UserPage
import Router
import Session exposing (Session)
import Session.SignInForm
import Session.SignUpForm
import Task
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
    , session : Session
    , sessionFormExpanded : Bool
    , sessionForm : Session.SessionForm
    , sessionFormErrors : List String
    , page : Page.Page
    }


type Msg
    = Noop
    | LinkClicked Browser.UrlRequest
    | UrlChanged Url.Url
    | SessionUpdated (Result (List String) Session)
    | SessionFormUpdated Session.SessionForm
    | SignInRequested Session.SignInForm.SignInForm
    | SignUpRequested Session.SignUpForm.SignUpForm
    | SignOutRequested
    | ToggleSessionForm
    | PageMsg Page.Msg


init : () -> Url -> Navigation.Key -> ( Model, Cmd Msg )
init _ url key =
    let
        ( session, sessionCmd ) =
            Session.init url (Ok >> SessionUpdated)

        ( page, pageCmd ) =
            Page.init url key

        model =
            { key = key
            , url = url
            , session = session
            , sessionFormExpanded = False
            , sessionForm = Session.SignIn Session.SignInForm.init
            , sessionFormErrors = []
            , page = page
            }
    in
    ( model
    , Cmd.batch
        [ sessionCmd, Cmd.map PageMsg pageCmd ]
    )


update : Msg -> Model -> ( Model, Cmd Msg )
update msg model =
    case msg of
        Noop ->
            ( model, Cmd.none )

        LinkClicked (Browser.Internal url) ->
            ( model, Navigation.pushUrl model.key (Url.toString url) )

        LinkClicked (Browser.External href) ->
            ( model, Navigation.load href )

        UrlChanged url ->
            let
                ( page, pageCmd ) =
                    Page.init url model.key
            in
            ( { model | url = url, page = page, sessionFormExpanded = False }, Cmd.map PageMsg pageCmd )

        SessionUpdated (Ok session) ->
            ( { model | session = session, sessionFormErrors = [], sessionFormExpanded = False }, Cmd.none )

        SessionUpdated (Err error) ->
            ( { model | sessionFormErrors = error }, Cmd.none )

        SessionFormUpdated sessionForm ->
            ( { model | sessionForm = sessionForm }, Cmd.none )

        SignInRequested form ->
            ( model, Session.performSignIn model.url SessionUpdated form )

        SignUpRequested form ->
            if form.password /= form.confirmPassword then
                ( { model | sessionFormErrors = [ "Passwords don't match" ] }, Cmd.none )

            else
                ( model, Session.performSignUp model.url SessionUpdated form )

        SignOutRequested ->
            ( model, Session.performSignOut model.url SessionUpdated )

        ToggleSessionForm ->
            ( { model | sessionFormExpanded = not model.sessionFormExpanded }, Focus.do Noop Focus.SignInForm )

        PageMsg m ->
            let
                ( p, mm, maybeMe ) =
                    Page.update model.page m
            in
            case maybeMe of
                Nothing ->
                    ( updatePage model p, Cmd.map PageMsg mm )

                Just me ->
                    let
                        mod =
                            updatePage model p
                    in
                    ( { mod | session = Session.updateUser mod.session me }, Cmd.map PageMsg mm )


updatePage : Model -> Page.Page -> Model
updatePage model page =
    { model | page = page }


subscriptions : Model -> Sub Msg
subscriptions _ =
    Sub.none


type alias User =
    { username : String
    }


pickUser : SelectionSet User Api.Interface.User
pickUser =
    SelectionSet.map User Api.Interface.User.username


view : Model -> Document Msg
view model =
    { title = "Loa Programming Language"
    , body =
        [ toUnstyled
            (DesignSystem.View.reset
                [ viewHeader model
                , viewPage model
                ]
            )
        ]
    }


viewHeader : Model -> Html Msg
viewHeader model =
    div
        [ css
            [ displayFlex
            , flexDirection row
            , justifyContent spaceBetween
            , alignItems center
            , backgroundColor DesignSystem.Color.primary
            , color DesignSystem.Color.background
            ]
        ]
        [ div []
            [ a [ href (Router.url Router.StorefrontRoute) ] [ text "Home" ]
            ]
        , viewProfileMenu model
        ]


viewProfileMenu : Model -> Html Msg
viewProfileMenu model =
    case model.session of
        Session.Loading ->
            DesignSystem.View.loading

        Session.SignedOut ->
            div []
                [ button
                    [ onClick ToggleSessionForm ]
                    [ text "Sign In" ]
                , DesignSystem.View.dropdown model.sessionFormExpanded
                    ToggleSessionForm
                    [ div
                        [ css
                            [ padding (px 10)
                            ]
                        ]
                        [ case model.sessionForm of
                            Session.SignIn form ->
                                Html.form
                                    [ onSubmit (SignInRequested form)
                                    , css
                                        [ Css.property "display" "grid"
                                        , flexDirection column
                                        , Css.property "gap" "5px"
                                        ]
                                    ]
                                    ([ DesignSystem.Input.string
                                        "Username"
                                        (Session.SignInForm.setUsernameOrEmail form >> Session.SignIn >> SessionFormUpdated)
                                        form.usernameOrEmail
                                     , DesignSystem.Input.password
                                        "Password"
                                        (Session.SignInForm.setPassword form >> Session.SignIn >> SessionFormUpdated)
                                        form.password
                                     ]
                                        ++ viewErrors model.sessionFormErrors
                                        ++ [ DesignSystem.View.linkButton
                                                (model.sessionForm |> Session.switchForms |> SessionFormUpdated)
                                                (text "Don't have an account? Sign up instead.")
                                           , DesignSystem.View.submitButton (SignInRequested form) (text "Sign In")
                                           ]
                                    )

                            Session.SignUp form ->
                                Html.form
                                    [ onSubmit (SignUpRequested form)
                                    , css
                                        [ Css.property "display" "grid"
                                        , flexDirection column
                                        , Css.property "gap" "5px"
                                        ]
                                    ]
                                    ([ DesignSystem.Input.string
                                        "Username"
                                        (Session.SignUpForm.setUsername form >> Session.SignUp >> SessionFormUpdated)
                                        form.username
                                     , DesignSystem.Input.email
                                        "Email"
                                        (Session.SignUpForm.setEmail form >> Session.SignUp >> SessionFormUpdated)
                                        form.email
                                     , DesignSystem.Input.password
                                        "Password"
                                        (Session.SignUpForm.setPassword form >> Session.SignUp >> SessionFormUpdated)
                                        form.password
                                     , DesignSystem.Input.password
                                        "Confirm Password"
                                        (Session.SignUpForm.setConfirmPassword form >> Session.SignUp >> SessionFormUpdated)
                                        form.confirmPassword
                                     ]
                                        ++ viewErrors model.sessionFormErrors
                                        ++ [ DesignSystem.View.linkButton
                                                (model.sessionForm |> Session.switchForms |> SessionFormUpdated)
                                                (text "Already have an account? Sign in instead.")
                                           , DesignSystem.View.submitButton
                                                (SignUpRequested form)
                                                (text "Sign Up")
                                           ]
                                    )
                        ]
                    ]
                ]

        Session.SignedIn user ->
            div
                []
                [ button
                    [ css
                        [ displayFlex
                        , flexDirection row
                        , alignItems center
                        ]
                    , type_ "button"
                    , onClick ToggleSessionForm
                    ]
                    [ div [ css [ marginRight (px 10) ] ] [ user.name |> Maybe.withDefault user.username |> text ]
                    , DesignSystem.View.avatar 30 user
                    ]
                , DesignSystem.View.dropdown model.sessionFormExpanded
                    ToggleSessionForm
                    [ a
                        [ href (Router.url (Router.UserRoute user.username))
                        ]
                        [ text "Profile" ]
                    , button [ onClick SignOutRequested ] [ text "Sign Out" ]
                    ]
                ]


viewErrors : List String -> List (Html Msg)
viewErrors errors =
    List.map viewError errors


viewError : String -> Html Msg
viewError message =
    div [ css [ color DesignSystem.Color.danger ] ]
        [ DesignSystem.Text.bodyS (text message)
        ]


viewPage : Model -> Html Msg
viewPage model =
    Page.view model.page |> Html.map PageMsg
