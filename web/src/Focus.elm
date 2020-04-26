module Focus exposing (Focusable(..), do, focusableAs)

import Browser.Dom as Dom exposing (Error)
import Html.Styled as Html
import Html.Styled.Attributes exposing (id)
import Task exposing (Task)


type Focusable
    = SignInForm


focusableAs : Focusable -> Html.Attribute msg
focusableAs =
    idOf >> id


idOf : Focusable -> String
idOf focusable =
    case focusable of
        SignInForm ->
            "sign-in-form"


do : msg -> Focusable -> Cmd msg
do msg =
    idOf >> Dom.focus >> Task.attempt (\_ -> msg)
