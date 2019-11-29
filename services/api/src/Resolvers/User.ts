import LoggedInUser from "../Authentication/LoggedInUser";
import Package from "./Package";
import Context from "../Context";

export default abstract class User {
  abstract isLoggedIn(): this is LoggedInUser;
  abstract packages(args: {}, context: Context): Promise<Package[]>;
}

export class GuestUser extends User {
  isLoggedIn(): this is LoggedInUser {
    return false;
  }

  async packages() {
    return [];
  }
}
