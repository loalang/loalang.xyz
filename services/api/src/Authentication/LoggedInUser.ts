import User from "../Resolvers/User";
import Context from "../Context";

export default class LoggedInUser extends User {
  constructor(public readonly id: string, public readonly email: string) {
    super();
  }

  isLoggedIn(): this is LoggedInUser {
    return true;
  }

  packages({}: {}, { pkg }: Context) {
    return pkg.packagesOwnedBy(this);
  }
}
