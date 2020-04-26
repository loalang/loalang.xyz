module Session.SignInForm exposing (..)


type alias SignInForm =
    { usernameOrEmail : String
    , password : String
    }


init : SignInForm
init =
    { usernameOrEmail = ""
    , password = ""
    }


setUsernameOrEmail : SignInForm -> String -> SignInForm
setUsernameOrEmail form value =
    { form | usernameOrEmail = value }


setPassword : SignInForm -> String -> SignInForm
setPassword form value =
    { form | password = value }
