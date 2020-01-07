import LoggedInUser from "../Authentication/LoggedInUser";
import Package from "./Package";
import Context from "../Context";
import Notebook from "./Notebook";

export default abstract class User {
  abstract isLoggedIn(): this is LoggedInUser;
  abstract packages(args: {}, context: Context): Promise<Package[]>;

  async notebooks({}: {}, { notebooks }: Context): Promise<Notebook[]> {
    if (!this.isLoggedIn()) {
      return [];
    }

    return notebooks.getNotebooksBy(this);
  }
}

export class GuestUser extends User {
  isLoggedIn(): this is LoggedInUser {
    return false;
  }

  async packages() {
    return [];
  }
}
