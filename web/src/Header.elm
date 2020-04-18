module Header exposing (Model, Msg, init, update, view)

import Api
import Api.Object as Object
import Api.Object.User as User
import Api.Query as Query
import Css exposing (..)
import DesignSystem.Color
import Graphql.Http
import Graphql.Operation exposing (RootQuery)
import Graphql.SelectionSet as SelectionSet exposing (SelectionSet)
import Html.Styled exposing (..)
import Html.Styled.Attributes exposing (..)


type Model
    = Loading
    | SignedIn User
    | NotSignedIn
    | Error String


type alias User =
    { username : String
    }


type Msg
    = GotResponse (Result (Graphql.Http.Error (Maybe User)) (Maybe User))


query : SelectionSet (Maybe User) RootQuery
query =
    Query.me user


user : SelectionSet User Object.User
user =
    SelectionSet.map User
        User.username


init : ( Model, Cmd Msg )
init =
    ( Loading, Api.request query GotResponse )


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

                    SignedIn u ->
                        [ text u.username ]

                    NotSignedIn ->
                        [ text "Sign in!" ]

                    Error string ->
                        [ text string ]
                )
            ]
        ]


viewLink : String -> List (Html Msg) -> Html Msg
viewLink path children =
    a [ href path ] children


update : Msg -> Model -> ( Model, Cmd Msg )
update msg model =
    case msg of
        GotResponse (Ok (Just u)) ->
            ( SignedIn u, Cmd.none )

        GotResponse (Ok Nothing) ->
            ( NotSignedIn, Cmd.none )

        _ ->
            ( model, Cmd.none )
