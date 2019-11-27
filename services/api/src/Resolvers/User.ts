import LoggedInUser from "../Authentication/LoggedInUser";

export default abstract class User {
  abstract asLoggedIn(): LoggedInUser | null;
}

export class GuestUser extends User {
  asLoggedIn() {
    return null;
  }
}
