import LoggedInUser from "../Authentication/LoggedInUser";

export default abstract class User {
  abstract isLoggedIn(): this is LoggedInUser;
}

export class GuestUser extends User {
  isLoggedIn(): this is LoggedInUser {
    return false;
  }
}
