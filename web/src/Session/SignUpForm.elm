module Session.SignUpForm exposing (..)


type alias SignUpForm =
    { username : String
    , email : String
    , password : String
    , confirmPassword : String
    }


init : SignUpForm
init =
    { username = ""
    , email = ""
    , password = ""
    , confirmPassword = ""
    }


setUsername : SignUpForm -> String -> SignUpForm
setUsername form value =
    { form | username = value }


setEmail : SignUpForm -> String -> SignUpForm
setEmail form value =
    { form | email = value }


setPassword : SignUpForm -> String -> SignUpForm
setPassword form value =
    { form | password = value }


setConfirmPassword : SignUpForm -> String -> SignUpForm
setConfirmPassword form value =
    { form | confirmPassword = value }
