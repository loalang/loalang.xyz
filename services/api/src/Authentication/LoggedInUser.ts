import User from "../Resolvers/User";

export default class LoggedInUser extends User {
  constructor(public readonly id: string, public readonly email: string) {
    super();
  }

  asLoggedIn() {
    return this;
  }
}
