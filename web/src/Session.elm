module Session exposing (Session(..), SessionForm(..), User, init, performSignIn, performSignOut, performSignUp, signIn, signOut, switchForms, updateUser)

import Api
import Api.Mutation
import Api.Object
import Api.Object.Image
import Api.Object.Me
import Api.Object.NotMe
import Api.Query
import Graphql.SelectionSet as SelectionSet exposing (SelectionSet)
import Session.SignInForm
import Session.SignUpForm
import Url exposing (Url)


type Session
    = Loading
    | SignedOut
    | SignedIn User


type SessionForm
    = SignIn Session.SignInForm.SignInForm
    | SignUp Session.SignUpForm.SignUpForm


init : Url -> (Session -> msg) -> ( Session, Cmd msg )
init url onSession =
    ( Loading
    , Api.makeQuery url
        (Api.Query.me selectMe)
        (\result ->
            case result of
                Ok (Just u) ->
                    onSession (SignedIn u)

                _ ->
                    onSession SignedOut
        )
    )


selectMe : SelectionSet User Api.Object.Me
selectMe =
    SelectionSet.map4 User
        Api.Object.Me.username
        Api.Object.Me.email
        Api.Object.Me.name
        (Api.Object.Me.avatar selectImage)


selectImage : SelectionSet Image Api.Object.Image
selectImage =
    SelectionSet.map3 Image
        Api.Object.Image.large
        Api.Object.Image.medium
        Api.Object.Image.small


signIn : Session -> User -> Session
signIn _ =
    SignedIn


signOut : Session -> Session
signOut _ =
    SignedOut


type alias User =
    { username : String
    , email : String
    , name : Maybe String
    , avatar : Maybe Image
    }


type alias Image =
    { large : String
    , medium : String
    , small : String
    }


performSignIn : Url -> (Result (List String) Session -> msg) -> Session.SignInForm.SignInForm -> Cmd msg
performSignIn url onSession form =
    Api.performMutation url
        (Api.Mutation.signIn
            { usernameOrEmail = form.usernameOrEmail
            , password = form.password
            }
            selectMe
        )
        (handleMutationResult onSession)


performSignUp : Url -> (Result (List String) Session -> msg) -> Session.SignUpForm.SignUpForm -> Cmd msg
performSignUp url onSession form =
    Api.performMutation url
        (Api.Mutation.signUp
            { username = form.username
            , email = form.email
            , password = form.password
            }
            selectMe
        )
        (handleMutationResult onSession)


performSignOut : Url -> (Result (List String) Session -> msg) -> Cmd msg
performSignOut url onSession =
    Api.performMutation url
        (Api.Mutation.signOut
            selectSignedOut
        )
        (\result ->
            case result of
                Ok _ ->
                    SignedOut |> Ok |> onSession

                Err error ->
                    error |> Err |> onSession
        )


selectSignedOut : SelectionSet () Api.Object.NotMe
selectSignedOut =
    SelectionSet.map (\_ -> ())
        Api.Object.NotMe.username


handleMutationResult : (Result (List String) Session -> msg) -> Result (List String) (Maybe User) -> msg
handleMutationResult onSession result =
    case result of
        Ok (Just u) ->
            u |> SignedIn |> Ok |> onSession

        Ok Nothing ->
            SignedOut |> Ok |> onSession

        Err error ->
            error |> Err |> onSession


switchForms : SessionForm -> SessionForm
switchForms form =
    case form of
        SignIn { usernameOrEmail, password } ->
            let
                new =
                    Session.SignUpForm.init
            in
            SignUp { new | username = usernameOrEmail, password = password }

        SignUp { username, password } ->
            let
                new =
                    Session.SignInForm.init
            in
            SignIn { new | usernameOrEmail = username, password = password }


updateUser : Session -> { user | username : String, name : Maybe String } -> Session
updateUser session { username, name } =
    case session of
        SignedIn user ->
            SignedIn { user | username = username, name = name }

        _ ->
            session
