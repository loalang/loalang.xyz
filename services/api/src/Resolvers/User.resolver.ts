import Context from "../Context";

export default {
  Query: {
    me(_: any, __: any, { user }: Context) {
      return user.asLoggedIn();
    }
  },
  Mutation: {
    async register(
      _: any,
      { email, password }: { email: string; password: string },
      { auth }: Context
    ) {
      const user = await auth.register(email, password);
      if (user != null) {
        return user.asLoggedIn();
      }
      return null;
    },
    async login(
      _: any,
      { email, password }: { email: string; password: string },
      { auth }: Context
    ) {
      const user = await auth.login(email, password);
      if (user != null) {
        return user.asLoggedIn();
      }
      return null;
    }
  }
};
